---
name: cleartangle
description: Use when the user wants to save a note, idea, task or reminder to ClearTangle (their second brain), find something they saved there, or asks about their ClearTangle tasks, daily plan, reminders or schedule. Uses the ClearTangle connector's tools.
---

# ClearTangle

ClearTangle is the user's own second brain. It holds the notes and thoughts they
captured, their tasks and projects, pages, long-term memories, daily plans and
reminders, plus the Slack, Gmail and Google Calendar accounts they connected to
ClearTangle. Every tool reads or changes only the signed-in user's data.

Use the ClearTangle connector's tools for this. If they are not available, tell
the user to connect ClearTangle first (in Claude: Settings → Connectors; in
ChatGPT: the ClearTangle plugin).

## Save something

- A note, idea or thought: `create_capture` with the user's words. Keep their
  wording; don't rewrite it into your own summary unless they ask.
- A task: `create_task`. Put a due date only when the user gave one. For a
  repeating task, set `repeat`.
- Several tasks at once: `create_many_tasks`.
- A reminder at a set time: `create_reminder` with an absolute ISO time that
  includes the user's UTC offset. Ask for the time zone if you don't know it.
- A lasting fact about the user ("I'm vegetarian", "my manager is Asha"):
  `create_memory`. Don't store one-off events or task status as memories.

After saving, say what was saved and give the link the tool returns.

## Find something

- Broad questions ("what did I note about pricing?"): `hybrid_search` or
  `search`, then `fetch` or the matching `get_*_details` tool for the full item.
- Notes only: `search_captures`. Pages: `search_pages`. Memories:
  `search_memories`.
- Search before saying something isn't saved. If nothing matches, say so and
  offer to save it.
- Quote what the item says and link to it. Don't fill gaps with guesses.

## Tasks and the day

- "What's on my plate?": `get_task_dashboard` (overdue, today, this week).
- Tasks for a project or person: `list_tasks` with `project_name` or `search`.
- Change a task: find its ID with `list_tasks` first, then `update_task` or
  `complete_task`. Never make up an ID.
- Today's plan: `get_latest_plan`; to make a new one, `generate_plan`.
- Free or busy: `find_calendar_availability`; events: `list_calendar_events`.

## Changes and safety

- Tools that create, change or send something ask the user to confirm first.
  Say plainly what will change before you call one.
- Sending a Slack message reaches other people and can't be unsent. Show the
  exact text and recipient first.
- ClearTangle doesn't offer delete tools here. To delete an item, the user does
  it in the ClearTangle app.
- Gmail tools work only when the user turned on Gmail access for this assistant
  in ClearTangle (Settings → Integrations → AI assistants).

## Questions about ClearTangle itself

For questions about the product (apps, plans, settings, what's new), use
`get_clear_tangle_info` rather than searching the user's workspace.
