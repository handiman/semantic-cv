import assert from "node:assert";
import http from "node:http";
import { before, after, describe, it } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

const startServer = () => {
  const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(jsonresume));
  });

  return new Promise((resolve) => {
    server.listen({ port: 0, host: "127.0.0.1" }, () => {
      const addr = server.address();
      resolve({
        server,
        url: `http://${addr.address}:${addr.port}`
      });
    });
  });
};

export default () => {
  describe("load", () => {
    let server;
    let url;
    before(async () => {
      const srv = await startServer();
      server = srv.server;
      url = srv.url;
    });

    after(() => {
      server.close();
    });

    it("can use an object", async () => {
      const person = await convertHelper(jsonresume);
      assert.strictEqual(person.name, "Henrik Becker");
    });

    it("can load from file", async () => {
      const fileName = "./test/convert/jsonResume/jsonResume.json";
      const person = await convertHelper(fileName);
      assert.strictEqual(person.name, "Henrik Becker");
    });

    it("can load from URL", async () => {
      const person = await convertHelper(url);
      assert.strictEqual(person.name, "Henrik Becker");
    });
  });
};
