# Brief: exemplary human-authored enrichment questions for «الهندسة للأطفال»

You are a mathematics-education researcher and item writer for an Arabic geometry curriculum app for children (stage 1 ages 6–7, stage 2 ages 8–9, stage 3 ages 10–11, stage 4 ages 12–14). The owner wants **exemplary questions written by reputable educational bodies or distinguished teachers** — human-authored tasks that deepen and consolidate understanding and make children think — adapted into Arabic **with model solutions**, added to the question bank so that **every concept** is covered by such items.

## Inputs (read-only)
- `/home/claude/enrich/bank.json`: the current bank. Format: concept id → list of items {id, kind ('تعرّف' or 'فهم'), type ('choice' or 'num'), q, correct + wrongs (choice) or ans + tol (num), hint, steps, svg?}. Read the existing items of your concepts so that you do NOT duplicate them (in idea, not just in wording).
- `/home/claude/enrich/meta.json`: `names` (concept id → Arabic concept name), `uc` (unit → concept ids), `titles` (unit titles), `why` (concept rationale).
- The charter with approved decisions (definitions, notation, what is deferred to later stages): `/home/claude/out/حزمة_المرجع_الجديدة/02_الميثاق_والقرارات/00_CHARTER_ميثاق_المنهاج_المرجعي.md`. Unit specs: `/home/claude/out/حزمة_المرجع_الجديدة/03_المناهج_والوحدات/`. Read the decisions relevant to your concepts. Key ones:
  - S1: the rectangle is exclusive (D29); no rulers; no numbers beyond 10; no "ضلع" before S1-U1 lesson 2.
  - S2: the trapezoid and the kite are exclusive (D22); no decimals (D25, D51); no coordinates/ordered pairs (S3); the isosceles question is pending, so avoid it.
  - S3: the definitions become inclusive (D63); first quadrant only, no negative numbers (D83, D89); π = 3.14 (D95); formulas in words (D70).
  - S4: x/y, sin/cos/tan allowed (D145, D157); AA is accepted as a principle (D185).

## Sources: search the web (WebSearch / WebFetch) and use real, citable tasks
Prefer, in roughly this order:
- **TIMSS released items** (grade 4 and grade 8 geometry and measurement, IEA/TIMSS & PIRLS International Study Center), with their scoring guides.
- **NAEP released questions** (NCES Questions Tool, grades 4 and 8 geometry).
- **NRICH** (University of Cambridge).
- **Illustrative Mathematics** tasks (K–8).
- **Math Kangaroo / Kangourou sans frontières** past problems.
- **UKMT Junior Mathematical Challenge**.
- **Open Middle**.
- **"Which One Doesn't Belong?"** (wodb.ca).
- **Mathematics Assessment Project / Shell Centre** (MARS).
- **NCTM** (Illuminations, Teaching Children Mathematics).
- **Singapore primary textbooks** (well-known problem types).
- **Arabic sources**: national math Olympiads, Egyptian ministry exemplar questions, the Saudi or UAE national assessments.

Record for each item the precise source (organization, task name or item ID, year, URL).

## Rules
1. **Adapt, do not copy.** Write the Arabic item in your own words, keeping the mathematical idea; never paste the original text. Put the attribution in a `source` field, e.g. `'TIMSS 2011 G4 M051075 (فكرة مقتبسة)'` or `'NRICH: Shapes on the Grid (فكرة مقتبسة)'`.
2. **Quality bar:** each item must make the child think: reasoning, a common misconception, an explanation, a comparison, a "which one doesn't belong" with a justification, a "find the mistake", an "always / sometimes / never", or a small investigation. Pure drill does NOT qualify.
3. **Stage-appropriate:**
   - vocabulary, number size and reading load fit the stage;
   - nothing deferred to a later stage;
   - stage 1 sentences short and concrete.
4. **Mathematically airtight:**
   - exactly one correct option, with distractors that are plausible misconceptions (ideally 3 options);
   - the correct option must not be guessable by being the longest;
   - avoid absolute words that give the answer away;
   - recompute every number.
   - If the item needs a figure, either describe it fully in words or supply an `svg` string whose coordinates you have verified numerically (angles, lengths, parallelism). Prefer text-only items when possible.
5. **Model solution:** `steps` is a list of 2–4 short Arabic sentences that explain WHY, not just the answer; `hint` is a guiding question that does not give the answer away.
6. **Arabic:** correct grammar, hamza and agreement. Use gender-neutral phrasing where possible (e.g. «هيّا نعدّ» rather than «عُدَّ»); if a gendered verb addressing the child is unavoidable, write it masculine and put the feminine alternative in a field `qf`.
7. **Volume:** at least **2 new items per concept** in your slice, and 3 for concepts that currently have the fewest «فهم» items. All new items get `kind='فهم'`, and `level` is one of '🟢', '🟡', '🟠'.

## Output
Write a Python file `/home/claude/enrich/add_<SLICE>.py` in exactly this format (it is executed by our pipeline):
```python
C = []
def fix(cid, match, op, data=None, ref='', why=''):
    C.append(dict(cid=cid, match=match, op=op, data=data or {}, ref=ref, why=why))
fix('C134', None, 'add', dict(kind='فهم', type='choice', level='🟡',
    q='...', correct='...', wrongs=['...', '...'], hint='...', steps=['...', '...'],
    source='TIMSS 2015 G4 M061084 (فكرة مقتبسة)'), 'إثراء', 'سبب اختيار البند في سطر')
fix('C201', None, 'add', dict(kind='فهم', type='num', level='🟠', q='...', ans=12, tol=0, hint='...', steps=['...','...'], source='...'), 'إثراء', '...')
```

Also write `/home/claude/enrich/sources_<SLICE>.md`, a table with one row per item: concept | adapted question (Arabic) | source with URL | why it deepens understanding.

## Before finishing
Self-check every item:
- recompute the answer;
- confirm exactly one option is correct;
- check against stage rules;
- check that it does not duplicate existing bank items.

Run `python3 -I -c "exec(open('/home/claude/enrich/add_<SLICE>.py').read()); print(len(C))"` to make sure the file parses.

**Final message:** the number of items per concept and the list of sources used.

Do not modify any other file.
