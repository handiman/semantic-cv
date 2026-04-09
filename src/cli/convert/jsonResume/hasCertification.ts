export default (jsonresume: any) => (person: any) => {
  const { certificates } = jsonresume;
  return {
    ...person,
    hasCertification: (certificates ?? []).map((cert: any) => ({
      "@type": "Certification",
      name: cert.name,
      issuedBy: cert.issuer,
      validFrom: cert.date,
    })),
  };
};
