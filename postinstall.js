#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const LIBRARY_NAME = process.env.npm_package_name;
const EXEC_DIR = process.argv.slice(2)[process.argv.slice(2).indexOf("--init-dir") + 1];

const initEnv = async () => {
  let envFileContents = fs.readFileSync(path.resolve(EXEC_DIR, `node_modules/${LIBRARY_NAME}/env.json`), 'utf8');
  let projectEnvFileContents = fs.readFileSync(path.resolve(EXEC_DIR, `src/config/config.json`), 'utf8');
  envFileContents = JSON.parse(envFileContents);
  projectEnvFileContents = JSON.parse(projectEnvFileContents);

  // If public package then read other then organisation name key
  const configKey = LIBRARY_NAME.split('/')[1].toUpperCase();
  if (projectEnvFileContents[configKey]) {
    Object.keys(envFileContents).map(key => {
      if (!projectEnvFileContents[configKey][key])
        projectEnvFileContents[configKey][key] = envFileContents[key];
    });
  } else {
    projectEnvFileContents[configKey] = envFileContents;
  }

  fs.writeFileSync(path.resolve(EXEC_DIR, `src/config/config.json`), JSON.stringify(projectEnvFileContents, null, 2), 'utf8');
}

initEnv();