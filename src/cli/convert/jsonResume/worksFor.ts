export default (jsonresume: any) => (person: any) => {
  const { work } = jsonresume;
  return {
    ...person,
    worksFor: (work ?? []).map((work: any) => {
      const { name, position, startDate, endDate, location, highlights, summary } = work;
      const roleName = position;
      let description = work.description ?? "";
      description += summary ? (description.length > 0 ? `\n${summary}` : summary) : "";
      description += highlights
        ? description.length > 0
          ? `\n${highlights.join("\n")}`
          : highlights.join("\n")
        : "";
      return {
        "@type": "Role",
        roleName,
        startDate,
        endDate,
        description,
        worksFor: {
          "@type": "Organization",
          name,
          location
        }
      };
    })
  };
};
