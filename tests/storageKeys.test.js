import assert from 'node:assert/strict';
import test from 'node:test';
import { accountStorageKey, STORAGE_KEYS } from '../src/data/storageKeys.js';

test('profile storage keys are isolated by account UID', () => {
  const firstBuyerKey = accountStorageKey(STORAGE_KEYS.BUYER_PROFILE, 'buyer-one');
  const secondBuyerKey = accountStorageKey(STORAGE_KEYS.BUYER_PROFILE, 'buyer-two');

  assert.notEqual(firstBuyerKey, secondBuyerKey);
  assert.equal(firstBuyerKey, `${STORAGE_KEYS.BUYER_PROFILE}.buyer-one`);
});

test('profile storage keys require a signed-in account', () => {
  assert.throws(() => accountStorageKey(STORAGE_KEYS.FARMER_PROFILE, undefined), /signed-in account/);
});
