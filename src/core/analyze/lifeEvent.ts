import { listOfObjects, optional } from "../analyze.js";

export const analyzeLifeEvent = (person: any) =>
  optional("lifeEvent")(listOfObjects)(person);

export default analyzeLifeEvent;
