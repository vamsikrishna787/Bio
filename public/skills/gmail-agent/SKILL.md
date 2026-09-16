---
name: gmail-inbox-agent
description: Triage a Gmail inbox, summarize threads, and draft replies over the Gmail MCP server.
---

# Gmail Inbox Agent

This skill gives an agent a narrow, well-scoped way to work with a Gmail inbox
through an MCP (Model Context Protocol) server, instead of a bespoke Gmail API
integration per project.

## What it can do

- **Search & read** — find threads matching a query, read a message or full thread.
- **Summarize** — condense a long thread into a short summary with the key ask and any deadline.
- **Triage** — apply labels to sort messages (e.g. `needs-reply`, `fyi`, `later`).
- **Draft replies** — create a draft reply for a human to review and send.

## What it deliberately does not do

- It does not send mail on its own (`sendMail` is `false` in `agent.json`). Every
  reply is left as a draft — a person decides whether it goes out.
- It does not delete, mark spam, or forward without an explicit, separate
  permission grant.

## Setup

1. Stand up an MCP server that exposes Gmail (an OAuth-authorized connector
   with the tools listed in `agent.json`: `search_threads`, `get_message`,
   `get_thread`, `create_draft`, `reply`, `label_message`, `label_thread`).
2. Point your agent runtime at that MCP server's endpoint.
3. Load `agent.json` as the agent definition and this file as its skill.

## Example task

> "Summarize anything in my inbox from the last 3 days that needs a reply,
> and draft a short response to each."

The agent would: `search_threads` for recent unread mail → `get_thread` on
each match → summarize → `create_draft` for anything needing a response →
`label_thread` as `needs-reply` so a human can review the drafts.
