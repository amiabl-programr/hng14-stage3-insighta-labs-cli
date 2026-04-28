#!/usr/bin/env node

import { Command } from 'commander';
import { input } from '@inquirer/prompts';

export const program = new Command();

program
  .name('insighta-cli')
  .description('CLI to interact with Insighta Labs API')
  .version('1.0.0');

program
  .command('greet')
  .description('Greet a user')
  .action(async () => {
    await input({ message: 'What is your name?' });
  });



export const greet = (name: string) => `Hello, ${name}!`;