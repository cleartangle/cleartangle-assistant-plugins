# ClearTangle assistant plugins

Packages that list ClearTangle in Claude's and ChatGPT's directories, so
people connect with one click instead of pasting an MCP URL and client ID.

Both packages point at the same server, `https://app.cleartangle.com/mcp`,
which lives in the Second-Brain repo (`server/mcp/`). This repo holds only
listing material: manifests, the shared skill, icons and the review answers.

```
claude/                Claude plugin (Claude Code, Cowork, claude.ai)
  .claude-plugin/        plugin.json and icon.png
  .mcp.json              remote server + public Claude OAuth client, port 33418
  skills/cleartangle/    the shared skill (copied from shared/)
chatgpt/               ChatGPT plugin package (zipped for upload)
  plugin.json            listing fields under extensions["com.openai"].interface
  mcp.json               remote server + public ChatGPT OAuth client
  skills/cleartangle/    the shared skill (copied from shared/)
  assets/                logo.png (512) and composer-icon.png (128)
shared/SKILL.md        the one skill both packages ship; edit this copy
.claude-plugin/        marketplace.json, so Claude Code can install from this repo
scripts/build.mjs      syncs the skill, checks store limits, zips the ChatGPT package
submission/            go-live checklist and every portal answer
```

## Build and check

```bash
node scripts/build.mjs            # sync skill, check, write dist/*.zip
node scripts/build.mjs --check    # check only
claude plugin validate ./claude --profile directory
```

## Going live

Start with [submission/CHECKLIST.md](submission/CHECKLIST.md). It lists the
production OAuth steps, the website pages both stores need, and the order to
submit in.

## Try the Claude plugin locally

```bash
claude plugin marketplace add ./
claude plugin install cleartangle@cleartangle
```

Claude Code opens ClearTangle's sign-in page. Sign-in finishes on
`http://localhost:33418/callback`, which must be registered on the Claude
client first (checklist step 3a).
