import assert from "node:assert";
import { it, test } from "node:test";
import normalize from "../../dist/core/normalize.js";

export function fixesInvalidContext() {
  it("automatically fixes invalid @context", () => {
    const person = normalize({
      "@context": "Wrong"
    });
    assert.strictEqual(person["@context"], "https://schema.org");
  });
}

export function addsMissingContext() {
  it("automatically adds missing @context", () => {
    const person = normalize({
      name: "Henrik Becker",
      worksFor: [
        {
          name: "Henrik Becker Consulting AB"
        }
      ],
      alumniOf: [
        {
          name: "KomVux"
        }
      ],
      lifeEvent: [
        {
          name: "Was born"
        }
      ]
    });
    const expectedContext = ["https://schema.org", "https://semantic.cv/latest.jsonld"];
    assert.strictEqual(person["@context"], expectedContext);
    // Having @context on the root object is enough.
    assert.strictEqual(Object.keys(person.worksFor[0]).includes("@context"), false);
    assert.strictEqual(Object.keys(person.alumniOf[0]).includes("@context"), false);
    assert.strictEqual(Object.keys(person.lifeEvent[0]).includes("@context"), false);
  });
}

export function removesRedundantContexts() {
  const context = "https://schema.org";
  it("does not remove @context from root object (Person)", () => {
    const person = normalize({
      "@context": context
    });
    assert.strictEqual(person["@context"], context);
  });
  it("automatically removes redundant @context from", () => {
    test("worksFor", () => {
      const { worksFor } = normalize({
        worksFor: [
          {
            "@context": context,
            worksFor: {
              "@context": context
            }
          }
        ]
      });
      assert.strictEqual(Object.keys(worksFor[0]).includes("@context"), false);
      assert.strictEqual(Object.keys(worksFor[0].worksFor).includes("@context"), false);
    });

    test("alumniOf", () => {
      const { alumniOf } = normalize({
        alumniOf: [
          {
            "@context": context,
            alumniOf: {
              "@context": context
            }
          }
        ]
      });
      assert.strictEqual(Object.keys(alumniOf[0]).includes("@context"), false);
      assert.strictEqual(Object.keys(alumniOf[0].alumniOf).includes("@context"), false);
    });

    test("hasCertification", () => {
      const { hasCertification } = normalize({
        hasCertification: [
          {
            "@context": context
          }
        ]
      });
      assert.strictEqual(Object.keys(hasCertification).includes("@context"), false);
    });

    test("hasCredential", () => {
      const { hasCredential } = normalize({
        hasCredential: [
          {
            "@context": context
          }
        ]
      });
      assert.strictEqual(Object.keys(hasCredential).includes("@context"), false);
    });

    test("lifeEvent", () => {
      const { lifeEvent } = normalize({
        lifeEvent: [
          {
            "@context": context
          }
        ]
      });
      assert.strictEqual(Object.keys(lifeEvent).includes("@context"), false);
    });
  });
}
