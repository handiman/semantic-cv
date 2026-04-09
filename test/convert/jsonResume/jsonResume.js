import { describe } from "node:test";
import convert from "../../../dist/cli/convert/jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };
import basics from "./basics.js";
import certificates from "./certificates.js";
import work from "./work.js";
import projects from "./projects.js";
import education from "./education.js";
import awards from "./awards.js";
import skills from "./skills.js";
import languages from "./languages.js";
import load from "./load.js";

const toJson = async (readable) => {
  const chunks = [];
  for await (let chunk of readable) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString());
};

export const convertHelper = async (source) => {
  const transform = new TransformStream({
    __proto__: null,
    writableObjectMode: true,
  });
  convert(source ?? jsonresume, (person) => {
    const encoder = new TextEncoder();
    const writer = transform.writable.getWriter();
    writer.write(encoder.encode(JSON.stringify(person, null, 2)));
    writer.close();
  });
  return await toJson(transform.readable);
};

export default () =>
  describe("JSON Resume", () => {
    load();
    basics();
    skills();
    languages();
    certificates();
    work();
    projects();
    education();
    awards();
  });
