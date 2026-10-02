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