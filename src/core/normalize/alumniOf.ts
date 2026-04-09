import {
  removeContext,
  removeEmpty,
  removeNull,
  removeUndefined,
  setType,
  singleValues,
  sortFields,
  toSingle,
} from "../normalize.js";
import pipe from "../pipe.js";
import sort from "../sort.js";

const wrapperPipe = (initial: any) => {
  const normalized = pipe(
    setType("Role"),
    singleValues([
      "roleName",
      "description",
      "startDate",
      "endDate",
      "alumniOf",
    ]),
    removeContext,
    removeUndefined,
    removeNull,
    removeEmpty,
    sortFields,
  )(initial);

  const innerPipe = pipe(
    removeContext,
    removeUndefined,
    removeNull,
    removeEmpty,
    setType("EducationalOrganization"),
    singleValues(["name", "description", "location"]),
  );
  return {
    ...normalized,
    alumniOf: innerPipe(toSingle(initial.alumniOf ?? {})),
  };
};

export function normalizeAlumniOf(person: any) {
  const { alumniOf } = person;
  return !alumniOf
    ? person
    : {
        ...person,
        alumniOf: sort.dateDescending("endDate")(
          (alumniOf ?? []).map(wrapperPipe),
        ),
      };
}

export default normalizeAlumniOf;
