#!/usr/bin/env node
import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from "module";

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const version = getProjectVersion();
const workspaces = getWorkspaceDirs();

updateWorkspaceVersions(workspaces, version);


function updateWorkspaceVersions(workspaceDirs, version) {
    workspaceDirs.forEach((dir) => {
        execSync(`npm version ${version}`, {cwd: dir});
    })
}

function getWorkspaceDirs() {
    const packages = readdirSync(path.join(projectDir, 'packages'));
    const packagesDirs = packages.map((dir) => {
        return path.join(projectDir, `packages/${dir}`)
    })
    const apps = readdirSync(path.join(projectDir, 'apps'));
    const appsDir = apps.map((dir) => {
        return path.join(projectDir, `apps/${dir}`)
    })
    return packagesDirs.concat(appsDir);
}

function getProjectVersion() {
    const require = createRequire(import.meta.url);
    const version = require(path.join(projectDir, 'package.json')).version;
    return version;
}