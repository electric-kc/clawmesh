import chalk from 'chalk';
import ora from 'ora';
import fetch from 'node-fetch';

export async function discoverCommand({ capability, domain, protocol, tag, api }) {
  const params = new URLSearchParams();
  if (capability) params.set('capability', capability);
  if (domain) params.set('domain', domain);
  if (protocol) params.set('protocol', protocol);
  if (tag) params.set('tag', tag);

  const spinner = ora('  Searching the mesh...').start();

  try {
    const res = await fetch(`${api}/api/discover?${params}`);
    const data = await res.json();

    if (!res.ok) {
      spinner.fail(chalk.red(`Discovery failed: ${data.error}`));
      process.exit(1);
    }

    spinner.stop();

    if (data.count === 0) {
      console.log(chalk.yellow(`\n  No agents found matching your query.\n`));
      return;
    }

    console.log(chalk.green(`\n  Found ${data.count} agent${data.count !== 1 ? 's' : ''} on the mesh:\n`));

    data.agents.forEach((agent, i) => {
      const trustColor = agent.trust_level >= 2 ? chalk.green : chalk.yellow;
      console.log(chalk.white.bold(`  ${i + 1}. ${agent.name}`) + chalk.gray(` (${agent.agent_id})`));
      console.log(chalk.gray(`     ${agent.description || 'No description'}`));
      console.log(chalk.gray(`     Protocols: ${agent.protocols?.join(', ')}`));
      console.log(chalk.gray(`     Capabilities: ${agent.capabilities?.map(c => c.id).join(', ')}`));
      console.log(trustColor(`     Trust Level: ${agent.trust_level}/4`));
      console.log('');
    });

  } catch (e) {
    spinner.fail(chalk.red(`Network error: ${e.message}`));
    process.exit(1);
  }
}
