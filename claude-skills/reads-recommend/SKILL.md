---
name: reads-recommend
description: Pick what to read, watch and play today from the live Ramyan Reads shelf (ramyan-reads.vercel.app). Use when the user types /reads-recommend or asks what to read, watch or play next.
---

# Today's picks from Ramyan Reads

The shelf lives at ramyan-reads.vercel.app. Its repo is
`C:\Users\Ramyan Chelva\workspace\reading-list`.

## 1. Read the live state

```
node "C:/Users/Ramyan Chelva/workspace/reading-list/scripts/shelf.mjs" state
```

It prints JSON with:
- `active`: everything in progress, with `progress`/`total`, `at` (where he is in free text), `started`
- `upNext`: up to 3 items per category. Items marked `suggested` are filled in from the backlog and are not queued
- `plan`: this month's and next month's plan lines. Book lines have `go` (GO train days) and `words`, and each line's item statuses are shown
- `deadline`: the Doomsday (Dec 18) Hickman comics push, with `daysLeft`
- `synced`: if false, sync isn't set up, so the data is the baseline only and recent app edits are missing. Mention this in one short line

If the command fails because there's no network, say so. Don't guess his queue.

## 2. Mood check, only when it matters

If something is clearly due (a plan line for this week, a "finish by" note, the
deadline pressure), skip the question and recommend. Otherwise ask one quick question:

> Light, heavy, or just whatever's next?

## 3. Give three picks

**📚 Read**: *Title*. One sentence on why it's the pick today.
**📺 Watch**: *Title, episode*. One sentence on where to pick up and why now.
**🎮 Play**: *Game*. One sentence on what kind of session it suits.

Rules:
- Only pick from his own active, up next or plan items. Pull from the backlog only when a category has nothing else.
- Commute (GO train) reading means the current book or manga. Don't suggest starting something new mid-commute.
- Point out deadlines and "finish by" notes, e.g. the FMA:B end-of-October target and the Hickman comics before Dec 18. Use the numbers to show the pace, e.g. "32 of 64 eps left, about 11 a week".
- If he just finished something, pick the next thing in the plan or queue.
- If no game is active or queued, say so in one line rather than inventing one.
- Adjust to whatever he says ("30 minutes", "something light").
- One sentence per pick. No sub-bullets.
