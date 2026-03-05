import chalk from 'chalk';
import ora from 'ora';
import fetch from 'node-fetch';

export async function registryCommand({ id, api }) {
  const spinner = ora('  Fetching registry...').start();

  try {
    const url = id ? `${api}/api/registry?id=${id}` : `${api}/api/registry`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      spinner.fail(chalk.red(data.error));
      process.exit(1);
    }

    spinner.stop();

    // Single agent
    if (id) {
      console.log(chalk.green(`\n  Agent: ${data.name} (${data.id})\n`));
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    // Full registry
    console.log(chalk.green(`\n  ClawMesh Registry — ${data.total} agents registered\n`));

    data.registry.forEach((agent, i) => {
      console.log(
        chalk.white.bold(`  ${agent.name}`) +
        chalk.gray(` · ${agent.agent_id} · v${agent.version}`)
      );
      console.log(chalk.gray(`  ${agent.description || ''}`));
      console.log(chalk.gray(`  ${agent.protocols?.join(' · ')}`));
      console.log('');
    });

    console.log(chalk.gray(`  View full registry: ${chalk.cyan(`${api}/registry`)}\n`));

  } catch (e) {
    spinner.fail(chalk.red(`Network error: ${e.message}`));
    process.exit(1);
  }
}
