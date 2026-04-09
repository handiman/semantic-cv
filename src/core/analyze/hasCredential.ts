import { listOfObjects, optional } from "../analyze.js";

export const analyzeHasCredential = (person: any) =>
  optional("hasCredential")(listOfObjects)(person);

export default analyzeHasCredential;
