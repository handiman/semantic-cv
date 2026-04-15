import { describe } from "node:test";
import worksFor from "./add/worksFor.js";
import project from "./add/project.js";
import alumniOf from "./add/alumniOf.js";
import lifeEvent from "./add/lifeEvent.js";
import hasCertification from "./add/hasCertification.js";
import hasCredential from "./add/hasCredential.js";
import sameAs from "./add/sameAs.js";
import skills from "./add/skills.js";
import knowsLanguage from "./add/knowsLanguage.js";
import knowsAbout from "./add/knowsAbout.js";

describe("Add", () => {
  alumniOf();
  worksFor();
  project();
  lifeEvent();
  hasCertification();
  hasCredential();
  sameAs();
  skills();
  knowsLanguage();
  knowsAbout();
});
