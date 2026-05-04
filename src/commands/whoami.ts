import chalk from "chalk";
import { getStoredUser } from "../lib/api.js";
import { getCredentials, isTokenExpired } from "../config/store.js";
import { printTable, printError, printInfo } from "../lib/ui.js";
import type { Command } from "commander";

export function registerWhoami(program: Command) {
  program
    .command("whoami")
    .description("Display the currently authenticated user")
    .option("--json", "Output raw JSON instead of a table")
    .action(async (options: any) => {
      const creds = getCredentials();

      if (!creds) {
        printError("Not logged in. Run `insighta login` first.");
        process.exit(1);
      }

      if (isTokenExpired(creds) && !creds.refreshToken) {
        printError("Session expired. Run `insighta login` to re-authenticate.");
        process.exit(1);
      }

      const user = getStoredUser();

      if (options.json) {
        console.log(JSON.stringify(user || {}, null, 2));
        return;
      }

      console.log();
      printInfo(`Logged in\n`);

      const fields: Record<string, string> = {
        "Token expires": creds.expiresAt
          ? new Date(creds.expiresAt).toLocaleString()
          : "Never",
      };

      if (user) {
        fields["User ID"] = user.id || "—";
        fields.Username = user.username || "—";
        fields.Email = user.email || "—";
        fields.Role = user.role || "ANALYST";
      }

      const rows = Object.entries(fields).map(([Field, Value]) => ({
        Field,
        Value,
      }));

      printTable(rows, ["Field", "Value"]);
    });
}