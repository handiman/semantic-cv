import { describe } from "node:test";
import command from "./convert/command.js";
import jsonResume from "./convert/jsonResume/jsonResume.js";

describe("Convert", () => {
  command();
  jsonResume();
});
