#!/usr/bin/env node

import { Command } from 'commander';
import { input } from '@inquirer/prompts';

const program = new Command();

program
  .name('insighta-cli')
  .description('CLI to interact with Insighta Labs API')
  .version('1.0.0');

program
  .command('greet')
  .description('Greet a user')
  .action(async () => {
    const answer = await input({ message: 'What is your name?' });
    console.log(`Hello, ${answer}!`);
  });

program.parse(process.argv);

// Exporting for tests
export const greet = (name: string) => `Hello, ${name}!`;
