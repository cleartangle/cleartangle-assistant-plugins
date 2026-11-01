#!/usr/bin/env node
// Syncs the shared skill into both packages, checks both against the store
// limits we know about, and zips the ChatGPT package into dist/.
// Usage: node scripts/build.mjs [--check]   (--check: validate only, no zip)
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const problems = [];
const fail = (message) => problems.push(message);
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MCP_URL = 'https://app.cleartangle.com/mcp';

// 1. One skill, two packages.
const skill = join(root, 'shared/SKILL.md');
for (const target of ['claude/skills/cleartangle/SKILL.md', 'chatgpt/skills/cleartangle/SKILL.md']) {
  if (checkOnly) {
    if (readFileSync(join(root, target), 'utf8') !== readFileSync(skill, 'utf8')) {
      fail(`${target} differs from shared/SKILL.md; run node scripts/build.mjs`);
    }
  } else {
    copyFileSync(skill, join(root, target));
  }
}
const front = readFileSync(skill, 'utf8').match(/^---\n([\s\S]*?)\n---/);
if (!front || !/^name: cleartangle$/m.test(front[1]) || !/^description: .{40,}$/m.test(front[1])) {
  fail('shared/SKILL.md needs front matter with name: cleartangle and a description');
}

// 2. Claude plugin.
const claudePlugin = readJson('claude/.claude-plugin/plugin.json');
if (claudePlugin.name !== 'cleartangle') fail('claude plugin name must be cleartangle');
if (!claudePlugin.privacyPolicyUrl?.startsWith('https://')) fail('claude plugin needs privacyPolicyUrl');
const claudeMcp = readJson('claude/.mcp.json').mcpServers?.cleartangle;
if (claudeMcp?.type !== 'http' || claudeMcp?.url !== MCP_URL) fail(`claude/.mcp.json must point at ${MCP_URL}`);
if (!UUID.test(claudeMcp?.oauth?.clientId || '')) fail('claude/.mcp.json needs the public Claude OAuth client id');
if (!Number.isInteger(claudeMcp?.oauth?.callbackPort)) fail('claude/.mcp.json needs a fixed callbackPort');
const wordCount = readFileSync(join(root, 'claude/README.md'), 'utf8')
  .replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
if (wordCount < 40) fail('claude/README.md needs at least 40 words outside code blocks');
if (!existsSync(join(root, 'claude/LICENSE'))) fail('claude/LICENSE is missing');

// 3. ChatGPT plugin (limits from developers.openai.com/apps-sdk/deploy/submission).
const gptPlugin = readJson('chatgpt/plugin.json');
const ui = gptPlugin.extensions?.['com.openai']?.interface || {};
const limit = (field, max) => {
  const value = ui[field];
  if (typeof value !== 'string' || !value.trim()) fail(`chatgpt interface.${field} is required`);
  else if (value.length > max) fail(`chatgpt interface.${field} is ${value.length} chars (max ${max})`);
};
limit('displayName', 30);
limit('shortDescription', 30);
limit('longDescription', 4000);
limit('developerName', 80);
for (const field of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
  if (!String(ui[field] || '').startsWith('https://')) fail(`chatgpt interface.${field} must be an https URL`);
}
const prompts = ui.defaultPrompt || [];
if (prompts.length > 3) fail('chatgpt defaultPrompt allows at most 3 prompts');
if (new Set(prompts).size !== prompts.length) fail('chatgpt defaultPrompt entries must be unique');
for (const prompt of prompts) {
  if (prompt.length > 128) fail(`chatgpt defaultPrompt over 128 chars: ${prompt}`);
  if (prompt.includes('@')) fail(`chatgpt defaultPrompt must not @mention apps: ${prompt}`);
}
if (/\b(MCP|Plugin)\b/.test(ui.displayName || '')) fail('chatgpt displayName must not append MCP or Plugin');
for (const field of ['logo', 'composerIcon']) {
  const path = join(root, 'chatgpt', String(ui[field] || ''));
  if (!ui[field]?.startsWith('./') || !existsSync(path)) fail(`chatgpt interface.${field} file is missing`);
  else if (statSync(path).size > 5 * 1024 * 1024) fail(`chatgpt ${field} is over 5 MiB`);
  else {
    const size = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], { encoding: 'utf8' });
    const [w, h] = [...size.matchAll(/pixel(?:Width|Height): (\d+)/g)].map((m) => Number(m[1]));
    if (w !== h || w < 48) fail(`chatgpt ${field} must be square and at least 48 px (got ${w}x${h})`);
  }
}
const gptServers = Object.values(readJson('chatgpt/mcp.json').mcpServers || {});
if (gptServers.length !== 1) fail('chatgpt/mcp.json must declare exactly one MCP server');
const gptServer = gptServers[0] || {};
if (gptServer.url !== MCP_URL) fail(`chatgpt/mcp.json must point at ${MCP_URL}`);
const auth = gptServer.extensions?.['com.openai']?.auth || {};
if (auth.type !== 'oauth' || auth.client?.mode !== 'provided') fail('chatgpt auth must be oauth with a provided client');
if (!UUID.test(auth.client?.clientId || '')) fail('chatgpt auth needs the public ChatGPT OAuth client id');
if (auth.client?.clientId === claudeMcp?.oauth?.clientId) fail('ChatGPT and Claude must use different client ids');
if (JSON.stringify(readJson('chatgpt/mcp.json')).match(/secret|headers/i)) fail('chatgpt/mcp.json must not carry secrets or headers');

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('✓ Both packages pass the local checks');

if (!checkOnly) {
  const dist = join(root, 'dist');
  mkdirSync(dist, { recursive: true });
  const zip = join(dist, `cleartangle-chatgpt-plugin-${gptPlugin.version}.zip`);
  rmSync(zip, { force: true });
  execFileSync('zip', ['-X', '-r', zip, 'plugin.json', 'mcp.json', 'skills', 'assets', '-x', '*.DS_Store'], {
    cwd: join(root, 'chatgpt'),
    stdio: 'inherit',
  });
  console.log(`✓ ${zip}`);
}
