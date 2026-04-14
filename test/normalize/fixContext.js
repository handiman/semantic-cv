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
    const expectedValue = "https://schema.org";
    assert.strictEqual(person["@context"], expectedValue);
    // Having @context on the root object is enough.
    assert.strictEqual(Object.keys(person.worksFor[0]).includes("@context"), false);
    assert.strictEqual(Object.keys(person.alumniOf[0]).includes("@context"), false);
    assert.strictEqual(Object.keys(person.lifeEvent[0]).includes("@context"), false);
  });
}

export function removesRedundantContexts() {
  const schemaOrg = "https://schema.org";
  it("does not remove @context from root object (Person)", () => {
    const person = normalize({
      "@type": schemaOrg
    });
    assert.strictEqual(person["@context"], schemaOrg);
  });
  it("automatically removes redundant @context from", () => {
    test("worksFor", () => {
      const { worksFor } = normalize({
        worksFor: [
          {
            "@context": schemaOrg,
            worksFor: {
              "@context": schemaOrg
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
            "@context": schemaOrg,
            alumniOf: {
              "@context": schemaOrg
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
            "@context": schemaOrg
          }
        ]
      });
      assert.strictEqual(Object.keys(hasCertification).includes("@context"), false);
    });

    test("hasCredential", () => {
      const { hasCredential } = normalize({
        hasCredential: [
          {
            "@context": schemaOrg
          }
        ]
      });
      assert.strictEqual(Object.keys(hasCredential).includes("@context"), false);
    });

    test("lifeEvent", () => {
      const { lifeEvent } = normalize({
        lifeEvent: [
          {
            "@context": schemaOrg
          }
        ]
      });
      assert.strictEqual(Object.keys(lifeEvent).includes("@context"), false);
    });
  });
}
