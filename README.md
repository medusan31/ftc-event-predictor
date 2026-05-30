# FTC Event Predictor

A web app that predicts FIRST Tech Challenge match outcomes using OPR (Offensive Power Rating) data from [FTCScout](https://ftcscout.org).

**Live at: https://medusan31.github.io/ftc-event-predictor/**

> ⚠️ **Predicted rankings are not accurate representations of real FTC rankings.** Real FTC rankings are determined by Ranking Points (RP), which reward autonomous performance, endgame bonuses, and other game-specific criteria. This app predicts rankings using a W/L/T system, with AOPR used to break ties between teams with the same record. Match-level win predictions (who beats who) are significantly more reliable than the predicted rank order.

# Why?
As an FTC sweat FTCScout and its data has always been interesting and helpful to me, and I never thought much past it, but when I started hyper following FRC I learned about all the programs they have like statbotics, which heavily inspired this project, and thought to myself, "Why doesn't something that predicts events based on Strength of Schedule exist for FTC?" I brainstormed a bit and settled on an algorithm that averages a team's peak end of event opr from earlier in the season and their OPR from the event being predicted/simulated to create their AOPR (average opr) and for each match added up the average opr of the two bots on each alliance and weighed them against the other. Issue is, I suck at coding, sooooo I made Claude do everything for me. That's pretty much it.

## Features

- **Live event search** — search by event name or code (e.g. `FTCCMP1LOVE`)
- **Live team search** — toggle to team mode and search by team name or number with live autocomplete
- **Season selector** — 2021-2022 through 2025-2026
- **OPR-based match predictions** — uses each team's season-best OPR from events played *before* the one being simulated averaged with the OPR from the event being simulated, but *does not* use match scores from the simulated event, so retroactive simulations are fair
- **OPR mode toggle** — switch between w/ Pen (includes opponent penalty bonuses) and No Pen (pure scoring, matches FTCScout) — affects all predictions instantly
- **Alliance score prediction** — combined OPR of red vs blue alliance shown for every qual match
- **Win probability** — sigmoid-based confidence % per match
- **Prediction accuracy badge** — shows % of correct predictions for completed events
- **Predicted vs Actual toggle** — compare OPR-predicted rankings/results against the real outcomes
- **Actual rankings** — pulled directly from FTCScout's official qual standings (rank, W/L/T, RP)
- **Team drill-down** — click any team number to see their season page with Season Best OPR, FTCScout link, and full event list
- **CSV export** — export match predictions and rankings as .csv files (Excel-compatible)
- **Surrogate-aware** — surrogate match appearances don't count toward a team's predicted ranking
- **Neon UI** — dark theme with cyan/pink/blue glow effects and 5 color theme options. No light mode though because just no.

## Future Updates
- A separate scouting program in this same project for accessibility
- Graphs because <img width="1000" height="500" alt="image" src="https://github.com/user-attachments/assets/78d5e1b2-c8fe-4edf-8f0d-b642025603a7" />

---

## How predictions work

1. Search for an event by name or code and pick a season
2. The app fetches match schedules and team stats from the FTCScout GraphQL API
3. For each team, a **blended OPR** is calculated:
   - If the team has attended prior events this season → average their **peak single-event OPR** from those events with their **OPR at the event being predicted**
   - If it's their first event this season → use their OPR at the event being predicted as the fallback
   - "Peak prior OPR" = the highest OPR they achieved at any single completed event before this one (e.g. if they got 150, 200, 180 at three prior events, peak = 200)
   - This blending balances historical peak performance with current-event form
4. For each qual match, red and blue alliance OPRs are summed → higher sum = predicted winner
5. Win probability is calculated using a sigmoid function based on the OPR gap
6. Surrogate match results are excluded from that team's ranking prediction (but still shown in the match)
7. For completed events, toggle between **Predicted** and **Actual** views to see how accurate the model was

> **Note on ranking predictions:** Predicted rankings are based purely on win/loss record derived from OPR comparisons. FTC's actual ranking system uses Ranking Points (RP) which reward autonomous performance, endgame bonuses, and other game-specific criteria that OPR does not capture. Match-level win predictions are generally more reliable than the final predicted rank order.

---

## Data

All data is fetched live from the [FTCScout public GraphQL API](https://api.ftcscout.org/graphql). No API key or account required.

## Tech stack

- React 17 + TypeScript
- FTCScout GraphQL API (via native `fetch`)
- Pure CSS neon theme (no UI library)

---

## About

FTC Event Predictor is a web app for predicting match outcomes and team rankings at FIRST Tech Challenge events. It pulls live data directly from the FTCScout API and uses an OPR-based prediction engine — with the equation written by me — that blends a team's current event performance with their season-best prior OPR to produce more accurate match predictions. The app supports toggling between penalty-inclusive and no-penalty OPR modes, team drill-down pages, CSV exports, and a live team/event search.

Coded by Claude.
