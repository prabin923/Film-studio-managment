import { execSync } from "node:child_process";

for (const port of [3000, 3001]) {
  try {
    execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: "ignore" });
  } catch {
    // no process on this port
  }
}
