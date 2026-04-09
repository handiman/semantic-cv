import { listOfObjects, notEmpty, optional } from "../analyze.js";

export const analyzeAlumniOf = (person: any) =>
  optional("alumniOf")(notEmpty, listOfObjects)(person);

export default analyzeAlumniOf;
