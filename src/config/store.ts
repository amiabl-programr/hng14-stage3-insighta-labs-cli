import fs from "fs";
import path from "path";
import os from "os";

const configDir = path.join(os.homedir(), ".insighta");
const configFile = path.join(configDir, "credentials.json");


export interface Config {
  accessToken?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export function saveConfig(data: Config): void {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configFile, JSON.stringify(data, null, 2), {
    encoding: "utf-8",
    // mode: 0o600, // add this later, so only the owner can read/write files
  });
}

export function getConfig(): Config | null {
  if (!fs.existsSync(configFile)) return null;

  const raw = fs.readFileSync(configFile, { encoding: "utf-8" });

  try {
    return JSON.parse(raw) as Config;
  } catch {
    return null; 
  }
}

export function clearConfig(): void {
  if (fs.existsSync(configFile)) {
    fs.unlinkSync(configFile);
  }
}