# ClearTangle for Claude

ClearTangle is a second brain: you capture notes, ideas, tasks and reminders,
and it keeps them organised, searchable and ready for your day. This plugin
connects Claude to your own ClearTangle account so you can save things and find
them again without leaving the conversation.

## What it does

- **Save**: "Save this idea to ClearTangle", "Add a task to call Priya on
  Friday", "Remind me at 5pm to send the invoice".
- **Find**: "What did I note about the pricing call?", "Show my open tasks for
  the Karbon project".
- **Plan**: "What's on my plate today?", "Am I free at 3pm tomorrow?".

## What's inside

- A remote MCP connection to `https://app.cleartangle.com/mcp`, ClearTangle's
  own server. You sign in with your ClearTangle account and approve access on a
  ClearTangle consent screen. Claude Code completes sign-in through a local
  callback on port 33418.
- One skill, `cleartangle`, that tells Claude when and how to use the
  ClearTangle tools.

The plugin runs no local code and sends nothing anywhere except to ClearTangle's
server, and only when Claude calls a ClearTangle tool. Tools only ever read or
change the signed-in user's data. Changes ask you to confirm first, delete tools
are not offered, and Gmail stays off until you turn it on for this assistant in
ClearTangle.

## Requirements

A ClearTangle account (sign up at https://cleartangle.com).

## Install

In Claude Code:

```
/plugin install cleartangle --marketplace mahipaljyani/cleartangle-assistant-plugins
```

## Disconnect

In ClearTangle, open Settings → Integrations → AI assistants and choose
Disconnect. In Claude Code you can also run `/mcp` and log out of
`cleartangle`.

## Privacy and support

- Privacy policy: [cleartangle.com/privacy](https://cleartangle.com/privacy)
- Terms: [cleartangle.com/terms](https://cleartangle.com/terms)
- Documentation: [cleartangle.com/docs/integrations/mcp](https://cleartangle.com/docs/integrations/mcp)
- Support: [cleartangle.com/docs/support](https://cleartangle.com/docs/support) or support@cleartangle.com
