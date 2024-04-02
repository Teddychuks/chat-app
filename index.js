const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const { DataSource } = require("typeorm");
const cron = require("node-cron");
const Message = require("./entity/Message");

const AppDataSource = new DataSource({
  type: "mysql",
  host: "mysql-167957-0.cloudclusters.net",
  port: 10005,
  username: "admin",
  password: "QQFIhmQl",
  database: "chat_db",
  synchronize: false,
  entities: [Message],
});

async function main() {
  await AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
  });

  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
  });

  io.on("connection", (socket) => {
    socket.on("request missed messages", async (lastIdReceived) => {
      const messageRepository = AppDataSource.getRepository(Message);
      const missedMessages = await messageRepository
        .createQueryBuilder("message")
        .where("message.id > :lastIdReceived", { lastIdReceived })
        .getMany();

      missedMessages.forEach((message) => {
        socket.emit("chat message", message.content, message.id);
      });
    });

    socket.on("chat message", async (msg) => {
      const messageRepository = AppDataSource.getRepository(Message);
      const message = messageRepository.create({ content: msg });
      const result = await messageRepository.save(message);
      io.emit("chat message", msg, result.id);
    });
  });

  cron.schedule("*/14 * * * *", () => {
    console.log("This logs something to the console every 14 minutes");
  });

  server.listen(3000, () => {});
}

main();
