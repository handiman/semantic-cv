import { describe } from "node:test";
import worksFor from "./worksFor.js";
import project from "./project.js";
import alumniOf from "./alumniOf.js";
import lifeEvent from "./lifeEvent.js";
import hasCertification from "./hasCertification.js";
import hasCredential from "./hasCredential.js";
import sameAs from "./sameAs.js";
import skills from "./skills.js";
import knowsLanguage from "./knowsLanguage.js";
import knowsAbout from "./knowsAbout.js";

describe("add", () => {
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
