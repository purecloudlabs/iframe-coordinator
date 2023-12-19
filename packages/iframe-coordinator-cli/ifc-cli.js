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

  app = express();
  app.use(/^\/$/, serveIndex(indexContent));
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

  program
    .option(
      "-f, --config-file <file>",
      "iframe client configuration file",
      defaultJsConfig,
    )
    .option("-p, --port <port_num>", "port number to host on", 3000)
    .option("-s, --ssl", "serve over https")
    .option("--ssl-cert <cert_path>", "certificate file to use for https")
    .option("--ssl-key <key_path>", "key file to use for https");
  program.on("--help", showHelpText);

  program.parse(process.argv);

  const options = program.opts();

  return {
    clientConfigFile: findConfigFile(options.configFile),
    port: options.port,
    ssl: options.ssl,
    sslCert: options.sslCert,
    sslKey: options.sslKey,
  };
}

function showHelpText() {
  const configExample = path.join(__dirname, "example-ifc.config.js");
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
  `);
  console.log(fs.readFileSync(configExample).toString());
}

function serveIndex(indexContent) {
  return function (req, res) {
    res.send(indexContent);
  };
}

function generateIndex(appPath, clientConfigFile) {
  const baseIndex = fs
    .readFileSync(path.join(appPath, "index.html"))
    .toString();
  const $ = cheerio.load(baseIndex);
  $("head").append(configScript(clientConfigFile));
  return $.html();
}

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

// Make sure a path isn't interpreted as a module when required.
function relativizePath(inPath) {
  let outPath = path.relative(process.cwd(), inPath);
  if (!outPath.startsWith(".")) {
    outPath = "./" + outPath;
  }
  return outPath;
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
