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
  name.trim().toLowerCase().replace(/[\s_]+/g, '-');

export const findImageCrop = (name) => {
  const normalizedName = normalizeCropName(name);
  return IMAGE_CROPS.find(
    (crop) =>
      crop.id === normalizedName ||
      normalizeCropName(crop.name) === normalizedName,
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

// Crop categories shown on the farmer registration form.
// Shape: [{ value, label, crops: [{ value, label }] }]
// `value` of a crop is what gets stored as the farmer's preferred crop.
const crop = (name) => ({ value: name, label: name });

export const CROP_CATEGORIES = [
  {
    value: 'vegetables',
    label: 'Vegetables',
    crops: ['Tomato', 'Onion', 'Potato', 'Carrot', 'Cabbage', 'Cauliflower', 'Brinjal', 'Beans', 'Capsicum', 'Green Chilli', 'Okra', 'Cucumber', 'Pumpkin', 'Beetroot', 'Radish', 'Drumstick'].map(crop),
  },
  {
    value: 'fruits',
    label: 'Fruits',
    crops: ['Mango', 'Banana', 'Grapes', 'Pomegranate', 'Papaya', 'Guava', 'Sapota', 'Watermelon', 'Orange', 'Lemon', 'Coconut', 'Jackfruit'].map(crop),
  },
  {
    value: 'cereals',
    label: 'Cereals & Millets',
    crops: ['Ragi', 'Paddy', 'Maize', 'Jowar', 'Bajra', 'Wheat', 'Foxtail Millet'].map(crop),
  },
  {
    value: 'pulses',
    label: 'Pulses',
    crops: ['Tur Dal', 'Bengal Gram', 'Green Gram', 'Black Gram', 'Horse Gram', 'Cowpea', 'Field Beans'].map(crop),
  },
  {
    value: 'oilseeds',
    label: 'Oilseeds',
    crops: ['Groundnut', 'Sunflower', 'Soybean', 'Sesame', 'Castor', 'Safflower'].map(crop),
  },
  {
    value: 'cash_crops',
    label: 'Cash & Plantation Crops',
    crops: ['Sugarcane', 'Cotton', 'Coffee', 'Arecanut', 'Turmeric', 'Ginger', 'Pepper', 'Cardamom', 'Tobacco'].map(crop),
  },
  {
    value: 'flowers',
    label: 'Flowers',
    crops: ['Marigold', 'Rose', 'Jasmine', 'Chrysanthemum', 'Crossandra'].map(crop),
  },
];