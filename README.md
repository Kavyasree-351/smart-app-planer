# NEXUS — Full Stack Setup Guide

## Your Project Folder Structure
```
nexus-backend/
│
├── server.js        ← Node.js backend (API + DB)
├── nexus.html       ← Your frontend (open in browser)
├── package.json     ← Dependencies list
├── .env             ← Your secret keys (EDIT THIS!)
└── .gitignore       ← Keeps secrets out of Git
```

---

## STEP 1 — Open this folder in VS Code
Right-click the `nexus-backend` folder → "Open with Code"
Or drag the folder into VS Code.

---

## STEP 2 — Open the VS Code Terminal
Press:  **Ctrl + `**  (backtick)  or  **Ctrl + Shift + `**

---

## STEP 3 — Install all dependencies
Copy-paste this command into the terminal and press Enter:

```bash
npm install
```
Wait for it to finish. You'll see a `node_modules/` folder appear. ✅

---

## STEP 4 — Edit your .env file with your real keys
Open `.env` in VS Code and replace the placeholder values:

```env
PORT=3000
GROK_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/nexus_db?retryWrites=true&w=majority
```

> **Where to find these?**
> - Grok API key → https://console.x.ai
> - MongoDB URI  → MongoDB Atlas → Your Cluster → Connect → Drivers → copy the connection string

---

## STEP 5 — Start the backend server
In the VS Code terminal, run:

```bash
node server.js
```

You should see:
```
 NEXUS backend running → http://localhost:3000
 Connected to MongoDB Atlas
```

If you see both lines, your backend is working! ✅

---

## STEP 6 — Open the frontend
Simply open `nexus.html` in your browser:
- Right-click `nexus.html` → Open with → your browser, OR
- If you have the **Live Server** VS Code extension → Right-click → "Open with Live Server"

The status dot in the top bar will turn green: **⬤ server online**

---

## Daily Usage
Every time you want to use NEXUS:
1. Open VS Code terminal
2. Run `node server.js`
3. Open `nexus.html` in your browser

---

## Optional: Auto-restart on file changes (for development)
Instead of `node server.js`, run:
```bash
npm run dev
```
This uses `nodemon` which automatically restarts the server when you edit `server.js`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module 'express'` | Run `npm install` again |
| `⬤ server offline` in the app | Make sure `node server.js` is running in terminal |
| `MongoDB Connection Error` | Check your MONGODB_URI in `.env` — ensure password is correct |
| `AI not responding` | Check your GROK_API_KEY in `.env` |
| Port 3000 already in use | Change `PORT=3001` in `.env` and update the Backend URL in app Settings |
