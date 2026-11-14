# updates/

CSV files here are applied to the live shelf on the next Vercel production
build, then remembered so they never apply twice (see
`scripts/apply-updates.mjs`). One field per row:

```
id,field,value
anime-fullmetal-alchemist-brotherhood,status,done
anime-fullmetal-alchemist-brotherhood,myScore,9
```

Ids are in `src/data` or the `snapshot` branch. Editable fields: status, tier,
shelf, hrs, progress, total, at, myScore, finished, order, mine, started.
`null` clears an override. Old files can stay; they are skipped.
