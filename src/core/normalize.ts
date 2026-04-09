import pipe from "./pipe.js";
import normalizeWorksFor from "./normalize/worksFor.js";
import normalizeAlumniOf from "./normalize/alumniOf.js";
import normalizeLifeEvent from "./normalize/lifeEvent.js";
import normalizeHasCredential from "./normalize/hasCredential.js";
import normalizeHasCertification from "./normalize/hasCertification.js";

function fixCasing<T>(value: T): T {
  const validKeys = [
    "@context",
    "@type",
    "@theme",
    "name",
    "description",
    "jobTitle",
    "telephone",
    "workLocation",
    "email",
    "url",
    "image",
    "worksFor",
    "alumniOf",
    "sameAs",
    "address",
    "description",
    "lifeEvent",
    "nationality",
    "hasCertification",
    "hasCredential",
    "knowsAbout",
    "skills",
    "knowsLanguage",
    "location",
    "member",
    "roleName",
    "startDate",
    "endDate",
    "issuedBy",
    "validFrom",
    "expires",
    "certificationIdentification",
    "datePublished",
  ];
  if (Array.isArray(value)) {
    return value.map((v) => fixCasing(v)) as T;
  }

  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const [key, val] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      const correct = [...validKeys].find((k) => k.toLowerCase() === lower);
      if (correct && key !== correct) {
        obj[key] = undefined;
        obj[correct ?? key] = fixCasing(val);
      }
    }

    return obj as T;
  }

  return value;
}

export function sortFields(value: any): any {
  if (Array.isArray(value)) {
    return value.map(sortFields);
  }

  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    const priority = ["@context", "@type"] as const;

    const entries = Object.entries(obj).map(([key, val]) => {
      return [key, sortFields(val)] as [string, unknown];
    });

    const prioritized = entries.filter(([key]) =>
      priority.includes(key as "@context" | "@type"),
    );

    const rest = entries
      .filter(([key]) => !priority.includes(key as "@context" | "@type"))
      .sort(([a], [b]) => a.localeCompare(b));

    return Object.fromEntries([...prioritized, ...rest]);
  }

  return value;
}

export const toArray = (value: any) => {
  if (undefined === value || null === value) {
    return value;
  }

  return (Array.isArray(value) ? value : [value]).filter(
    (item: any) => item !== undefined && item !== null && item !== "",
  );
};

export const toSingle = (value: any) => {
  if (undefined === value) {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const singleValues = (keys: Array<string>) => {
  return function (initial: any) {
    if (undefined === initial) {
      return initial;
    }

    let normalized = { ...initial };
    for (const key of keys) {
      if (undefined === initial[key]) {
        delete normalized[key];
        continue;
      }

      const single = toSingle(initial[key]);
      normalized = {
        ...normalized,
        [key]: single,
      };
    }

    return normalized;
  };
};

export const arrayValues = (keys: Array<string>) => {
  return function (initial: any) {
    if (undefined === initial) {
      return initial;
    }

    let normalized = { ...initial };
    for (const key of keys) {
      if (initial[key]) {
        normalized = {
          ...normalized,
          [key]: toArray(initial[key]),
        };
      }
    }

    return normalized;
  };
};

export const setType = (type: string) => (initial: any) => {
  if (undefined === initial) {
    return initial;
  }

  return {
    ...initial,
    "@type": type,
  };
};

const setContext = (person: any) => ({
  ...person,
  "@context": "https://schema.org",
});

export const removeContext = (value: any) => {
  if (undefined === value) {
    return value;
  }

  if (Object.keys(value).includes("@context")) {
    const { ["@context"]: _, ...normalized } = value;
    return normalized;
  }

  return value;
};

export const removeUndefined = (obj: any) =>
  undefined === obj
    ? obj
    : Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined),
      );

export const removeNull = (obj: any) =>
  undefined === obj
    ? obj
    : Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== null),
      );

export const removeEmpty = (obj: string | Array<any>) =>
  undefined === obj
    ? obj
    : Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value && value.length > 0),
      );

const sortAlphabetically = (fieldName: string) => (person: any) => {
  if (!person[fieldName]) {
    return person;
  }
  return {
    ...person,
    [fieldName]: person[fieldName].sort((a: any, b: any) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    ),
  };
};

export const normalize = {
  casing: fixCasing,
  person: pipe(
    fixCasing,
    singleValues([
      "@theme",
      "name",
      "jobTitle",
      "description",
      "nationality",
      "workLocation",
      "telephone",
      "email",
      "url",
      "image",
    ]),
    arrayValues([
      "sameAs",
      "hasCertification",
      "hasCredential",
      "knowsLanguage",
      "knowsAbout",
      "skills",
      "worksFor",
      "alumniOf",
      "lifeEvent",
    ]),
    removeEmpty,
    removeNull,
    removeUndefined,
    removeContext,
    setContext,
    setType("Person"),
    sortAlphabetically("knowsAbout"),
    sortAlphabetically("sameAs"),
    sortAlphabetically("skills"),
    normalizeWorksFor,
    normalizeAlumniOf,
    normalizeHasCredential,
    normalizeHasCertification,
    normalizeLifeEvent,
    sortFields,
  ),
};

export default normalize.person;
