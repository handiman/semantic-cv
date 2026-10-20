import assert from "node:assert";
import { describe, it } from "node:test";
import { add } from "../../dist/cli/add.js";
import addKeywords from "../../dist/cli/add/keywords.js";
import FakePrompt from "../prompt.js";

const term = (name) => ({ "@type": "DefinedTerm", name });

const acme = {
  "@type": "Role",
  roleName: "Developer",
  endDate: "2025-12-31",
  worksFor: { "@type": "Organization", name: "Acme Inc." }
};
const rocket = {
  "@type": "Role",
  roleName: "Architect",
  endDate: "2024-12-31",
  worksFor: { "@type": "Project", name: "Rocket" }
};

export default () =>
  describe("keywords", () => {
    describe("with one role", () => {
      it("asks only for keywords, not for which role", async () => {
        const person = await addKeywords({ worksFor: [acme] }, new FakePrompt(["TypeScript"]));
        assert.deepStrictEqual(person.worksFor[0].keywords, [term("TypeScript")]);
      });

      it("takes several keywords in one comma separated answer", async () => {
        const person = await addKeywords(
          { worksFor: [acme] },
          new FakePrompt(["TypeScript,Azure Service Bus, Rust"])
        );
        assert.deepStrictEqual(person.worksFor[0].keywords, [
          term("TypeScript"),
          term("Azure Service Bus"),
          term("Rust")
        ]);
      });

      it("trims each keyword", async () => {
        const person = await addKeywords({ worksFor: [acme] }, new FakePrompt(["  Rust\t , Go "]));
        assert.deepStrictEqual(person.worksFor[0].keywords, [term("Rust"), term("Go")]);
      });

      it("skips empty items between the commas", async () => {
        const person = await addKeywords({ worksFor: [acme] }, new FakePrompt(["Rust,, ,Go,"]));
        assert.deepStrictEqual(person.worksFor[0].keywords, [term("Rust"), term("Go")]);
      });

      it("keeps the spaces inside a keyword", async () => {
        const answer = new FakePrompt(["Domain Driven Design"]);
        const person = await addKeywords({ worksFor: [acme] }, answer);
        assert.deepStrictEqual(person.worksFor[0].keywords, [term("Domain Driven Design")]);
      });

      it("adds to the keywords the role already has", async () => {
        const role = { ...acme, keywords: [term("C#")] };
        const person = await addKeywords({ worksFor: [role] }, new FakePrompt(["Rust"]));
        assert.deepStrictEqual(person.worksFor[0].keywords, [term("C#"), term("Rust")]);
      });

      it("leaves the rest of the role as it was", async () => {
        const person = await addKeywords({ worksFor: [acme] }, new FakePrompt(["Rust"]));
        const { keywords: _, ...rest } = person.worksFor[0];
        assert.deepStrictEqual(rest, acme);
      });

      for (const answer of [undefined, "", " ", "\n", "\t", ",", " , ,"]) {
        it(`returns the person unchanged when the answer is ${JSON.stringify(answer) ?? "missing"}`, async () => {
          const person = { worksFor: [acme] };
          assert.strictEqual(await addKeywords(person, new FakePrompt([answer])), person);
        });
      }
    });

    describe("with several roles", () => {
      const person = () => ({ worksFor: [acme, rocket] });

      it("adds to the role whose number is answered", async () => {
        const result = await addKeywords(person(), new FakePrompt(["2", "Rust"]));
        assert.strictEqual(result.worksFor[0].keywords, undefined);
        assert.deepStrictEqual(result.worksFor[1].keywords, [term("Rust")]);
      });

      it("defaults to the first role, which is the most recent", async () => {
        const result = await addKeywords(person(), new FakePrompt([undefined, "Rust"]));
        assert.deepStrictEqual(result.worksFor[0].keywords, [term("Rust")]);
        assert.strictEqual(result.worksFor[1].keywords, undefined);
      });

      it("lists the roles by number, with role and employer or project", async (t) => {
        const info = t.mock.method(console, "info", () => {});
        await addKeywords(person(), new FakePrompt(["1"]));
        assert.strictEqual(
          info.mock.calls[0].arguments[0],
          "1. Developer at Acme Inc.\n2. Architect at Rocket"
        );
      });

      for (const answer of ["0", "3", "-1", "1.5", "two", "0x2", "1e0"]) {
        it(`rejects the role number ${JSON.stringify(answer)} with a KnownError`, async (t) => {
          t.mock.method(console, "info", () => {});
          const input = person();
          const copy = structuredClone(input);
          await assert.rejects(addKeywords(input, new FakePrompt([answer, "Rust"])), {
            name: "KnownError"
          });
          assert.deepStrictEqual(input, copy);
        });
      }
    });

    describe("without any work", () => {
      for (const person of [{}, { worksFor: [] }]) {
        it(`is a KnownError for ${JSON.stringify(person)}`, async () => {
          await assert.rejects(addKeywords(person, new FakePrompt(["Rust"])), {
            name: "KnownError"
          });
        });
      }
    });

    it("does not change the person it was given", async () => {
      const input = { worksFor: [{ ...acme, keywords: [term("C#")] }, rocket] };
      const copy = structuredClone(input);
      await addKeywords(input, new FakePrompt(["1", "Rust"]));
      assert.deepStrictEqual(input, copy);
    });

    describe("is reached from `add` as", () => {
      for (const name of ["keywords", "keyword"]) {
        it(`"${name}"`, async () => {
          const person = await add(name, new FakePrompt(["Rust"]))({ worksFor: [acme] });
          assert.deepStrictEqual(person.worksFor[0].keywords, [term("Rust")]);
        });
      }
    });
  });
