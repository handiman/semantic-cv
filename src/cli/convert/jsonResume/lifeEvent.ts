export default (jsonresume: any) => (person: any) => {
  const { awards } = jsonresume;
  return {
    ...person,
    lifeEvent: (awards ?? []).map((award: any) => ({
      ["@type"]: "Event",
      name: award.title,
      description: award.summary,
      startDate: award.date
    }))
  };
};
