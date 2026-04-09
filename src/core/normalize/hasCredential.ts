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

export function normalizeHasCredential(person: any) {
  const { hasCredential } = person;
  return !hasCredential
    ? person
    : {
        ...person,
        hasCredential: sort
          .dateDescending("datePublished")(hasCredential ?? [])
          .map(
            pipe(
              setType("EducationalOccupationalCredential"),
              singleValues([
                "name",
                "description",
                "datePublished",
                "expires",
                "image",
              ]),
              removeContext,
              removeUndefined,
              removeNull,
              removeEmpty,
              sortFields,
            ),
          ),
      };
}

export default normalizeHasCredential;
