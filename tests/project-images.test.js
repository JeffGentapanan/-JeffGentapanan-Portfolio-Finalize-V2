import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateImageFile, MAX_IMAGE_BYTES } from '../src/lib/project-images.js';
test('image uploads restrict type, empty files and maximum size', () => {
  assert.equal(validateImageFile({ type: 'image/png', size: 1024 }), null);
  assert.ok(validateImageFile({ type: 'image/svg+xml', size: 1024 }));
  assert.ok(validateImageFile({ type: 'image/png', size: MAX_IMAGE_BYTES + 1 }));
  assert.ok(validateImageFile({ type: 'image/jpeg', size: 0 }));
});
