import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeProjects, isWebUrl, validateProject } from '../src/lib/project-store.js';
const valid = { id: 'one', title: 'Project', url: 'https://example.com', category: 'Design', tagline: 'A study.', thumbnail: '' };
test('rejects executable and malformed URLs', () => { for (const url of ['javascript:alert(1)', 'data:text/html,hello', '/relative', 'invalid'])
    assert.equal(isWebUrl(url), false); assert.equal(isWebUrl('https://example.com/path'), true); });
test('validates project metadata and image URLs', () => { assert.equal(validateProject(valid), null); assert.ok(validateProject({ ...valid, title: ' ' })); assert.ok(validateProject({ ...valid, thumbnail: 'javascript:alert(1)' })); });
test('preserves a deliberately empty collection', () => { assert.deepEqual(decodeProjects('[]'), []); });
test('rejects corrupt storage and duplicate IDs', () => { assert.throws(() => decodeProjects('{')); assert.throws(() => decodeProjects(JSON.stringify([valid, valid]))); assert.throws(() => decodeProjects('[{"id":"x"}]')); assert.deepEqual(decodeProjects(JSON.stringify([valid])), [valid]); });
test('accepts bundled thumbnails without allowing arbitrary paths', () => { assert.equal(validateProject({ ...valid, thumbnail: '/portfolio/todos-preview.png' }), null); assert.ok(validateProject({ ...valid, thumbnail: '//evil.example/img.png' })); assert.ok(validateProject({ ...valid, thumbnail: '/portfolio/../secret.png' })); });
test('link cards may omit descriptions and thumbnail images', () => { assert.equal(validateProject({ ...valid, tagline: '', thumbnail: '' }), null); });
