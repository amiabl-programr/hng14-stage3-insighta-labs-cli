import ora from "ora";
import chalk from "chalk";

// ── Spinner ───────────────────────────────────────────────────────────────────

/**
 * Run an async task wrapped in a spinner.
 *
 * @param {string} text   Loading message
 * @param {() => Promise<T>} task
 * @returns {Promise<T>}
 */
export async function withSpinner(text, task) {
  const spinner = ora({ text, color: "cyan" }).start();
  try {
    const result = await task();
    spinner.succeed(chalk.green("Done"));
    return result;
  } catch (error) {
    spinner.fail(chalk.red(error.message));
    process.exit(1);
  }
}

// ── Table ─────────────────────────────────────────────────────────────────────

/**
 * Print a simple aligned table to stdout.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {string[]} [columns] Optional subset / order of columns
 */
export function printTable(rows, columns) {
  if (!rows || rows.length === 0) {
    console.log(chalk.yellow("No data to display."));
    return;
  }

  const cols = columns ?? Object.keys(rows[0]);

  // Calculate column widths (header vs data)
  const widths = Object.fromEntries(
    cols.map((col) => [
      col,
      Math.max(
        col.length,
        ...rows.map((r) => String(r[col] ?? "").length)
      ),
    ])
  );

  const separator = cols.map((c) => "─".repeat(widths[c] + 2)).join("┼");
  const header = cols
    .map((c) => ` ${chalk.bold.cyan(c.padEnd(widths[c]))} `)
    .join("│");

  console.log(`┌${separator.replace(/┼/g, "┬")}┐`);
  console.log(`│${header}│`);
  console.log(`├${separator}┤`);

  for (const row of rows) {
    const line = cols
      .map((c) => ` ${String(row[c] ?? "").padEnd(widths[c])} `)
      .join("│");
    console.log(`│${line}│`);
  }

  console.log(`└${separator.replace(/┼/g, "┴")}┘`);
}

// ── Error helper ──────────────────────────────────────────────────────────────

export function printError(message) {
  console.error(chalk.red(`✖  ${message}`));
}

export function printSuccess(message) {
  console.log(chalk.green(`✔  ${message}`));
}

export function printInfo(message) {
  console.log(chalk.cyan(`ℹ  ${message}`));
}