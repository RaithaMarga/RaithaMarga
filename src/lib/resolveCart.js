// Public availability rows are crop totals, never backend listing IDs. Resolve only
// at the displayed price/unit; retain a selection if stock or price has changed.
export function resolveAvailabilityCart(items, listings) {
  const reserved = new Map(items.filter((item) => !item.pendingAvailability).map((item) => [item.listingId, Number(item.quantity)]));
  return items.map((item) => ({ ...item })).reduce((result, item) => {
    if (!item.pendingAvailability) return [...result, item];
    const candidates = listings.filter((listing) => !listing.localOnly && !String(listing.id).startsWith('listing-')
      && String(listing.crop).toLowerCase() === String(item.crop).toLowerCase()
      && (listing.unit || 'kg') === item.unit && listing.status === 'active'
      && Number(listing.expectedPrice) === Number(item.expectedPrice));
    const stock = candidates.reduce((sum, listing) => sum + Math.max(0, Number(listing.quantity) - (reserved.get(listing.id) || 0)), 0);
    if (stock < Number(item.quantity)) return [...result, item];
    let remaining = Number(item.quantity);
    const resolved = [];
    for (const listing of candidates) {
      const quantity = Math.min(remaining, Math.max(0, Number(listing.quantity) - (reserved.get(listing.id) || 0)));
      if (quantity <= 0) continue;
      remaining -= quantity;
      reserved.set(listing.id, (reserved.get(listing.id) || 0) + quantity);
      resolved.push({ ...item, listingId: listing.id, quantity, availableQuantity: Number(listing.quantity), farmerName: listing.farmerName || 'Farmer', photos: listing.photos || [], pendingAvailability: false, localOnly: false });
    }
    for (const line of resolved) {
      const existing = result.find((entry) => entry.listingId === line.listingId);
      if (existing) existing.quantity += line.quantity;
      else result.push(line);
    }
    return result;
  }, []).reduce((result, line) => {
    const existing = result.find((item) => item.listingId === line.listingId);
    if (existing) existing.quantity += line.quantity;
    else result.push({ ...line });
    return result;
  }, []);
}
