# 🔒 Secure File Vault

A single-page web app that gates a file download behind a **password** + **random puzzle**.  
Zero dependencies. Deploys to Netlify in seconds.

## Live Flow

```
[Password] → [Random Puzzle] → [Download Button]
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire app (HTML + CSS + JS) |
| `secret.txt` | The file users download after passing both checks |
| `netlify.toml` | Netlify build & redirect config |

## Quick Start

```bash
# Clone & deploy
git init
git add .
git commit -m "init"
# Push to GitHub, then connect repo in Netlify dashboard
```

Or drag-and-drop the folder into [netlify.com/drop](https://app.netlify.com/drop).

## Configuration

### Change the password
In `index.html`, find:
```js
const CORRECT_PASSWORD = 'secret123';
```

### Add / edit puzzles
Find `PUZZLE_BANK` in `index.html`. Each entry looks like:
```js
{ type: 'Math Problem', question: 'What is 7 + 3?', answer: '10' },
```
Four types are supported: `Math Problem`, `Word Scramble`, `Number Sequence`, `Riddle`.

### Replace the secret file
Swap `secret.txt` with any file. Update the `<a href="...">` in `index.html` to match.

## Moving to Production (Backend Security)

The app includes **3 clearly marked `BACKEND HOOK` comments** in `index.html` where you should add server-side verification:

1. **Password check** → POST to a Netlify Function / serverless endpoint
2. **Puzzle answer check** → validate server-side to prevent client inspection
3. **File delivery** → return a time-limited signed URL (e.g. AWS S3 presigned URL)

Example Netlify Function structure:
```
netlify/
  functions/
    verify-password.js
    verify-puzzle.js
    get-download-url.js
```

## Security Notes (Current State)

- ⚠️ Password is in client-side JS — visible to anyone who opens DevTools
- ⚠️ Puzzle answers are in client-side JS — same caveat
- ⚠️ `secret.txt` URL is guessable if the user inspects the source
- ✅ Fine for low-stakes use cases (gated blog content, fun challenges)
- ✅ All `BACKEND HOOK` comments show exactly where to harden this
