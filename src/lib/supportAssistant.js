const MASS_UNITS_IN_KG = {
  kg: 1,
  kgs: 1,
  kilogram: 1,
  kilograms: 1,
  quintal: 100,
  quintals: 100,
  ton: 1000,
  tons: 1000,
  tonne: 1000,
  tonnes: 1000,
};

const normalize = (value) => String(value || '')
  .normalize('NFKC')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, ' ');

const formatNumber = (value) => new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
}).format(value);

function findCrop(query, listings, cropTranslations) {
  const candidates = new Map();
  listings.forEach((listing) => {
    if (listing.crop) candidates.set(normalize(listing.crop), listing.crop);
  });
  Object.entries(cropTranslations).forEach(([crop, translated]) => {
    candidates.set(normalize(crop), crop);
    if (translated) candidates.set(normalize(translated), crop);
  });

  return [...candidates.entries()]
    .sort(([a], [b]) => b.length - a.length)
    .find(([name]) => name && query.includes(name))?.[1] || null;
}

function listingsForCrop(crop, listings, cropTranslations) {
  const translated = normalize(cropTranslations[crop]);
  const target = normalize(crop).replace(/\s*\([^)]*\)/g, '');
  return listings.filter((listing) => {
    if (listing.status && normalize(listing.status) !== 'active') return false;
    const name = normalize(listing.crop).replace(/\s*\([^)]*\)/g, '');
    return name === target || (translated && name === translated);
  });
}

function parseQuantity(query) {
  const match = query.match(/(\d+(?:[.,]\d+)?)\s*(kg|kgs|kilograms?|quintals?|tons?|tonnes?|ಕೆಜಿ|ಕಿಲೋ(?:ಗ್ರಾಂ)?|ಕ್ವಿಂಟಾಲ್)/i);
  if (!match) return null;

  const rawUnit = normalize(match[2]);
  const isQuintal = rawUnit.startsWith('quintal') || rawUnit === 'ಕ್ವಿಂಟಾಲ್';
  const isTon = rawUnit.startsWith('ton') || rawUnit.startsWith('tonne');
  const factor = rawUnit.startsWith('ಕಿ') ? 1 : (MASS_UNITS_IN_KG[rawUnit] || (isQuintal ? 100 : (isTon ? 1000 : 1)));
  return { amount: Number(match[1].replace(',', '.')), unit: 'kg', amountInKg: Number(match[1].replace(',', '.')) * factor };
}

function getAvailability(listings) {
  const totals = new Map();
  listings.forEach((listing) => {
    const amount = Number(listing.quantity) || 0;
    if (amount <= 0) return;
    const unit = normalize(listing.unit || 'kg');
    const factor = MASS_UNITS_IN_KG[unit];
    const key = factor ? 'kg' : unit;
    totals.set(key, (totals.get(key) || 0) + amount * (factor || 1));
  });
  return [...totals.entries()].map(([unit, amount]) => `${formatNumber(amount)} ${unit}`).join(', ');
}

function getPricePerKg(listings) {
  const prices = listings.flatMap((listing) => {
    const unit = normalize(listing.unit || 'kg');
    const factor = MASS_UNITS_IN_KG[unit];
    const price = Number(listing.expectedPrice ?? listing.price);
    return factor && price > 0 ? [price / factor] : [];
  });
  return prices.length ? Math.min(...prices) : null;
}

function answerInLanguage(english, kannada, isKannada) {
  return isKannada ? kannada : english;
}

function getAllAvailability(listings) {
  const crops = new Map();
  listings.filter((listing) => !listing.status || normalize(listing.status) === 'active')
    .forEach((listing) => {
      if (!listing.crop) return;
      const cropListings = crops.get(listing.crop) || [];
      cropListings.push(listing);
      crops.set(listing.crop, cropListings);
    });
  return [...crops.entries()]
    .map(([crop, cropListings]) => `${crop}: ${getAvailability(cropListings)}`)
    .filter((entry) => !entry.endsWith(': '))
    .slice(0, 8)
    .join('; ');
}

export function getSupportAnswer(message, listings = [], { cropTranslations = {}, isKannada = false } = {}) {
  const query = normalize(message);
  const crop = findCrop(query, listings, cropTranslations);

  if (/\b(weather|rain|rainfall|forecast|temperature)\b/i.test(query) || /ಹವಾಮಾನ|ಮಳೆ|ತಾಪಮಾನ/.test(query)) {
    return answerInLanguage(
      'I don’t have live weather data in this chat. For field decisions, check the latest IMD forecast for your district. If you share a crop question, I can offer general guidance, but local conditions and an agricultural expert’s advice matter.',
      'ಈ ಚಾಟ್‌ನಲ್ಲಿ ನೇರ ಹವಾಮಾನ ಮಾಹಿತಿ ಇಲ್ಲ. ಕೃಷಿ ನಿರ್ಧಾರಗಳಿಗೆ ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಇತ್ತೀಚಿನ IMD ಮುನ್ಸೂಚನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ. ಬೆಳೆ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಹುದು; ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿ ಮತ್ತು ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಮುಖ್ಯ.',
      isKannada,
    );
  }

  if (/\b(seed|sowing|sow|grow|growing|cultivat|irrigat|water|fertili[sz]er|soil|pests?|pesticides?|diseases?|fung|harvest|store|storage|organic)\b/i.test(query)
    || /ಬಿತ್ತನೆ|ಬೀಜ|ಬೆಳೆಸ|ನೀರಾವರಿ|ಗೊಬ್ಬರ|ಮಣ್ಣು|ಕೀಟ|ರೋಗ|ಕೊಯ್ಲು|ಸಂಗ್ರಹ/.test(query)) {
    return answerInLanguage(
      `For ${crop || 'crop'} growing, storage, or pest questions, the right advice depends on variety, soil, season, and local conditions. Follow the crop guidance from your local Krishi Vigyan Kendra or agriculture officer, and use only approved products according to their label. Share the crop, district, and symptoms for more focused general guidance.`,
      `${crop || 'ಬೆಳೆ'} ಬೆಳವಣಿಗೆ, ಸಂಗ್ರಹಣೆ ಅಥವಾ ಕೀಟ ಸಮಸ್ಯೆಗೆ ಸರಿಯಾದ ಸಲಹೆ ತಳಿ, ಮಣ್ಣು, ಋತು ಮತ್ತು ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಗಳ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ. ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ ಅಥವಾ ಕೃಷಿ ಅಧಿಕಾರಿಯ ಸಲಹೆ ಅನುಸರಿಸಿ; ಅನುಮೋದಿತ ಉತ್ಪನ್ನಗಳನ್ನು ಲೇಬಲ್ ಸೂಚನೆಯಂತೆ ಮಾತ್ರ ಬಳಸಿ. ಇನ್ನಷ್ಟು ಮಾರ್ಗದರ್ಶನಕ್ಕೆ ಬೆಳೆ, ಜಿಲ್ಲೆ ಮತ್ತು ಲಕ್ಷಣಗಳನ್ನು ತಿಳಿಸಿ.`,
      isKannada,
    );
  }

  if (/\b(fee|fees|commission|charge|charged|cost to use)\b/i.test(query) || /ಶುಲ್ಕ|ಕಮಿಷನ್/.test(query)) {
    return answerInLanguage(
      'RaithaMarga promotes direct farmer-to-buyer trade. Check the current listing and deal terms before confirming a transaction; the assistant cannot confirm any fee that is not shown in those terms.',
      'ರೈತಮಾರ್ಗ ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರ ನೇರ ವ್ಯಾಪಾರಕ್ಕೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ. ವ್ಯವಹಾರ ಖಚಿತಪಡಿಸುವ ಮೊದಲು ಪ್ರಸ್ತುತ ಪಟ್ಟಿ ಮತ್ತು ಒಪ್ಪಂದದ ಷರತ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ; ಅಲ್ಲಿ ತೋರಿಸದ ಶುಲ್ಕವನ್ನು ಸಹಾಯಕ ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
      isKannada,
    );
  }

  if (/\b(edit|change|update|remove|delete|cancel)\b/i.test(query) && /\b(listing|produce|crop|price|quantity)\b/i.test(query)) {
    return answerInLanguage(
      'Sign in as a farmer and open Farmer Dashboard → My Listings to review your produce. Where an edit option is available, update the listing there. If you cannot change or remove it, contact the RaithaMarga team from Contact Us.',
      'ರೈತರಾಗಿ ಲಾಗಿನ್ ಆಗಿ ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ → ನನ್ನ ಪಟ್ಟಿಗಳು ತೆರೆಯಿರಿ. ಸಂಪಾದನೆ ಆಯ್ಕೆ ಇದ್ದರೆ ಅಲ್ಲಿಂದ ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಿ. ಬದಲಾಯಿಸಲು ಅಥವಾ ತೆಗೆದುಹಾಕಲು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ Contact Us ಮೂಲಕ ರೈತಮಾರ್ಗ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      isKannada,
    );
  }

  if (/\b(offer|bid|negotiate|counter.?offer)\b/i.test(query) || /ಪ್ರಸ್ತಾವನೆ|ಬಿಡ್|ದರ ಮಾತುಕತೆ/.test(query)) {
    return answerInLanguage(
      'Open a produce listing while signed in as a buyer and use its offer or bid action if available. You can review your offers under Buyer Dashboard → My Bids. Availability and eligibility may depend on your account verification.',
      'ಖರೀದಿದಾರರಾಗಿ ಲಾಗಿನ್ ಆಗಿ ಉತ್ಪನ್ನ ಪಟ್ಟಿಯನ್ನು ತೆರೆಯಿರಿ; ಆಯ್ಕೆ ಇದ್ದರೆ ಬೆಲೆ ಪ್ರಸ್ತಾವನೆ ಅಥವಾ ಬಿಡ್ ಬಳಸಿ. Buyer Dashboard → My Bids ನಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಸ್ತಾವನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಲಭ್ಯತೆ ಮತ್ತು ಅರ್ಹತೆ ಖಾತೆ ಪರಿಶೀಲನೆಗೆ ಅವಲಂಬಿತವಾಗಿರಬಹುದು.',
      isKannada,
    );
  }

  if (/\b(cart|checkout|remove from cart|cart total)\b/i.test(query) || /ಕಾರ್ಟ್|ಚೆಕ್.?ಔಟ್/.test(query)) {
    return answerInLanguage(
      'Your cart is available from Buyer Dashboard → Cart. Review each listing and quantity before proceeding. Adding an item to the cart does not reserve stock; the final availability and price must be confirmed for the deal.',
      'Buyer Dashboard → Cart ನಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಟ್ ತೆರೆಯಿರಿ. ಮುಂದುವರಿಯುವ ಮೊದಲು ಪ್ರತಿ ಪಟ್ಟಿ ಮತ್ತು ಪ್ರಮಾಣ ಪರಿಶೀಲಿಸಿ. ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸುವುದರಿಂದ ದಾಸ್ತಾನು ಕಾಯ್ದಿರಿಸಲಾಗುವುದಿಲ್ಲ; ಒಪ್ಪಂದಕ್ಕೆ ಅಂತಿಮ ಲಭ್ಯತೆ ಮತ್ತು ಬೆಲೆಯನ್ನು ಖಚಿತಪಡಿಸಿ.',
      isKannada,
    );
  }

  if (/\b(complaint|problem|issue|error|not working|bug|stuck)\b/i.test(query) || /ದೂರು|ಸಮಸ್ಯೆ|ದೋಷ/.test(query)) {
    return answerInLanguage(
      'Sorry you’re having trouble. Try refreshing the page and signing in again. If it continues, use Contact Us and include the page, what you were trying to do, and the exact error message—never send your password or verification codes.',
      'ನಿಮಗೆ ತೊಂದರೆಯಾಗಿರುವುದಕ್ಕೆ ವಿಷಾದ. ಪುಟವನ್ನು ಮರುಲೋಡ್ ಮಾಡಿ ಮತ್ತೆ ಲಾಗಿನ್ ಆಗಿ. ಸಮಸ್ಯೆ ಮುಂದುವರಿದರೆ Contact Us ಮೂಲಕ ಪುಟದ ಹೆಸರು, ನೀವು ಮಾಡಲು ಯತ್ನಿಸಿದ ಕೆಲಸ ಮತ್ತು ನಿಖರ ದೋಷ ಸಂದೇಶ ಕಳುಹಿಸಿ—ಪಾಸ್‌ವರ್ಡ್ ಅಥವಾ ಪರಿಶೀಲನಾ ಕೋಡ್ ಕಳುಹಿಸಬೇಡಿ.',
      isKannada,
    );
  }

  if (/\b(how|what|who|why)\b/i.test(query) && /\b(raithamarga|platform|marketplace|work|works)\b/i.test(query)) {
    return answerInLanguage(
      'RaithaMarga is a farmer-to-buyer marketplace. Farmers list produce with quantity and expected price; buyers browse available listings and can add produce to a cart or make an offer where available. Account verification and deal terms may affect some actions.',
      'ರೈತಮಾರ್ಗ ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸುವ ಮಾರುಕಟ್ಟೆ. ರೈತರು ಪ್ರಮಾಣ ಮತ್ತು ನಿರೀಕ್ಷಿತ ಬೆಲೆಯೊಂದಿಗೆ ಉತ್ಪನ್ನ ಪಟ್ಟಿ ಮಾಡುತ್ತಾರೆ; ಖರೀದಿದಾರರು ಲಭ್ಯವಿರುವ ಪಟ್ಟಿಗಳನ್ನು ನೋಡಿ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಬಹುದು ಅಥವಾ ಆಯ್ಕೆ ಇದ್ದರೆ ಪ್ರಸ್ತಾವನೆ ಮಾಡಬಹುದು. ಕೆಲವು ಕ್ರಮಗಳಿಗೆ ಖಾತೆ ಪರಿಶೀಲನೆ ಮತ್ತು ಒಪ್ಪಂದದ ಷರತ್ತುಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.',
      isKannada,
    );
  }

  if (crop) {
    const matches = listingsForCrop(crop, listings, cropTranslations);
    const quantity = parseQuantity(query);
    const asksPrice = /\b(price|cost|rate|rupees?)\b/i.test(query)
      || query.includes('₹')
      || query.includes('ಬೆಲೆ')
      || query.includes('ದರ');
    if (quantity || asksPrice) {
      if (!matches.length) {
        return answerInLanguage(
          `I couldn't find an active ${crop} listing right now, so I can't quote a current price. Please check Browse Produce again later.`,
          `ಈಗ ${crop} ಸಕ್ರಿಯ ಪಟ್ಟಿಯಲ್ಲಿ ಕಾಣುತ್ತಿಲ್ಲ; ಆದ್ದರಿಂದ ಪ್ರಸ್ತುತ ಬೆಲೆಯನ್ನು ಹೇಳಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.`,
          isKannada,
        );
      }

      const pricePerKg = getPricePerKg(matches);
      if (quantity && pricePerKg !== null) {
        const total = quantity.amountInKg * pricePerKg;
        return answerInLanguage(
          `For ${formatNumber(quantity.amountInKg)} kg of ${crop}, the estimate starts at ₹${formatNumber(total)} (from ₹${formatNumber(pricePerKg)}/kg). This is an estimate based on the lowest active listing; the final price depends on the selected farmer and listing.`,
          `${formatNumber(quantity.amountInKg)} ಕೆಜಿ ${crop}ಗೆ ಅಂದಾಜು ಬೆಲೆ ₹${formatNumber(total)}ರಿಂದ (₹${formatNumber(pricePerKg)}/ಕೆಜಿ). ಇದು ಲಭ್ಯವಿರುವ ಕಡಿಮೆ ದರದ ಆಧಾರದ ಅಂದಾಜು; ಅಂತಿಮ ಬೆಲೆ ಆಯ್ಕೆ ಮಾಡಿದ ರೈತ ಮತ್ತು ಪಟ್ಟಿಯ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ.`,
          isKannada,
        );
      }

      const prices = matches
        .map((listing) => Number(listing.expectedPrice ?? listing.price))
        .filter((price) => price > 0);
      const lowest = prices.length ? Math.min(...prices) : null;
      const unit = normalize(matches.find((listing) => Number(listing.expectedPrice ?? listing.price) === lowest)?.unit || 'kg');
      return answerInLanguage(
        lowest === null
          ? `I found ${crop} listings, but they don't include a price yet. Please open Browse Produce to check the listing details.`
          : `Active ${crop} listings start at ₹${formatNumber(lowest)}/${unit}. Prices can vary by farmer and listing.`,
        lowest === null
          ? `${crop} ಪಟ್ಟಿಗಳು ಸಿಕ್ಕಿವೆ, ಆದರೆ ಅವುಗಳಲ್ಲಿ ಬೆಲೆ ಇಲ್ಲ. ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.`
          : `${crop} ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳ ಬೆಲೆ ₹${formatNumber(lowest)}/${unit}ರಿಂದ ಆರಂಭವಾಗುತ್ತದೆ. ರೈತ ಮತ್ತು ಪಟ್ಟಿಯ ಪ್ರಕಾರ ಬೆಲೆ ಬದಲಾಗಬಹುದು.`,
        isKannada,
      );
    }

    const availability = getAvailability(matches);
    if (!availability) {
      return answerInLanguage(
        `I couldn't find active ${crop} inventory right now. Please check Browse Produce again later.`,
        `ಈಗ ${crop} ಸಕ್ರಿಯ ದಾಸ್ತಾನು ಕಾಣುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.`,
        isKannada,
      );
    }
    return answerInLanguage(
      `There are ${availability} of ${crop} across ${matches.length} active listing${matches.length === 1 ? '' : 's'}.`,
      `${matches.length} ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳಲ್ಲಿ ಒಟ್ಟು ${crop}: ${availability}.`,
      isKannada,
    );
  }

  if (/\b(hi|hello|hey)\b/i.test(query) || query.includes('ನಮಸ್ಕಾರ') || query.includes('ಹಾಯ್')) {
    return answerInLanguage(
      'Hello! I’m your Market Assistant. Ask me about available produce, prices, buying, or listing your harvest.',
      'ನಮಸ್ಕಾರ! ನಾನು ಮಾರುಕಟ್ಟೆ ಸಹಾಯಕ. ಲಭ್ಯವಿರುವ ಉತ್ಪನ್ನಗಳು, ಬೆಲೆ, ಖರೀದಿ ಅಥವಾ ನಿಮ್ಮ ಬೆಳೆ ಪಟ್ಟಿ ಮಾಡುವ ಬಗ್ಗೆ ಕೇಳಿ.',
      isKannada,
    );
  }
  if (/\b(how|what|work|platform)\b/i.test(query) && /\b(work|platform)\b/i.test(query)) {
    return answerInLanguage(
      'RaithaMarga connects farmers directly with buyers. Farmers publish produce listings with quantity and expected price; buyers browse listings and can start a deal or make an offer.',
      'ರೈತಮಾರ್ಗ ರೈತರನ್ನು ನೇರವಾಗಿ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ. ರೈತರು ಪ್ರಮಾಣ ಮತ್ತು ನಿರೀಕ್ಷಿತ ಬೆಲೆಯೊಂದಿಗೆ ಉತ್ಪನ್ನ ಪಟ್ಟಿ ಮಾಡುತ್ತಾರೆ; ಖರೀದಿದಾರರು ಅವುಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ ಒಪ್ಪಂದ ಅಥವಾ ಬೆಲೆ ಪ್ರಸ್ತಾವನೆ ಆರಂಭಿಸಬಹುದು.',
      isKannada,
    );
  }
  if (/\b(farmer|sell|selling|list|listing|harvest)\b/i.test(query) || /ರೈತ|ಮಾರಾಟ|ಪಟ್ಟಿ/.test(query)) {
    return answerInLanguage(
      'To sell, sign in or register as a farmer, then open Farmer Dashboard → Add Produce. Add the crop, available quantity, unit, expected price, and availability details.',
      'ಮಾರಾಟ ಮಾಡಲು ರೈತರಾಗಿ ನೋಂದಣಿ ಮಾಡಿ ಅಥವಾ ಲಾಗಿನ್ ಆಗಿ. ನಂತರ ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ → ಉತ್ಪನ್ನ ಸೇರಿಸಿ ತೆರೆಯಿರಿ. ಬೆಳೆ, ಪ್ರಮಾಣ, ಘಟಕ, ನಿರೀಕ್ಷಿತ ಬೆಲೆ ಮತ್ತು ಲಭ್ಯತೆಯ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ.',
      isKannada,
    );
  }
  if (/\b(buyer|buy|buying|purchase|cart|browse)\b/i.test(query) || /ಖರೀದಿ|ಖರೀದಿದಾರ/.test(query)) {
    return answerInLanguage(
      'To buy, sign in or register as a buyer, then open Buyer Dashboard → Browse Produce. Review a listing and add it to your cart or make an offer where available.',
      'ಖರೀದಿಸಲು ಖರೀದಿದಾರರಾಗಿ ನೋಂದಣಿ ಮಾಡಿ ಅಥವಾ ಲಾಗಿನ್ ಆಗಿ. ನಂತರ ಖರೀದಿದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ → ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ ತೆರೆಯಿರಿ. ಪಟ್ಟಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ ಅಥವಾ ಲಭ್ಯವಿದ್ದರೆ ಬೆಲೆ ಪ್ರಸ್ತಾವನೆ ಮಾಡಿ.',
      isKannada,
    );
  }
  if (/\b(register|sign up|account|login|log in|password)\b/i.test(query) || /ನೋಂದಣಿ|ಲಾಗಿನ್/.test(query)) {
    return answerInLanguage(
      'You can create a farmer or buyer account from Get Started, or sign in from the Login page. Choose the role that matches how you’ll use RaithaMarga.',
      'Get Started ಮೂಲಕ ರೈತ ಅಥವಾ ಖರೀದಿದಾರ ಖಾತೆ ತೆರೆಯಬಹುದು, ಅಥವಾ Login ಪುಟದಿಂದ ಲಾಗಿನ್ ಆಗಬಹುದು. ರೈತಮಾರ್ಗವನ್ನು ಬಳಸುವ ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      isKannada,
    );
  }
  if (/\b(verify|verification|verified)\b/i.test(query) || /ಪರಿಶೀಲನೆ/.test(query)) {
    return answerInLanguage(
      'Verification status is shown in your account dashboard. If your status is pending or you need help, use the Contact Us section and our support team can assist.',
      'ನಿಮ್ಮ ಖಾತೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಪರಿಶೀಲನೆ ಸ್ಥಿತಿಯನ್ನು ನೋಡಬಹುದು. ಸ್ಥಿತಿ ಬಾಕಿ ಇದ್ದರೆ ಅಥವಾ ಸಹಾಯ ಬೇಕಿದ್ದರೆ Contact Us ವಿಭಾಗದ ಮೂಲಕ ನಮ್ಮ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      isKannada,
    );
  }
  if (/\b(payment|pickup|delivery|shipping|deal)\b/i.test(query) || /ಪಾವತಿ|ವಿತರಣೆ|ಒಪ್ಪಂದ/.test(query)) {
    return answerInLanguage(
      'Pickup, delivery, and payment arrangements can depend on the specific deal. Please confirm the details with the other party and contact support from the Contact Us section if you need help.',
      'ಸಂಗ್ರಹಣೆ, ವಿತರಣೆ ಮತ್ತು ಪಾವತಿ ವ್ಯವಸ್ಥೆಗಳು ಒಪ್ಪಂದದ ಪ್ರಕಾರ ಬದಲಾಗಬಹುದು. ವಿವರಗಳನ್ನು ಎದುರಿನ ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಖಚಿತಪಡಿಸಿ; ಸಹಾಯಕ್ಕೆ Contact Us ವಿಭಾಗದ ಮೂಲಕ ನಮ್ಮ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      isKannada,
    );
  }
  if (/\b(contact|support|help)\b/i.test(query) || /ಸಹಾಯ|ಸಂಪರ್ಕ/.test(query)) {
    return answerInLanguage(
      'You can reach the RaithaMarga team from the Contact Us section on the home page, by email at raithamargaofficial@gmail.com, or on WhatsApp at 6360340277. Tell us whether you need help with a listing, buyer inquiry, verification, or a deal.',
      'ಮುಖಪುಟದ Contact Us ವಿಭಾಗದ ಮೂಲಕ, raithamargaofficial@gmail.com ಇಮೇಲ್ ಮೂಲಕ ಅಥವಾ 6360340277 WhatsApp ಸಂಖ್ಯೆಯಲ್ಲಿ ರೈತಮಾರ್ಗ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ. ಪಟ್ಟಿ, ಖರೀದಿದಾರರ ವಿಚಾರಣೆ, ಪರಿಶೀಲನೆ ಅಥವಾ ಒಪ್ಪಂದದ ಸಹಾಯ ಬೇಕೇ ಎಂದು ತಿಳಿಸಿ.',
      isKannada,
    );
  }
  if (/\b(what|which|available|availability|stock|inventory|produce|crops?)\b/i.test(query) || /ಯಾವ|ಲಭ್ಯ|ದಾಸ್ತಾನು|ಉತ್ಪನ್ನಗಳು/.test(query)) {
    const availability = getAllAvailability(listings);
    return answerInLanguage(
      availability
        ? `Here’s the active marketplace availability I can see: ${availability}. Ask about a crop for its exact total or a quantity-price estimate.`
        : 'I can’t see active marketplace listings right now. Please check Browse Produce again later.',
      availability
        ? `ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಈಗ ಕಾಣುವ ಸಕ್ರಿಯ ಲಭ್ಯತೆ: ${availability}. ನಿರ್ದಿಷ್ಟ ಬೆಳೆ ಅಥವಾ ಪ್ರಮಾಣದ ಬೆಲೆ ಅಂದಾಜಿಗಾಗಿ ಅದರ ಹೆಸರನ್ನು ಕೇಳಿ.`
        : 'ಈಗ ಸಕ್ರಿಯ ಮಾರುಕಟ್ಟೆ ಪಟ್ಟಿಗಳು ಕಾಣುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.',
      isKannada,
    );
  }
  return answerInLanguage(
    'I can help with marketplace inventory and price estimates, accounts, listings, offers, deals, and general crop questions. I don’t have live weather or access to private account/deal records, and I may not know every topic. Rephrase your question with more detail, or contact the team from Contact Us for a human response.',
    'ಮಾರುಕಟ್ಟೆ ದಾಸ್ತಾನು ಮತ್ತು ಬೆಲೆ ಅಂದಾಜು, ಖಾತೆ, ಪಟ್ಟಿಗಳು, ಪ್ರಸ್ತಾವನೆಗಳು, ಒಪ್ಪಂದಗಳು ಮತ್ತು ಬೆಳೆಗಳ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನೇರ ಹವಾಮಾನ ಅಥವಾ ಖಾಸಗಿ ಖಾತೆ/ಒಪ್ಪಂದದ ದಾಖಲೆಗಳಿಗೆ ಪ್ರವೇಶವಿಲ್ಲ; ಎಲ್ಲ ವಿಷಯಗಳೂ ತಿಳಿದಿರಬೇಕೆಂದಿಲ್ಲ. ಹೆಚ್ಚಿನ ವಿವರಗಳೊಂದಿಗೆ ಮತ್ತೆ ಕೇಳಿ ಅಥವಾ ಮಾನವ ಸಹಾಯಕ್ಕೆ Contact Us ಮೂಲಕ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    isKannada,
  );
}
