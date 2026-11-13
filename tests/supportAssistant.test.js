import test from 'node:test';
import assert from 'node:assert/strict';
import { getSupportAnswer } from '../src/lib/supportAssistant.js';

const listings = [
  { crop: 'Onion', quantity: 300, unit: 'kg', expectedPrice: 24, status: 'active' },
  { crop: 'Onion', quantity: 2, unit: 'quintal', expectedPrice: 2200, status: 'active' },
  { crop: 'Onion', quantity: 500, unit: 'kg', expectedPrice: 20, status: 'sold' },
  { crop: 'Tomato', quantity: 50, unit: 'kg', expectedPrice: 30, status: 'active' },
];

test('answers availability by summing active crop inventory across mass units', () => {
  assert.match(getSupportAnswer('How many kgs of onion are available?', listings), /500 kg/);
});

test('estimates the requested quantity from the lowest active per-kilogram listing', () => {
  assert.match(getSupportAnswer('What is the price for 2 kg of onion?', listings), /₹44/);
  assert.match(getSupportAnswer('What is the price for 2 kg of onion?', listings), /estimate/i);
});

test('supports Kannada crop names in inventory questions', () => {
  assert.match(
    getSupportAnswer('ಈರುಳ್ಳಿ ಎಷ್ಟು ಲಭ್ಯವಿದೆ?', listings, {
      cropTranslations: { Onion: 'ಈರುಳ್ಳಿ' },
      isKannada: true,
    }),
    /500 kg/,
  );
});

test('estimates Kannada quantity-price questions and lists visible produce', () => {
  assert.match(
    getSupportAnswer('2 ಕೆಜಿ ಈರುಳ್ಳಿಯ ಬೆಲೆ ಎಷ್ಟು?', listings, {
      cropTranslations: { Onion: 'ಈರುಳ್ಳಿ' },
      isKannada: true,
    }),
    /₹44/,
  );
  assert.match(getSupportAnswer('What produce is available?', listings), /Onion: 500 kg/);
});

test('answers common buying questions and safely handles unknown crops', () => {
  assert.match(getSupportAnswer('How do I buy produce?', listings), /Buyer Dashboard/);
  assert.match(
    getSupportAnswer('How much pumpkin is available?', listings, {
      cropTranslations: { Pumpkin: 'ಕುಂಬಳಕಾಯಿ' },
    }),
    /couldn.t find active Pumpkin/i,
  );
});

test('covers offers, account issues, and broader marketplace help questions', () => {
  assert.match(getSupportAnswer('How do I make an offer?', listings), /My Bids/);
  assert.match(getSupportAnswer('I have an error and it is not working', listings), /never send your password/i);
  assert.match(getSupportAnswer('How does the RaithaMarga marketplace work?', listings), /farmer-to-buyer marketplace/i);
});

test('does not invent live weather or crop treatment recommendations', () => {
  assert.match(getSupportAnswer('What is the weather tomorrow?', listings), /don’t have live weather data/i);
  assert.match(getSupportAnswer('What pesticide should I use for onion pests?', listings), /local Krishi Vigyan Kendra/i);
});

test('provides safe cart and fee guidance', () => {
  assert.match(getSupportAnswer('Does cart reserve the produce?', listings), /does not reserve stock/i);
  assert.match(getSupportAnswer('What commission do you charge?', listings), /cannot confirm any fee/i);
});
