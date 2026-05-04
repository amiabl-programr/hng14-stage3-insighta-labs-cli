import chalk from 'chalk';
import { completeLogin } from '../lib/api.js';
import { getCredentials } from '../config/store.js';
import { withSpinner, printSuccess, printInfo } from '../lib/ui.js';
import type { Command } from 'commander';

export function registerLogin(program: Command) {
  program
    .command('login')
    .description('Authenticate with GitHub OAuth')
    .action(async () => {
      const existing = getCredentials();
      if (existing) {
        printInfo('Already logged in.');
        return;
      }

      await withSpinner('Opening GitHub login in browser...', () => completeLogin());

      printSuccess('Login successful!');
      console.log(chalk.dim('  Credentials stored at ~/.insighta/credentials.json'));
    });
}
