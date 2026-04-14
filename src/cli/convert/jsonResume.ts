import fs from "node:fs";
import pipe from "../../core/pipe.js";
import worksFor from "./jsonResume/worksFor.js";
import lifeEvent from "./jsonResume/lifeEvent.js";
import alumniOf from "./jsonResume/alumniOf.js";
import hasCertification from "./jsonResume/hasCertification.js";
import projects from "./jsonResume/projects.js";

const load = async (source: any) => {
  if (URL.canParse(source)) {
    const response = await fetch(source);
    return await response.json();
  } else if ("string" === typeof source) {
    return JSON.parse(fs.readFileSync(source).toString());
  } else {
    return source;
  }
};

const isJsonResume = (json: any) => {
  return (
    json &&
    json["$schema"] ===
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json"
  );
};

const name = (jsonresume: any) => (person: any) => ({
  ...person,
  name: jsonresume.basics ? jsonresume.basics.name : undefined
});

const jobTitle = (jsonresume: any) => (person: any) => ({
  ...person,
  jobTitle: jsonresume.basics ? jsonresume.basics.label : undefined
});

const description = (jsonresume: any) => (person: any) => ({
  ...person,
  description: jsonresume.basics ? jsonresume.basics.summary : undefined
});

const image = (jsonresume: any) => (person: any) => ({
  ...person,
  image: jsonresume.basics ? jsonresume.basics.image : undefined
});

const url = (jsonresume: any) => (person: any) => ({
  ...person,
  url: jsonresume.basics ? jsonresume.basics.url : undefined
});

const email = (jsonresume: any) => (person: any) => ({
  ...person,
  email: jsonresume.basics ? jsonresume.basics.email : undefined
});

const telephone = (jsonresume: any) => (person: any) => ({
  ...person,
  telephone: jsonresume.basics ? jsonresume.basics.phone : undefined
});

const sameAs = (jsonresume: any) => (person: any) => ({
  ...person,
  sameAs: (jsonresume.basics.profiles ?? []).map((profile: any) => profile.url)
});

const knowsLanguage = (jsonresume: any) => (person: any) => ({
  ...person,
  knowsLanguage: (jsonresume.languages ?? []).map((language: any) => {
    return language.language;
  })
});

const knowsAbout = (jsonresume: any) => (person: any) => ({
  ...person,
  knowsAbout: (jsonresume.skills ?? []).map((skill: any) => skill.name)
});

const skills = (jsonresume: any) => (person: any) => ({
  ...person,
  skills: (jsonresume.skills ?? []).flatMap((skill: any) => skill.keywords ?? [])
});

const convert = (jsonresume: any, callback: (person: any) => any) => {
  return pipe(
    name(jsonresume),
    jobTitle(jsonresume),
    description(jsonresume),
    image(jsonresume),
    url(jsonresume),
    email(jsonresume),
    telephone(jsonresume),
    sameAs(jsonresume),
    knowsLanguage(jsonresume),
    knowsAbout(jsonresume),
    skills(jsonresume),
    hasCertification(jsonresume),
    worksFor(jsonresume),
    alumniOf(jsonresume),
    projects(jsonresume),
    lifeEvent(jsonresume),
    callback
  )({
    "@context": "https://schema.org",
    "@type": "Person"
  });
};

export default async (source: string, callback: (person: any) => any): Promise<boolean> => {
  const jsonresume = await load(source);

  if (isJsonResume(jsonresume)) {
    convert(jsonresume, callback);
    return true;
  }

  return false;
};
