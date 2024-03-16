import Fastify from "fastify";
import * as fs from "node:fs";
import { join } from "node:path";
import * as fastifyStatic from "@fastify/static";

const fastify = Fastify();
const __dirname = new URL(".", import.meta.url).pathname;

fastify.register(fastifyStatic, {
  root: join(__dirname, "image"),
  prefix: "/image/",
});

fastify.get(`/image/:fileName`, (request, reply) => {
  const fileNameFromParams = request.params.fileName;

  const fileName = fs
    .readdirSync(join(__dirname, "image"))
    .find((file) => file === fileNameFromParams);

  reply.sendFile(fileName);
});

function init() {
  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    console.info(`Server listening on ${address}`);
  });
}

function removeFile(fileName) {
  fs.unlinkSync(join(__dirname, "image", fileName));
}

function getAddress() {
  return `http://127.0.0.1:3000`;
}

export const server = Object.freeze({
  init,
  removeFile,
  getAddress,
});
