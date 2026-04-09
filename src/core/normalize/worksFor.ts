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
      "worksFor",
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
    (item: any): any =>
      "Project" === item["@type"] ? item : setType("Organization")(item),
    removeNull,
    removeEmpty,
    singleValues(["name", "description", "location"]),
  );
  return {
    ...normalized,
    worksFor: innerPipe(toSingle(initial.worksFor ?? {})),
  };
};

export function normalizeWorksFor(person: any) {
  const { worksFor } = person;
  return !worksFor
    ? person
    : {
        ...person,
        worksFor: sort.dateDescending("endDate")(
          (worksFor ?? []).map(wrapperPipe),
        ),
      };
}

export default normalizeWorksFor;
