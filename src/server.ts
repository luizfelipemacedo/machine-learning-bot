import * as fs from "node:fs";
import { join } from "node:path";
import fastifyStatic from "@fastify/static";
import Fastify, { FastifyRequest, FastifyReply } from "fastify";

const fastify = Fastify();
const __dirname = new URL(".", import.meta.url).pathname;

fastify.register(fastifyStatic, {
  root: join(__dirname, "image"),
  prefix: "/image/",
});

fastify.get(`/image/:fileName`, (request: FastifyRequest, reply: FastifyReply) => {
  interface Params {
    fileName: string
  }

  const fileNameFromParams = (request.params as Params).fileName;
  if (!fileNameFromParams) reply.status(400);

  const fileName = fs
    .readdirSync(join(__dirname, "image"))
    .find((file) => file === fileNameFromParams);

  if (!fileName) return reply.status(400);

  return reply.sendFile(fileName as string);
});

function init() {
  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    console.info(`Server listening on ${address}`);
  });
}

function removeFile(fileName: string) {
  fs.unlinkSync(join(__dirname, "image", fileName));
}

function getAddress() {
  const addressInfo = fastify.server.address() as { address: string, port: number };
  return `http://${addressInfo.address}:${addressInfo?.port}`;
}

export const server = Object.freeze({
  init,
  removeFile,
  getAddress,
});
