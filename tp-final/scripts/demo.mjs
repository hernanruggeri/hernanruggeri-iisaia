import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";
const npmArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm run build"] : ["run", "build"];
const build = spawn(npmCommand, npmArgs, {
  env: { ...process.env, VITE_API_BASE_URL: "/api" },
  stdio: "inherit",
});

const exitCode = await new Promise((resolve) => build.on("exit", resolve));
if (exitCode !== 0) process.exit(exitCode ?? 1);

const { createDemoServer } = await import("../server/demo.js");
const port = Number(process.env.DEMO_PORT || 4173);
const server = createDemoServer();
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => server.close());
server.listen(port, "127.0.0.1", () => {
  console.log(`Demo integral disponible en http://127.0.0.1:${port}/hr-agroriego-iot/#riego`);
});
