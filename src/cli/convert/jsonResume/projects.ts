export default (jsonresume: any) => (person: any) => {
  const projects = jsonresume.projects;
  if (null === projects || undefined === projects) {
    return person;
  }

  const worksFor = person.worksFor ?? [];
  return {
    ...person,
    worksFor: [
      ...worksFor,
      ...projects.map((project: any) => {
        const { name, highlights, url, startDate, endDate } = project;
        let description = project.description ?? "";
        description += highlights
          ? description.length > 0
            ? `\n${highlights.join("\n")}`
            : highlights.join("\n")
          : "";
        return {
          "@type": "Role",
          startDate,
          endDate,
          description,
          worksFor: {
            "@type": "Project",
            name,
            url
          }
        };
      })
    ]
  };
};
