import {
  removeContext,
  removeEmpty,
  removeNull,
  removeUndefined,
  setType,
  singleValues,
  sortFields,
} from "../normalize.js";
import pipe from "../pipe.js";
import sort from "../sort.js";

export function normalizeLifeEvent(person: any) {
  const { lifeEvent } = person;
  return !lifeEvent
    ? person
    : {
        ...person,
        lifeEvent: sort.dateDescending("startDate")(
          (lifeEvent ?? []).map(
            pipe(
              setType("Event"),
              singleValues(["name", "description"]),
              removeContext,
              removeEmpty,
              removeNull,
              removeUndefined,
              sortFields,
            ),
          ),
        ),
      };
}

export default normalizeLifeEvent;
