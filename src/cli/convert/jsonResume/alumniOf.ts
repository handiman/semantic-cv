export default (jsonresume: any) => (person: any) => {
  const { education } = jsonresume;
  return {
    ...person,
    alumniOf: (education ?? []).map((edu: any) => {
      const { institution, area, startDate, endDate, location } = edu;
      return {
        "@type": "Role",
        startDate,
        endDate,
        description: area,
        alumniOf: {
          "@type": "EducationalOrganization",
          name: institution,
          location
        }
      };
    })
  };
};
