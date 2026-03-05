import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export async function initCommand({ output }) {
  console.log(chalk.cyan('  Generating your Agent Card...\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Agent ID (e.g. agent_myagent_001):',
      validate: (v) => /^agent_[a-z0-9_]+$/.test(v) || 'Format: agent_name_001 (lowercase, underscores)'
    },
    {
      type: 'input',
      name: 'name',
      message: 'Agent name:',
      validate: (v) => v.length > 0 || 'Required'
    },
    {
      type: 'input',
      name: 'version',
      message: 'Version:',
      default: '1.0.0'
    },
    {
      type: 'input',
      name: 'description',
      message: 'What does your agent do?'
    },
    {
      type: 'input',
      name: 'owner',
      message: 'Owner (your domain or wallet address):'
    },
    {
      type: 'input',
      name: 'endpoint',
      message: 'Agent endpoint URL:',
      validate: (v) => v.startsWith('http') || 'Must be a valid URL'
    },
    {
      type: 'checkbox',
      name: 'protocols',
      message: 'Supported protocols:',
      choices: ['MCP', 'A2A', 'ACP', 'REST', 'JSON-RPC', 'WebSocket'],
      default: ['REST']
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Tags (comma-separated, e.g. finance,payments):',
      filter: (v) => v.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    }
  ]);

  // Build capability interactively
  console.log(chalk.cyan('\n  Add capabilities (what can your agent do?)\n'));
  
  const capabilities = [];
  let addMore = true;

  while (addMore) {
    const cap = await inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: '  Capability ID (e.g. send-payment):',
        validate: (v) => v.length > 0 || 'Required'
      },
      {
        type: 'input',
        name: 'domain',
        message: '  Domain (e.g. finance, research, dev):',
        validate: (v) => v.length > 0 || 'Required'
      },
      {
        type: 'input',
        name: 'description',
        message: '  Description:',
        validate: (v) => v.length > 0 || 'Required'
      },
      {
        type: 'confirm',
        name: 'addAnother',
        message: '  Add another capability?',
        default: false
      }
    ]);

    capabilities.push({
      id: cap.id,
      domain: cap.domain,
      description: cap.description
    });

    addMore = cap.addAnother;
  }

  const card = {
    $schema: 'https://clawmesh.io/agent-card/v1',
    id: answers.id,
    name: answers.name,
    version: answers.version,
    description: answers.description,
    owner: answers.owner,
    endpoint: answers.endpoint,
    protocols: answers.protocols,
    capabilities,
    feeds: [],
    auth: { type: 'none' },
    trust: { level: 0, verified: false, signed_by: null, signature: null },
    tags: answers.tags,
    registered_at: new Date().toISOString()
  };

  const outputPath = path.resolve(output);
  fs.writeFileSync(outputPath, JSON.stringify(card, null, 2));

  console.log(chalk.green(`\n  ✓ Agent card saved to ${outputPath}`));
  console.log(chalk.white(`\n  Next: ${chalk.cyan('npx clawmesh register')}\n`));
}
