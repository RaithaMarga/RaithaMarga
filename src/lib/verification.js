// Backend verification status ("PENDING" | "VERIFIED" | "REJECTED") -> lowercase badge key.
export const verificationKey = (user) => {
  const value = user?.profile?.verificationStatus;
  return value ? String(value).toLowerCase() : undefined;
};
