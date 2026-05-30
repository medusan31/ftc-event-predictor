If the setup here is too complicated just do the prerequisites clone the repo then open vscode and give copilot this readme. Ask it to finish all this for you and it should work. If the localhost still wont run properly at the end make sure the dev server is running, and that should be it!

# FTC Event Predictor

A web app that predicts FIRST Tech Challenge match outcomes using OPR (Offensive Power Rating) data from [FTCScout](https://ftcscout.org).

# Why?
As an FTC sweat FTCScout and its data has always been interesting and helpful to me, and I never thought much past it, but when I started hyper following FRC I learned about all the programs they have like statbotics, which heavily inspired this project, and thought to myself, "Why doesn't something that predicts events based on Strength of Schedule exist for FTC?" I brainstormed a bit and settled on an algorithm that averages a team's peak end of event opr from earlier in the season and their OPR from the event being predicted/simulated to create their AOPR (average opr) and for each match added up the average opr of the two bots on each alliance and weighed them against the other. Issue is, I suck at coding, sooooo I made Claude do everything for me. That's pretty much it.


## Features

- **Live event search** — search by event name or code (e.g. `FTCCMP1LOVE`)
- **Season selector** — 2021-2022 through 2025-2026
- **OPR-based match predictions** — uses each team's season-best OPR from events played *before* the one being simulated averaged with the OPR from the event being simulated, but *does not* use match scores from the simulated event, so retroactive simulations are fair
- **Alliance score prediction** — combined OPR of red vs blue alliance shown for every qual match
- **Win probability** — sigmoid-based confidence % per match
- **Prediction accuracy badge** — shows % of correct predictions for completed events
- **Predicted vs Actual toggle** — compare OPR-predicted rankings/results against the real outcomes
- **Actual rankings** — pulled directly from FTCScout's official qual standings (rank, W/L/T, RP)
- **Surrogate-aware** — surrogate match appearances don't count toward a team's predicted ranking
- **Neon UI** — dark theme with cyan/pink/blue glow effects
- **More Color Themes** - No light mode though because just no.

- # Future Updates
- A seperate scouting program in this same project for accesibility
- Graphs because <img width="1000" height="500" alt="image" src="https://github.com/user-attachments/assets/78d5e1b2-c8fe-4edf-8f0d-b642025603a7" />

## Changelog

### V0.9.9 → V1.0.0
- **CSV export** — export match predictions and rankings panels as .csv files (Excel-compatible), including an accuracy column
- **Team drill-down** — click any team number to view their season page with Season Best OPR, FTCScout link, and full event list
- **Team search** — toggle between event and team search in the search bar, with live autocomplete by team name or number
- **OPR mode toggle** — switch between w/ Pen (totalPoints) and No Pen (totalPointsNp) OPR, affecting all predictions instantly
- **Home button** — clicking the app title returns to the home screen from anywhere
- **Season Best OPR fix** — corrected to use no-penalty OPR, now matches FTCScout's displayed value exactly


---

## Quick start (download and run)

### 1. Install prerequisites

- [Node.js](https://nodejs.org/) v16 or later (includes npm)
- [Git](https://git-scm.com/)

### 2. Clone the repo

```bash
git clone https://github.com/medusan31/ftc-event-predictor.git
cd ftc-event-predictor
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the app

**Windows (PowerShell):**
```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"; npx react-scripts start
```

**Mac / Linux:**
```bash
NODE_OPTIONS=--openssl-legacy-provider npm start
```

The app will open automatically at `http://localhost:3000`.

> **Why the extra flag?** This project uses react-scripts 4.x which has a known incompatibility with Node.js 17+. The flag is harmless and only affects the build tooling.

---

## Build for deployment

**Windows (PowerShell):**
```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm run build
```

**Mac / Linux:**
```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

This creates a `build/` folder of static files ready to deploy anywhere.

---

## Deploy for free (shareable public link)

1. Run the build command above
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop the `build/` folder onto the page
4. Get a public URL instantly — no account needed

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
