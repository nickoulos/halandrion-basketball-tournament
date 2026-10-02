# Halandrion Basketball Tournament

Registration site for the Halandrion basketball tournament (3v3 / 1v1).

**Live site:** https://nickoulos.github.io/halandrion-basketball-tournament/

## How it works

- `index.html` (served by GitHub Pages) and `Basketball Registration.dc.html` (source/editor copy) are kept in sync — edit one, then apply the same change to the other before committing.
- `support.js` is the runtime that powers the page's components and bindings.
- The registration wizard submits entries via `fetch()` to a Google Apps Script Web App, which appends each submission as a row in a Google Sheet.

## Updating the site

1. Edit `Basketball Registration.dc.html`, then copy the same changes into `index.html` (or vice versa).
2. Commit and push to `master`:
   ```
   git add index.html "Basketball Registration.dc.html"
   git commit -m "..."
   git push
   ```
3. GitHub Pages rebuilds automatically, usually within a minute.

## Google Sheet integration

Submissions are handled by a Google Apps Script `doPost` function deployed as a Web App, set as `SCRIPT_URL` near the top of the `Component` class in both HTML files.

If registrations stop appearing in the Sheet, check:
- The Apps Script deployment is still set to **Execute as: Me** / **Who has access: Anyone**.
- The deployment hasn't been deleted or replaced with a new URL (editing an existing deployment keeps the same URL; creating a *new* deployment does not).

### Sheet columns

`submittedAt, tournament, email, firstName, lastName, mobile, teamName, jersey, soloNickname, everyoneIs15, accepted, roster`

## Groups & knockouts page

`groups.html` is a standalone page (no `support.js`) with two tabs: group standings/fixtures and the knockout bracket. Link straight to a tab with `groups.html#knockout`.

To enter results, edit the data block at the top of its `<script>`:

- Group game: set `score: [home, away]` on the match in `MATCHES`, e.g. `score: [21, 17]`. Optional `time` and `court` show under the fixture.
- Knockout game: set `score` on the tie in `KNOCKOUT` (`QF1`–`QF4`, `SF1`, `SF2`, `F`).

Standings, the best-thirds race and the bracket fill in automatically. Ranking is wins, then point difference, then points scored. Once every group game has a score, the 8 qualifiers are seeded (winners, runners-up, best two thirds) and paired 1v8, 4v5, 2v7, 3v6. Opponents are swapped only when that's needed to keep two teams from the same group apart in the quarter-finals.
