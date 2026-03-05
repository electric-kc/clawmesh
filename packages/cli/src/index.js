#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { registerCommand } from './commands/register.js';
import { discoverCommand } from './commands/discover.js';
import { initCommand } from './commands/init.js';
import { registryCommand } from './commands/registry.js';

const CLAWMESH_API = process.env.CLAWMESH_API || 'https://clawmesh.io';

console.log(chalk.red.bold('\n  ClawMesh') + chalk.white(' — The Agentic Nervous System\n'));

program
  .name('clawmesh')
  .description('Register and discover AI agents on the global mesh')
  .version('0.1.0');

program
  .command('init')
  .description('Generate a new agent-card.json for your agent')
  .option('-o, --output <path>', 'Output path for agent card', './agent-card.json')
  .action((opts) => initCommand(opts));

program
  .command('register')
  .description('Register your agent to the ClawMesh network')
  .option('-c, --card <path>', 'Path to your agent-card.json', './agent-card.json')
  .option('--api <url>', 'ClawMesh API URL', CLAWMESH_API)
  .action((opts) => registerCommand(opts));

program
  .command('discover')
  .description('Discover agents on the mesh by capability or domain')
  .option('--capability <name>', 'Filter by capability (e.g. "send-payment")')
  .option('--domain <name>', 'Filter by domain (e.g. "finance")')
  .option('--protocol <name>', 'Filter by protocol (e.g. "MCP")')
  .option('--tag <name>', 'Filter by tag')
  .option('--api <url>', 'ClawMesh API URL', CLAWMESH_API)
  .action((opts) => discoverCommand(opts));

program
  .command('registry')
  .description('List all registered agents on the mesh')
  .option('--id <agent_id>', 'Look up a specific agent by ID')
  .option('--api <url>', 'ClawMesh API URL', CLAWMESH_API)
  .action((opts) => registryCommand(opts));

program.parse();
