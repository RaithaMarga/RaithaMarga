export const isLocalListing = (listingOrId) => {
  const id = typeof listingOrId === 'object' ? listingOrId?.id : listingOrId;
  return String(id || '').startsWith('listing-');
};
