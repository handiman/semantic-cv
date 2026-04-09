import assert from "node:assert";
import { describe, test } from "node:test";
import normalize from "../../dist/core/normalize.js";

export default () => {
  describe("sorts in descending chronological order", () => {
    test("worksFor", () => {
      const { worksFor } = normalize({
        worksFor: [
          {
            endDate: "2026-01-01",
          },
          {
            endDate: "present",
          },
          {
            endDate: "2026-02-01",
          },
        ],
      });

      assert.deepStrictEqual(worksFor, [
        {
          "@type": "Role",
          endDate: "present",
          worksFor: {
            "@type": "Organization",
          },
        },
        {
          "@type": "Role",
          endDate: "2026-02-01",
          worksFor: {
            "@type": "Organization",
          },
        },
        {
          "@type": "Role",
          endDate: "2026-01-01",
          worksFor: {
            "@type": "Organization",
          },
        },
      ]);
    });
    test("alumniOf", () => {
      const { alumniOf } = normalize({
        alumniOf: [
          {
            endDate: "2026-01-01",
          },
          {
            endDate: "2026-03-01",
          },
          {
            endDate: "present",
          },
        ],
      });

      assert.deepStrictEqual(alumniOf, [
        {
          "@type": "Role",
          endDate: "present",
          alumniOf: {
            "@type": "EducationalOrganization",
          },
        },
        {
          "@type": "Role",
          endDate: "2026-03-01",
          alumniOf: {
            "@type": "EducationalOrganization",
          },
        },
        {
          "@type": "Role",
          endDate: "2026-01-01",
          alumniOf: {
            "@type": "EducationalOrganization",
          },
        },
      ]);
    });

    test("lifeEvent", () => {
      const { lifeEvent } = normalize({
        lifeEvent: [
          {
            name: "Born",
            startDate: "1969-06-23",
          },
          {
            name: "Married",
            startDate: "2023-06-10",
          },
        ],
      });
      assert.strictEqual(lifeEvent[0].name, "Married");
      assert.strictEqual(lifeEvent[1].name, "Born");
    });
  });

  describe("sorts in alphabetical order", () => {
    test("sameAs", () => {
      const { sameAs } = normalize({
        sameAs: ["https://B", "https://a"],
      });
      assert.deepStrictEqual(["https://a", "https://B"], sameAs);
    });
    test("skills", () => {
      const { skills } = normalize({
        skills: ["skills B", "skills a"],
      });
      assert.deepStrictEqual(["skills a", "skills B"], skills);
    });
    test("knowsAbout", () => {
      const { knowsAbout } = normalize({
        knowsAbout: ["thing B", "thing a"],
      });
      assert.deepStrictEqual(["thing a", "thing B"], knowsAbout);
    });
  });

  describe("does not sort", () => {
    test("knowsLanguage", () => {
      const { knowsLanguage } = normalize({
        knowsLanguage: ["Swedish", "English"],
      });
      assert.deepStrictEqual(["Swedish", "English"], knowsLanguage);
    });
  });
};
