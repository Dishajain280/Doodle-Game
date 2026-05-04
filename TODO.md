# Multiplayer Drawing Game TODO

## Overall Plan

1. Install dependencies (Tailwind, React Router, Socket.io-client) [Pending install]
2. Setup Tailwind CSS configs
3. Refactor App with routing
4. Create core components (Canvas, Chat, PlayerList, Leaderboard)
5. GameContext, useSocket hook for multiplayer
6. Lobby & game pages
7. Backend Socket.io server
8. Testing & polish

## Progress

- [x] Created TODO.md
- [x] Step 1: Dependencies install (executing npm install)
- [x] Dependencies (Fixed package.json scripts and PostCSS packages)
- [x] Tailwind setup (Vite plugin + PostCSS bridge)
- [x] DrawingCanvas.jsx created & integrated
- [x] Guessing logic in ChatBox
- [x] Basic game state management (Round switching)
- [x] Timer functionality added
- [x] App.jsx populated with GameLayout
- [x] Fixed linting errors
- [x] Website is functional as single-player game
- [ ] Socket.io multiplayer backend
- [ ] Socket.io backend
- [ ] Run `cd doodle && npm run dev` to test canvas
