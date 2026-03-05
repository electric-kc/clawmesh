import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export async function registerCommand({ card: cardPath, api }) {
  const fullPath = path.resolve(cardPath);

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`\n  ✗ No agent card found at ${fullPath}`));
    console.log(chalk.white(`  Run ${chalk.cyan('npx clawmesh init')} first.\n`));
    process.exit(1);
  }

  let card;
  try {
    card = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (e) {
    console.log(chalk.red(`\n  ✗ Failed to parse ${fullPath}: ${e.message}\n`));
    process.exit(1);
  }

  const spinner = ora(`  Registering ${chalk.bold(card.name)} to ClawMesh...`).start();

  try {
    const res = await fetch(`${api}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });

    const data = await res.json();

    if (!res.ok) {
      spinner.fail(chalk.red(`Registration failed: ${data.error}`));
      process.exit(1);
    }

    spinner.succeed(chalk.green(`Agent registered successfully!`));
    console.log(chalk.white(`\n  Agent ID:   ${chalk.cyan(card.id)}`));
    console.log(chalk.white(`  Registry:   ${chalk.cyan(data.registry_url)}`));
    console.log(chalk.white(`\n  Your agent is now discoverable on the ClawMesh network.\n`));

  } catch (e) {
    spinner.fail(chalk.red(`Network error: ${e.message}`));
    process.exit(1);
  }
}
