import { listOfObjects, optional } from "../analyze.js";

export const analyzeHasCertification = (person: any) =>
  optional("hasCertification")(listOfObjects)(person);

export default analyzeHasCertification;
