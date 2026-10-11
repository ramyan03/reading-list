---
name: reads-update
description: Quick progress check-in that saves straight to the live Ramyan Reads shelf (ramyan-reads.vercel.app). Use when the user types /reads-update or wants to log pages, episodes, chapters, finishes, ratings or new starts.
---

# Progress check-in for Ramyan Reads

All edits go through `scripts/shelf.mjs` in
`C:\Users\Ramyan Chelva\workspace\reading-list`. It applies the same rules as
the app's own buttons. Below, `S` stands for:

```
node "C:/Users/Ramyan Chelva/workspace/reading-list/scripts/shelf.mjs"
```

## 1. Read the live state

Run `S state`. If `synced` is false, tell him saving won't work until Upstash
and `EDIT_KEY` are set up in Vercel (see the reading-list README, "Setting up
sync on Vercel"). Stop there unless he only wants a recap.

## 2. One consolidated check-in

Ask about every `active` item in a single message, grouped by category. Use the
category's own unit: pages for books, eps for shows and anime, chapters for
manga, issues for comics. Show where he was last time:

**📚 Books**
- *Red Rising*: 90 / 382. What page are you on?

**📺 Shows / Anime**
- ...

**Anything else?** Finished, started, dropped or rated anything?

Leave out empty categories. If he already gave the update in the message that
invoked the skill, skip this step.

## 3. Save

Find ids with `S find <title words>` when they aren't in the state output. Then run
one `set` per item:

```
S set <id> progress=120
S set <id> status=done myScore=8.5
S set <id> status=active
S set <id> at="Ch. 310, Skypiea"
```

- Editable fields: `status tier shelf hrs progress total at myScore finished order mine started`
- `status` is one of `active next backlog paused done dropped`. Setting `done` stamps `finished` with this month, `active` stamps `started`, and `next` puts the item at the back of the queue. That's the same as the app.
- `myScore` is out of 10, with half points allowed.
- `field=null` drops his override and goes back to the data file value. Only do this when he asks to undo something.
- If he's unsure about an id or a change looks destructive (dropping a status, clearing fields), run with `--dry-run` first and confirm with him.
- No em dashes in text fields. `npm run check` rejects them in the data.
- If he mentions something that isn't on the shelf, ask before adding it. The app's Add button handles new items; this script only edits existing ones.

A 401 means the edit key is wrong or missing. The script reads it from
`READS_EDIT_KEY` in the environment, or from `EDIT_KEY` in
`reading-list/.env.local`. Ask him to set one; never print the key.

## 4. Confirm

One line on what changed, e.g. "Red Rising 120/382, Monster done (9.5)". If
something is close to done, name what's next for it from `upNext` or `plan`.

Keep it quick: this is a 30-second check-in.
