import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  createApi,
  localOrigin,
  makeCredential,
  validateProjects,
  validateSkills,
} from '../server/api.mjs';

test('server validation rejects unsafe links and malformed skill collections', () => {
  assert.equal(
    validateProjects([
      {
        id: 'x',
        title: 'X',
        url: 'javascript:alert(1)',
        category: 'Web',
        tagline: '',
        thumbnail: '',
      },
    ]),
    false
  );
  assert.equal(validateSkills([{ id: 'a', title: 'Tools', items: ['React', 'React'] }]), false);
  assert.equal(validateSkills([{ id: 'a', title: 'Tools', items: ['React'] }]), true);
});
test('owner API enforces session, origin, CSRF, persistent writes, and logout', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'jeff-owner-test-'));
  await mkdir(path.join(root, 'src/data'), { recursive: true });
  await mkdir(path.join(root, '.private'));
  await writeFile(path.join(root, 'src/data/projects.json'), '[]');
  await writeFile(path.join(root, 'src/data/skills.json'), '[]');
  await writeFile(
    path.join(root, '.private/owner.json'),
    JSON.stringify(await makeCredential('test-only-owner-password'))
  );
  const handler = createApi({ root, originForRequest: localOrigin });
  const server = createServer((req, res) => void handler(req, res));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const request = (route, method = 'GET', body, headers = {}) =>
    fetch(origin + route, {
      method,
      headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  try {
    assert.equal((await request('/api/projects', 'PUT', [])).status, 401);
    assert.equal((await request('/api/session')).status, 200);
    assert.equal((await request('/api/login', 'POST', { password: 'wrong' })).status, 401);
    const login = await request('/api/login', 'POST', { password: 'test-only-owner-password' });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0],
      session = await login.json();
    assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
    const headers = { Cookie: cookie, 'X-CSRF-Token': session.csrf };
    assert.equal((await request('/api/skills', 'PUT', [], { Cookie: cookie })).status, 403);
    assert.equal(
      (await request('/api/skills', 'PUT', [], { ...headers, Origin: 'https://other.example' }))
        .status,
      403
    );
    const skills = [{ id: 'tools', title: 'Tools', items: ['React', 'Figma'] }];
    assert.equal((await request('/api/skills', 'PUT', skills, headers)).status, 200);
    const projects = [
      {
        id: 'project',
        title: 'Portfolio',
        url: 'https://example.com',
        category: 'Web',
        tagline: '',
        thumbnail: '',
      },
    ];
    assert.equal((await request('/api/projects', 'PUT', projects, headers)).status, 200);
    const data = await (await request('/api/content')).json();
    assert.deepEqual(data.skills, skills);
    assert.deepEqual(data.projects, projects);
    assert.deepEqual(
      JSON.parse(await readFile(path.join(root, '.private/content.json'), 'utf8')),
      data
    );
    assert.equal((await request('/api/logout', 'POST', {}, headers)).status, 200);
    assert.equal((await request('/api/projects', 'PUT', [], headers)).status, 401);
    for (let i = 0; i < 5; i++) await request('/api/login', 'POST', { password: 'wrong' });
    assert.equal(
      (await request('/api/login', 'POST', { password: 'test-only-owner-password' })).status,
      429
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (!path.resolve(root).startsWith(path.join(path.resolve(tmpdir()), 'jeff-owner-test-')))
      throw new Error('Unexpected temporary path');
    await rm(root, { recursive: true, force: true });
  }
});
