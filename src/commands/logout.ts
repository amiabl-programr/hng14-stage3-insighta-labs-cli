import chalk from 'chalk';
import { logout } from '../lib/api.js';
import { getCredentials } from '../config/store.js';
import { withSpinner, printSuccess, printInfo } from '../lib/ui.js';
import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';

export function registerLogout(program: Command) {
  program
    .command('logout')
    .description('Sign out and remove stored credentials')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (options: { force?: boolean }) => {
      const creds = getCredentials();

      if (!creds) {
        printInfo('You are not currently logged in.');
        return;
      }

      const user = creds.user;
      const displayName = user?.username || user?.email || 'current user';

      if (!options.force) {
        const confirmed = await confirm({
          message: `Log out ${chalk.bold(displayName)}?`,
          default: true,
        });
        if (!confirmed) {
          printInfo('Logout cancelled.');
          return;
        }
      }

      await withSpinner('Signing out…', () => logout());

      printSuccess('Logged out successfully.');
      console.log(chalk.dim('  Local credentials have been removed.'));
    });
}
