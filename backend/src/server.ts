import https from "https";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createApp } from "./app.js";

async function main() {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`Gymaxo API running on http://localhost:${env.PORT}/api`);
  });

  setInterval(() => {
    https.get("https://gymaxo.onrender.com/api/health", (res) => {
      console.log(`Server hit with status code: ${res.statusCode}`);
    }).on("error", (e) => {
      console.error(`Got error: ${e.message}`);
    });
  }, 3 * 60 * 1000);

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
