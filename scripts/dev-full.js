import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const processes = [
  { name: "api", args: ["run", "dev:api"] },
  { name: "web", args: ["run", "dev"] },
];

function startProcess({ name, args }) {
  const child = spawn(npmCommand, args, {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} stopped with exit code ${code}`);
      stopAll();
      process.exit(code);
    }
  });

  return child;
}

const children = processes.map(startProcess);

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});
