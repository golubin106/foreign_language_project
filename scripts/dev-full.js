import { spawn } from "node:child_process";

const commands = [
  { name: "api", command: "npm run dev:api" },
  { name: "web", command: "npm run dev" },
];

let shuttingDown = false;

function startProcess({ name, command }) {
  const child = spawn(command, {
    stdio: "inherit",
    shell: true,
    windowsHide: false,
  });

  child.on("error", (error) => {
    console.error(`${name} failed to start: ${error.message}`);
    stopAll();
    process.exit(1);
  });

  child.on("exit", (code) => {
    if (!shuttingDown && code && code !== 0) {
      console.error(`${name} stopped with exit code ${code}`);
      stopAll();
      process.exit(code);
    }
  });

  return child;
}

const children = commands.map(startProcess);

function stopAll() {
  shuttingDown = true;

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
