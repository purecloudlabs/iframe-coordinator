#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();
const fs = require("fs");
const path = require("path");
const findRoot = require("find-root");
const express = require("express");
const cheerio = require("cheerio");
const https = require("https");
const devCertAuthority = require("dev-cert-authority");
const { createProxyMiddleware } = require("http-proxy-middleware");

const appPath = path.join(__dirname, "./dist/");

main();

// MAIN
function main() {
  const opts = parseProgramOptions();
  const indexContent = generateIndex(appPath, opts.clientConfigFile);
  const configuredProxies = loadProxyConfig(opts.proxyConfigFile);

  app = express();
  // Serve our custom index file with injected frame-router config
  app.use(/^\/$/, serveIndex(indexContent));

  // Set up user configured proxies
  configuredProxies.forEach((proxy) => {
    app.use(
      proxy.path,
      createProxyMiddleware({
        target: proxy.target,
        ws: true, // proxy websockets too
        changeOrigin: true, // rewrite the origin header to avoid any potential CORS issues
        followRedirects: true, // ensure redirects from the server will also be proxied
      }),
    );
  });

  // Deprecated path-based dynamic proxy - to be removed in next major release
  app.use(
    "/proxy",
    createProxyMiddleware({
      router: extractTargetHost,
      pathRewrite: rewritePath,
      onError: (err, req, res) => {
        console.log("ERROR", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(err.message);
      },
      target: `http://localhost:${opts.port}`, //Required by middleware, but should be always overriden by the previous options
    }),
  );

  // Server the static Vue App assets
  app.use(express.static(appPath));

  if (opts.ssl) {
    const options = getSslOpts(opts.sslCert, opts.sslKey);
    https.createServer(options, app).listen(opts.port);
  } else {
    app.listen(opts.port);
  }

  const localhostUrl =
    (opts.ssl ? "https" : "http") + "://localhost:" + opts.port + "/";
  console.log(`Listening on port ${opts.port}...`);
  console.log(`Visit host app at: ${localhostUrl}`);
}

// HELPER FUNCTIONS

function parseProgramOptions() {
  const projRoot = findRoot(process.cwd());
  const defaultJsConfig = path.join(projRoot, "ifc-cli.config.js");
  const defaultProxyConfig = path.join(projRoot, "ifc-proxy.config.json");

  program
    .option(
      "-f, --config-file <file>",
      "iframe client configuration file",
      defaultJsConfig,
    )
    .option("-x -proxy-config <proxy_config_file>")
    .option("-p, --port <port_num>", "port number to host on", 3000)
    .option("-s, --ssl", "serve over https")
    .option("--ssl-cert <cert_path>", "certificate file to use for https")
    .option("--ssl-key <key_path>", "key file to use for https");
  program.on("--help", showHelpText);

  program.parse(process.argv);

  const options = program.opts();

  // Use a proxy config file from the default location as our fallback if needed
  let proxyConfigPath = null;
  if (options.proxyConfig) {
    proxyConfigPath = findConfigFile(options.proxyConfig);
  } else if (fs.existsSync(defaultProxyConfig)) {
    proxyConfigPath = defaultProxyConfig;
  }

  parsedOpts = {
    clientConfigFile: findConfigFile(options.configFile),
    proxyConfigFile: proxyConfigPath,
    port: options.port,
    ssl: options.ssl,
    sslCert: options.sslCert,
    sslKey: options.sslKey,
  };

  return parsedOpts;
}

function showHelpText() {
  const configExample = path.join(__dirname, "example-ifc.config.js");
  const configContent = fs.readFileSync(configExample).toString();
  console.log(`
  This program will start a server for a basic iframe-coordinator host app. In
  order to configure the frame-router element and any other custom logic needed
  in the host app, a config file must be provided which should assign a
  function to \`module.exports\` that will be passed the frame-router element
  as an input once it has been mounted. The function should return a config
  object with the following fields:

  - publishTopics: A list of messaging topics the client publishes on

  Keep in mind that the config file is not a true commonJS module, and
  will be evaluated directly inside the browser in an immediately invoked
  function expression.

  Here is an example config file:

  ${configContent}
  
  ifc-cli can also be configured to proxy requests to a local dev server or
  other server so that embedded apps appear on the same origin as the host.
  That configuration should be a json file mapping server paths to upstream
  targets, e.g.: 

  {
    "/my/app/": "http://localhost:8000/",
    "/another/app/": "http://localhost:9000/"
  } 
  `);
}

function serveIndex(indexContent) {
  return function (req, res) {
    res.send(indexContent);
  };
}

/**
 * Build the index file served to clients. This is the `index.html` from this project with the
 * user's configuration file injected into a script tag to enable frame router setup.
 */
function generateIndex(appPath, clientConfigFile) {
  const baseIndex = fs
    .readFileSync(path.join(appPath, "index.html"))
    .toString();
  const $ = cheerio.load(baseIndex);
  $("head").append(configScript(clientConfigFile));
  return $.html();
}

/**
 * Generate a script tag that exports the frame router setup function from the user's config file
 * as a global variable so that ifc-cli's host app can call it when creating the frame-router elemen
 * in the DOM
 */
function configScript(scriptFile) {
  const scriptContents = fs.readFileSync(scriptFile).toString();
  // This is a bit of a kludge but it should suffice for now.
  return `
<script type="text/javascript">
  (function () {
   let module = {};
   ${scriptContents}
   window.routerSetup = module.exports;
  })()
</script>
`;
}

// Find the configuration file
function findConfigFile(cliPath) {
  let configPath = relativizePath(cliPath);
  if (fs.existsSync(configPath)) {
    return configPath;
  } else {
    console.log(`No client configuration file found @ ${cliPath}.`);
    process.exit(1);
  }
}

function relativizePath(inPath) {
  let outPath = path.relative(process.cwd(), inPath);
  if (!outPath.startsWith(".")) {
    outPath = "./" + outPath;
  }
  return outPath;
}

function getSslOpts(certPath, keyPath) {
  if (!certPath || !keyPath) {
    return devCertAuthority("localhost");
  }
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
  } else {
    console.log(`Certificate files not found @ ${certPath}, and ${keyPath}`);
    process.exit(1);
  }
}

function loadProxyConfig(path) {
  if (!path) {
    return [];
  }

  const proxyConfig = JSON.parse(fs.readFileSync(path).toString());
  return Object.entries(proxyConfig).map(([path, target]) => {
    return {
      path,
      target,
    };
  });
}

function extractTargetHost(req) {
  return extractProxyUrl(req.path).origin;
}

function rewritePath(path) {
  return extractProxyUrl(path).pathname;
}

function extractProxyUrl(path) {
  const proxyPath = path.replace(/^\/proxy\//, "");
  let newUrl;
  try {
    newUrl = new URL(decodeURIComponent(proxyPath));
  } catch (e) {
    // It would be nice to failed more gracefully here and return a 500, but that doesn't
    // seem to be possible with the way the proxy middleware works.
    // See: https://github.com/chimurai/http-proxy-middleware/issues/411
    console.error(`
    **** INVALID URL IN PROXY PATH ****
        ${e.message}
        `);
    throw e;
  }
  return newUrl;
}
