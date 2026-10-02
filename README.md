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

## Groups, knockouts & live scores

- `groups.html`: public page with two tabs, group standings/fixtures and the knockout bracket. Link straight to a tab with `groups.html#knockout`.
- `admin.html`: score entry for the people running the games (not linked from the site, `noindex`). Login is with an admin code.
- `tournament.js`: shared data (groups, fixtures) and logic (standings, seeding, bracket), used by both pages.
- `apps-script/scores.gs`: the backend. GitHub Pages can't store anything, so scores live in a Google Sheet behind an Apps Script web app. Setup steps are at the top of that file; its `/exec` URL goes in `SCORES_URL` in `tournament.js`.

Admin codes live in the Apps Script's Script Properties (`ADMIN_CODES`, e.g. `Giorgos:kalathi-4821, Maria:triplo-9034`), never in this repo. Changing them takes effect immediately. The Scores tab records who entered each result, and can be edited by hand if the admin page is ever unavailable.

The public page polls for new scores every 45 seconds. Standings, the best-thirds race and the bracket fill in automatically. Ranking is wins, then point difference, then points scored. Once every group game has a score, the 8 qualifiers are seeded (winners, runners-up, best two thirds) and paired 1v8, 4v5, 2v7, 3v6. Opponents are swapped only when that's needed to keep two teams from the same group apart in the quarter-finals. A knockout score is stored as [first team, second team] of that tie, so correct any group result before entering quarter-final scores.
