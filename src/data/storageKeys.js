// Shared localStorage keys. There's no backend yet, so the Farmer and
// Buyer dashboards "talk" to each other purely through these keys —
// e.g. a listing a farmer publishes in one tab shows up in the
// buyer's Browse Produce in another tab (see useLocalStorage's
// cross-tab sync). When a real backend arrives, these reads get
// replaced with API calls and this file goes away.
export const STORAGE_KEYS = {
  FARMER_LISTINGS: 'rm_farmer_listings',
  FARMER_PROFILE: 'rm_farmer_profile',
  FARMER_VERIFICATION: 'rm_farmer_verification',
  BUYER_PROFILE: 'rm_buyer_profile',
  BUYER_REQUIREMENTS: 'rm_buyer_requirements',
  BUYER_REQUESTS: 'rm_buyer_requests',
};
