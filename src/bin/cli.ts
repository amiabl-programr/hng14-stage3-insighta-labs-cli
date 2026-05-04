#!/usr/bin/env node

import { Command } from "commander";
import { registerLogin } from "./commands/login.js";
import { registerLogout } from "./commands/logout.js";
import { registerWhoami } from "./commands/whoami.js";

const program = new Command();

program
  .name("insighta")
  .description("Insighta CLI — manage your account and data from the terminal")
  .version("1.0.0");

registerLogin(program);
registerLogout(program);
registerWhoami(program);

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`\n✖  Unexpected error: ${err.message}`);
  process.exit(1);
});

program.parseAsync(process.argv);