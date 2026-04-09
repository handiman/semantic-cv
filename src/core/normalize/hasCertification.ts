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

export function normalizeHasCertification(person: any) {
  const { hasCertification } = person;
  return !hasCertification
    ? person
    : {
        ...person,
        hasCertification: sort
          .dateDescending("validFrom")(hasCertification ?? [])
          .map(
            pipe(
              setType("Certification"),
              singleValues([
                "name",
                "description",
                "validFrom",
                "expires",
                "logo",
                "issuedBy",
                "certificationIdentification",
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

export default normalizeHasCertification;
