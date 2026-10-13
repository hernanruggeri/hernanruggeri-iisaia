import { createWeatherHandler } from './weather-api.js';
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createApiHandler } from "./api.js";

const clientRoot = fileURLToPath(new URL("../dist/client/", import.meta.url));
const basePath = "/hr-agroriego-iot/";
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(response, filePath) {
  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}

export function createDemoServer(options = {}) {
  const apiHandler = createApiHandler(options.store);
  const weatherHandler = createWeatherHandler(options.weather);

  const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/api/meteorologia") { await weatherHandler(request, response); return; }
    if (url.pathname.startsWith("/api/")) {
      await apiHandler(request, response);
      return;
    }

    if (url.pathname === "/") {
      response.writeHead(302, { Location: `${basePath}#riego` });
      response.end();
      return;
    }

    const relativePath = url.pathname.startsWith(basePath)
      ? url.pathname.slice(basePath.length)
      : "";
    const requestedPath = relativePath && extname(relativePath)
      ? resolve(clientRoot, relativePath)
      : resolve(clientRoot, "index.html");

    if (!requestedPath.startsWith(`${resolve(clientRoot)}${sep}`)) {
      response.writeHead(400);
      response.end("Ruta inválida");
      return;
    }

    try {
      const fileStats = await stat(requestedPath);
      if (!fileStats.isFile()) throw new Error("NOT_A_FILE");
      sendFile(response, requestedPath);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Recurso no encontrado");
    }
  });
  server.on("close", () => { apiHandler.close(); weatherHandler.close(); });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.DEMO_PORT || 4173);
  const server = createDemoServer({ weather: { demo: true } });
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => server.close());
  server.listen(port, "127.0.0.1", () => {
    console.log(`Demo integral disponible en http://127.0.0.1:${port}${basePath}#riego`);
  });
}
