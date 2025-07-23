import fs from "fs";
import { join } from "path";

import { Proxy } from "./lib";
import { parseProxy } from "./proxyUtils";

export const currentPath = () => {
  const path = process.cwd();
  return path === "/" ? "." : path;
};

const loadFileLines = (filePath: string): string[] => {
  try {
    if (typeof filePath !== 'string') {
      console.error('Invalid file path provided.');
      return [];
    }
    return fs
      .readFileSync(filePath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

export function loadUserAgents(): string[] {
  return loadFileLines(join(currentPath(), "data/uas.txt"));
}

const getTorProxies = (): Proxy[] => {
  const torProxies: Proxy[] = [];
  const torInstancesEnv = process.env.TOR_INSTANCES;
  
  if (process.env.NODE_ENV === "production" && torInstancesEnv) {
    const torInstances = parseInt(torInstancesEnv, 10);
    if (!isNaN(torInstances)) {
      for (let i = 0; i < torInstances; i++) {
        torProxies.push({
          host: "multitor",
          port: 9050 + i,
          protocol: "socks5",
        });
      }
    }
  }
  return torProxies;
}

export function loadProxies(): Proxy[] {
  const proxyLines = loadFileLines(join(currentPath(), "data/proxies.txt"));
  const fileProxies = proxyLines.map(parseProxy).filter((p): p is Proxy => p !== null);
  const torProxies = getTorProxies();

  return [...torProxies, ...fileProxies];
}
