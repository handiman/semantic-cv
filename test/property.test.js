import assert from "node:assert";
import { describe, test } from "node:test";
import fc from "fast-check";
import convertJsonResume from "../dist/cli/convert/jsonResume.js";
import normalize from "../dist/core/normalize.js";

// Property-based tests: fast-check generates JSON Resume documents with any combination of the
// sections and fields the converter reads, and shrinks a failure to the smallest one that fails.
const runs = { numRuns: 300 };

const SCHEMA = "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";

const text = fc.string({ minLength: 1, maxLength: 20 }).filter((value) => value.trim() !== "");
const date = fc.constantFrom("2019", "2020-05", "2021-03-14");
const url = fc.constantFrom("https://example.com/", "https://github.com/someone");
const list = (arb) => fc.array(arb, { maxLength: 3 });
const optional = (shape) => fc.record(shape, { requiredKeys: [] });

// The fields of JSON Resume v1.0.0 that the converter reads, with the types the schema gives them.
const jsonResume = optional({
  basics: optional({
    name: text,
    label: text,
    summary: text,
    image: url,
    url,
    email: fc.constant("someone@example.com"),
    phone: fc.constant("+46 70 123 45 67"),
    profiles: list(optional({ network: text, url }))
  }),
  work: list(
    optional({
      name: text,
      position: text,
      location: text,
      description: text,
      summary: text,
      highlights: list(text),
      startDate: date,
      endDate: date
    })
  ),
  education: list(
    optional({
      institution: text,
      area: text,
      studyType: text,
      startDate: date,
      endDate: date,
      courses: list(text)
    })
  ),
  certificates: list(optional({ name: text, date, issuer: text, url })),
  awards: list(optional({ title: text, date, awarder: text, summary: text })),
  projects: list(
    optional({
      name: text,
      description: text,
      highlights: list(text),
      keywords: list(text),
      startDate: date,
      endDate: date,
      url,
      roles: list(text),
      entity: text
    })
  ),
  languages: list(optional({ language: text, fluency: text })),
  skills: list(optional({ name: text, level: text, keywords: list(text) }))
}).map((resume) => ({ $schema: SCHEMA, ...resume }));

const convert = async (resume) => {
  let person;
  const converted = await convertJsonResume(structuredClone(resume), (p) => (person = p));
  assert.ok(converted, "recognized as a JSON Resume");
  return person;
};

const roleNames = (roles, key) =>
  (roles ?? []).map((role) => role[key]?.name).filter((name) => name !== undefined);

describe("Converting a JSON Resume, for any JSON Resume", () => {
  test("does not throw, and normalizing the result does not throw", async () => {
    await fc.assert(
      fc.asyncProperty(jsonResume, async (resume) => {
        normalize(await convert(resume));
      }),
      runs
    );
  });

  test("keeps the name of every employer and every school", async () => {
    await fc.assert(
      fc.asyncProperty(jsonResume, async (resume) => {
        const person = normalize(await convert(resume));
        const employers = roleNames(person.worksFor, "worksFor");
        const schools = roleNames(person.alumniOf, "alumniOf");
        for (const { name } of resume.work ?? []) {
          if (name?.trim()) {
            assert.ok(employers.includes(name.trim()), name);
          }
        }
        for (const { institution } of resume.education ?? []) {
          if (institution?.trim()) {
            assert.ok(schools.includes(institution.trim()), institution);
          }
        }
      }),
      runs
    );
  });

  test("gives the same Person for the same JSON Resume", async () => {
    await fc.assert(
      fc.asyncProperty(jsonResume, async (resume) => {
        assert.strictEqual(
          JSON.stringify(normalize(await convert(resume))),
          JSON.stringify(normalize(await convert(resume)))
        );
      }),
      runs
    );
  });
});
