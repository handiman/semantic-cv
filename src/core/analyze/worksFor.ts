import { listOfObjects, notEmpty, optional } from "../analyze.js";

export const analyzeWorksFor = (person: any) =>
  optional("worksFor")(notEmpty, listOfObjects)(person);

export default analyzeWorksFor;
