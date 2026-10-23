import "dotenv/config";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import type { Server } from "http";

let server: Server | null = null;
let isShuttingDown = false;

const handleShutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(
    `\nRecibida señal ${signal}. Cerrando la aplicación ordenadamente...`,
  );

  if (server) {
    server.close(async () => {
      console.log("Servidor HTTP cerrado.");
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase({
      uri: env.MONGODB_URI,
      dbName: env.MONGODB_DB_NAME,
    });

    server = app.listen(env.PORT, () => {
      console.log(`API disponible en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error(
      "No fue posible iniciar la API. Revise MONGODB_URI, " +
        "el usuario y la lista de acceso de red.",
      error,
    );
    process.exitCode = 1;
  }
};

process.on("SIGINT", () => void handleShutdown("SIGINT"));
process.on("SIGTERM", () => void handleShutdown("SIGTERM"));

void startServer();
