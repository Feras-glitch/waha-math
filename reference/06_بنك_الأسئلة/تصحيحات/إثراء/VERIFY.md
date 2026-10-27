# Independent verification brief (you did NOT write these items)

You are an independent mathematics and pedagogy verifier. You will review a file of new questions written by another author for an Arabic geometry app for children (stage 1 ages 6–7; stage 2 ages 8–9; stage 3 ages 10–11; stage 4 ages 12–14). Assume nothing is correct until you have checked it yourself.

**Input:** the file `/home/claude/enrich/add_<SLICE>.py`. Load it with `exec` into a list `C`; each element's `data` holds the question. Read the relevant charter decisions in `/home/claude/out/حزمة_المرجع_الجديدة/02_الميثاق_والقرارات/00_CHARTER_ميثاق_المنهاج_المرجعي.md` (definitions, notation, deferrals per stage) and `/home/claude/enrich/BRIEF.md` (the authoring rules). The concept names are in `/home/claude/enrich/meta.json`.

## Check every item
1. **Recompute the answer independently.** Write a small Python computation for any numeric item. For each choice item, confirm the marked option is correct AND that **no** distractor is also correct or defensible under a reasonable reading.
2. **Well-posed:** enough information, no reliance on an absent figure, units consistent, no ambiguity.
3. **Steps and hint:**
   - The steps must be mathematically correct and explain why.
   - The hint must not give the answer away.
4. **Stage rules:** vocabulary or ideas deferred to a later stage per the charter (for example, decimals in stage 2, negative numbers in stage 3, the inclusive definitions before stage 3, the word «ضلع» before S1-U1 lesson 2).
5. **Concept fit:** the question actually exercises the concept id it is filed under.
6. **Arabic:** grammar, agreement and hamza. Note any error, with a corrected text.
7. **Source plausibility:** the cited source exists and plausibly contains a task with this idea. Spot-check about 20% of the sources with WebSearch.

## Output
Write `/home/claude/enrich/verify_<SLICE>.py` containing a Python dict `V`, keyed by the item index in `C`, for **every item**:
`V[i] = {'verdict': 'ok' | 'fix' | 'reject', 'issues': '...Arabic or English...', 'fixed': {field: new value, ...}}`.
- Use `'fix'` when you supply exact corrected field values (q, correct, wrongs, ans, tol, hint, steps) that resolve the problem.
- Use `'reject'` when the item cannot be repaired cheaply (wrong concept, a duplicate idea, unfixable ambiguity).

Run `python3 -I -c "exec(open('/home/claude/enrich/verify_<SLICE>.py').read()); print(len(V))"` to confirm it parses and covers all items.

**Final message:** the counts of ok / fix / reject and the most important problems found.

Do not modify any other file.
