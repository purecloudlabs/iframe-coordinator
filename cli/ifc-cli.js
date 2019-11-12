#!/usr/bin/env node

const commander = require('commander');
const program = new commander.Command();
const fs = require('fs');
const path = require('path');
const findRoot = require('find-root');
const express = require('express');
const cheerio = require('cheerio');

const appPath = path.join(__dirname, './embedded-app/dist/');

main();

// MAIN
function main() {
  const opts = parseProgramOptions();
  const indexContent = generateIndex(appPath, opts.clientConfigFile);

  app = express();
  app.use(/^\/$/, serveIndex(indexContent));
  app.use(express.static(appPath));
  console.log(`Listening on port ${opts.port}...`);
  app.listen(opts.port);
}

// HELPER FUNCTIONS

function parseProgramOptions() {
  const projRoot = findRoot(process.cwd());
  const defaultJsConfig = path.join(projRoot, 'ifc-cli.config.js');

  program
    .option(
      '-f, --config-file <file>',
      'iframe client configuration file',
      defaultJsConfig
    )
    .option('-p, --port <port_num>', 'port number to host on', 3000);
  program.on('--help', showHelpText);

  program.parse(process.argv);

  return {
    clientConfigFile: findConfigFile(program.configFile),
    port: program.port
  };
}

function showHelpText() {
  const configExample = path.join(__dirname, 'example-ifc.config.js');
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
  return function(req, res) {
    res.send(indexContent);
  };
}

function generateIndex(appPath, clientConfigFile) {
  const baseIndex = fs
    .readFileSync(path.join(appPath, 'index.html'))
    .toString();
  const $ = cheerio.load(baseIndex);
  $('head').append(configScript(clientConfigFile));
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

// Make sure a path isn't interpreted as a module when required.
function relativizePath(inPath) {
  let outPath = path.relative(process.cwd(), inPath);
  if (!outPath.startsWith('.')) {
    outPath = './' + outPath;
  }
  return outPath;
}
