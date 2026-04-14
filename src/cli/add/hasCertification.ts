import sort from "../../core/sort.js";
import Prompt, { IPrompt } from "../prompt.js";

function trim(value: string | null | undefined) {
  if (null === value || undefined === value) {
    return undefined;
  }
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function addHasCertification(
  person: any,
  values: {
    name: string | undefined;
    description: string | undefined;
    issuedBy: string | undefined;
    validFrom: string | undefined;
    expires: string | undefined;
    logo: string | undefined;
    certificationIdentification: string | undefined;
  }
) {
  const { name, description, issuedBy, validFrom, expires, logo, certificationIdentification } =
    values;
  const hasCertification = person.hasCertification ?? [];
  return {
    ...person,
    hasCertification: sort.dateDescending("validFrom")([
      ...hasCertification,
      {
        ["@type"]: "Certification",
        name: trim(name),
        description: trim(description),
        issuedBy: trim(issuedBy),
        validFrom: trim(validFrom),
        expires: trim(expires),
        logo: trim(logo),
        certificationIdentification: trim(certificationIdentification)
      }
    ])
  };
}

/** https://schema.org/hasCertification */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    return addHasCertification(person, {
      name: await prompt.ask("Name"),
      description: await prompt.ask("Description"),
      issuedBy: await prompt.ask("Issuer"),
      validFrom: await prompt.ask("Valid from"),
      expires: await prompt.ask("Expires"),
      logo: await prompt.ask("Logo"),
      certificationIdentification: await prompt.ask("Cert ID")
    });
  } finally {
    prompt.close();
  }
}
