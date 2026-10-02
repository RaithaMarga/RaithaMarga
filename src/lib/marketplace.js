export function fromApiListing(listing) {
  return {
    ...listing,
    expectedPrice: listing.price,
    quantity: listing.availableQuantity ?? listing.quantity,
    location: [listing.village, listing.taluk, listing.district].filter(Boolean).join(', '),
    status: String(listing.status || '').toLowerCase(),
    photos: [],
  };
}

export function toApiListing(listing, profile) {
  const placeParts = String(listing.location || '').split(',').map((part) => part.trim()).filter(Boolean);
  return {
    crop: listing.crop,
    quantity: Number(listing.quantity),
    unit: listing.unit,
    grade: listing.grade || null,
    price: Number(listing.expectedPrice),
    district: profile.district || placeParts.at(-1) || '',
    taluk: profile.taluk || placeParts.at(-2) || null,
    village: profile.village || placeParts[0] || null,
    state: profile.state || 'Karnataka',
    availabilityDate: listing.availabilityDate,
  };
}

export function fromApiRequirement(requirement) {
  return {
    ...requirement,
    requiredQuantity: requirement.quantity,
    district: requirement.location,
    status: String(requirement.status || '').toLowerCase(),
  };
}

export function fromApiDeal(deal) {
  return {
    ...deal,
    status: String(deal.status || '').toLowerCase(),
    agreedPrice: deal.price,
    totalAmount: Number(deal.quantity || 0) * Number(deal.price || 0),
  };
}
