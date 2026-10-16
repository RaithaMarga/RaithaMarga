const makeCrop = (id, name, category) => ({
  id,
  name,
  category,
  imageFile: `${id}.jpg`,
});

const vegetableImages = import.meta.glob('../assets/images/vegetables/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
});
const fruitImages = import.meta.glob('../assets/images/fruits/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
});

export const IMAGE_CROPS = [
  ...[
    ['tomato', 'Tomato'],
    ['onion', 'Onion'],
    ['potato', 'Potato'],
    ['green-chilli', 'Green Chilli'],
    ['carrot', 'Carrot'],
    ['cabbage', 'Cabbage'],
    ['cauliflower', 'Cauliflower'],
    ['brinjal', 'Brinjal'],
    ['okra', 'Okra'],
    ['cucumber', 'Cucumber'],
    ['beans', 'Beans'],
    ['spinach', 'Spinach'],
  ].map(([id, name]) => makeCrop(id, name, 'Vegetable')),
  ...[
    ['mango', 'Mango'],
    ['banana', 'Banana'],
    ['apple', 'Apple'],
    ['orange', 'Orange'],
    ['papaya', 'Papaya'],
    ['watermelon', 'Watermelon'],
    ['grapes', 'Grapes'],
    ['pineapple', 'Pineapple'],
    ['guava', 'Guava'],
    ['pomegranate', 'Pomegranate'],
    ['jackfruit', 'Jackfruit'],
    ['lemon', 'Lemon'],
  ].map(([id, name]) => makeCrop(id, name, 'Fruit')),
].map((crop) => ({
  ...crop,
  image: (crop.category === 'Vegetable' ? vegetableImages : fruitImages)[
    `../assets/images/${crop.category === 'Vegetable' ? 'vegetables' : 'fruits'}/${crop.imageFile}`
  ] ?? null,
}));

const normalizeCropName = (name) =>
  String(name)
    .replace(/\s*\([^)]*\)/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');

export const findImageCrop = (name) => {
  if (!name) return null;
  const normalizedName = normalizeCropName(name);
  const names = new Set([normalizedName]);
  if (normalizedName.endsWith('ies')) names.add(`${normalizedName.slice(0, -3)}y`);
  if (normalizedName.endsWith('es')) names.add(normalizedName.slice(0, -2));
  if (normalizedName.endsWith('s')) names.add(normalizedName.slice(0, -1));
  return IMAGE_CROPS.find(
    (crop) => names.has(crop.id) || names.has(normalizeCropName(crop.name)),
  ) ?? null;
};

export const CROP_SUGGESTIONS = [...new Set([
  ...IMAGE_CROPS.map(({ name }) => name),
  'Capsicum',
  'Pumpkin',
  'Beetroot',
  'Radish',
  'Drumstick',
  'Sapota',
  'Coconut',
  'Ragi',
  'Paddy',
  'Maize',
  'Jowar',
  'Bajra',
  'Wheat',
  'Foxtail Millet',
  'Tur Dal',
  'Bengal Gram',
  'Green Gram',
  'Black Gram',
  'Horse Gram',
  'Cowpea',
  'Field Beans',
  'Groundnut',
  'Sunflower',
  'Soybean',
  'Sesame',
  'Castor',
  'Safflower',
  'Sugarcane',
  'Cotton',
  'Coffee',
  'Arecanut',
  'Turmeric',
  'Ginger',
  'Pepper',
  'Cardamom',
  'Tobacco',
  'Marigold',
  'Rose',
  'Jasmine',
  'Chrysanthemum',
  'Crossandra',
])];

export const CROP_KANNADA_MAP = {
  Tomato: 'ಟೊಮೆಟೊ',
  Onion: 'ಈರುಳ್ಳಿ',
  Potato: 'ಆಲೂಗಡ್ಡೆ',
  Carrot: 'ಕ್ಯಾರೆಟ್',
  Cabbage: 'ಎಲೆಕೋಸು',
  Cauliflower: 'ಹೂಕೋಸು',
  Brinjal: 'ಬದನೆಕಾಯಿ',
  Beans: 'ಬೀನ್ಸ್',
  Capsicum: 'ದಪ್ಪ ಮೆಣಸಿನಕಾಯಿ',
  'Green Chilli': 'ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ',
  Okra: 'ಬೆಂಡೆಕಾಯಿ',
  Cucumber: 'ಸೌತೆಕಾಯಿ',
  Pumpkin: 'ಕುಂಬಳಕಾಯಿ',
  Beetroot: 'ಬೀಟ್‌ರೂಟ್',
  Radish: 'ಮೂಲಂಗಿ',
  Drumstick: 'ನುಗ್ಗೆಕಾಯಿ',
  Mango: 'ಮಾವಿನ ಹಣ್ಣು',
  Banana: 'ಬಾಳೆಹಣ್ಣು',
  Grapes: 'ದ್ರಾಕ್ಷಿ',
  Pomegranate: 'ದಾಳಿಂಬೆ',
  Papaya: 'ಪಪ್ಪಾಯಿ',
  Guava: 'ಸೀಬೆಹಣ್ಣು',
  Sapota: 'ಸಪೋಟ',
  Watermelon: 'ಕಲ್ಲಂಗಡಿ',
  Orange: 'ಕಿತ್ತಳೆ',
  Lemon: 'ನಿಂಬೆಹಣ್ಣು',
  Coconut: 'ತೆಂಗಿನಕಾಯಿ',
  Jackfruit: 'ಹಲಸಿನ ಹಣ್ಣು',
  Ragi: 'ರಾಗಿ',
  Paddy: 'ಭತ್ತ',
  Maize: 'ಮೆಕ್ಕೆಜೋಳ',
  Jowar: 'ಜೋಳ',
  Bajra: 'ಸಜ್ಜೆ',
  Wheat: 'ಗೋಧಿ',
  'Foxtail Millet': 'ನವಣೆ',
  'Tur Dal': 'ತೊಗರಿ ಬೇಳೆ',
  'Bengal Gram': 'ಕಡಲೆ',
  'Green Gram': 'ಹೆಸರು ಕಾಳು',
  'Black Gram': 'ಉದ್ದಿನ ಕಾಳು',
  'Horse Gram': 'ಹುರುಳಿ',
  Cowpea: 'ಅಲಸಂದಿ',
  'Field Beans': 'ಅವರೆಕಾಳು',
  Groundnut: 'ಕಡಲೆಕಾಯಿ',
  Sunflower: 'ಸೂರ್ಯಕಾಂತಿ',
  Soybean: 'ಸೋಯಾಬೀನ್',
  Sesame: 'ಎಳ್ಳು',
  Castor: 'ಹರಳು',
  Safflower: 'ಕುಸುಮೆ',
  Sugarcane: 'ಕಬ್ಬು',
  Cotton: 'ಹತ್ತಿ',
  Coffee: 'ಕಾಫಿ',
  Arecanut: 'ಅಡಿಕೆ',
  Turmeric: 'ಅರಿಶಿನ',
  Ginger: 'ಶುಂಠಿ',
  Pepper: 'ಕಾಳುಮೆಣಸು',
  Cardamom: 'ಏಲಕ್ಕಿ',
  Tobacco: 'ತಂಬಾಕು',
  Marigold: 'ಚೆಂಡು ಹೂ',
  Rose: 'ಗುಲಾಬಿ',
  Jasmine: 'ಮಲ್ಲಿಗೆ',
  Chrysanthemum: 'ಸೇವಂತಿಗೆ',
  Crossandra: 'ಕನಕಾಂಬರ',
};

// Formats each crop as: English (ಕನ್ನಡ)
const crop = (name) => {
  const kn = CROP_KANNADA_MAP[name];
  return {
    value: name,
    label: kn ? `${name} (${kn})` : name,
  };
};

export const CROP_CATEGORIES = [
  {
    value: 'vegetables',
    label: 'Vegetables (ತರಕಾರಿಗಳು)',
    crops: ['Tomato', 'Onion', 'Potato', 'Carrot', 'Cabbage', 'Cauliflower', 'Brinjal', 'Beans', 'Capsicum', 'Green Chilli', 'Okra', 'Cucumber', 'Pumpkin', 'Beetroot', 'Radish', 'Drumstick'].map(crop),
  },
  {
    value: 'fruits',
    label: 'Fruits (ಹಣ್ಣುಗಳು)',
    crops: ['Mango', 'Banana', 'Grapes', 'Pomegranate', 'Papaya', 'Guava', 'Sapota', 'Watermelon', 'Orange', 'Lemon', 'Coconut', 'Jackfruit'].map(crop),
  },
  {
    value: 'cereals',
    label: 'Cereals & Millets (ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು)',
    crops: ['Ragi', 'Paddy', 'Maize', 'Jowar', 'Bajra', 'Wheat', 'Foxtail Millet'].map(crop),
  },
  {
    value: 'pulses',
    label: 'Pulses (ಬೇಳೆಕಾಳುಗಳು)',
    crops: ['Tur Dal', 'Bengal Gram', 'Green Gram', 'Black Gram', 'Horse Gram', 'Cowpea', 'Field Beans'].map(crop),
  },
  {
    value: 'oilseeds',
    label: 'Oilseeds (ಎಣ್ಣೆಕಾಳುಗಳು)',
    crops: ['Groundnut', 'Sunflower', 'Soybean', 'Sesame', 'Castor', 'Safflower'].map(crop),
  },
  {
    value: 'cash_crops',
    label: 'Cash & Plantation Crops (ವಾಣಿಜ್ಯ ಮತ್ತು ತೋಟದ ಬೆಳೆಗಳು)',
    crops: ['Sugarcane', 'Cotton', 'Coffee', 'Arecanut', 'Turmeric', 'Ginger', 'Pepper', 'Cardamom', 'Tobacco'].map(crop),
  },
  {
    value: 'flowers',
    label: 'Flowers (ಹೂಗಳು)',
    crops: ['Marigold', 'Rose', 'Jasmine', 'Chrysanthemum', 'Crossandra'].map(crop),
  },
];