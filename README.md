# 🔒 The Vault — Secure File Gate

A zero-dependency, multi-file static web app that gates a file download behind a **password** + **random puzzle**. Deploys to Netlify in seconds.

## Flow

```
[Password] → [Random Puzzle (1 of 8 types)] → [Download Button]
```

## File Structure

```
index.html          ← HTML markup & step UI
css/
  style.css         ← All styles (Playfair Display + Courier Prime)
js/
  app.js            ← All logic: config, puzzle bank, step flow
files/
  secret.txt        ← The gated file (replace with your own)
netlify.toml        ← Netlify build & header config
README.md
```

## Deploy to Netlify

```bash
git init && git add . && git commit -m "init"
# Push to GitHub, then connect the repo in app.netlify.com
```

Or drag-and-drop the folder at [app.netlify.com/drop](https://app.netlify.com/drop).

## Configuration

### Change the password
In `js/app.js`:
```js
const CORRECT_PASSWORD = 'ilikecatsbutdogsarebetter...';
```

### Change the download file
1. Replace `files/secret.txt` with your file
2. Update `FILE_PATH` and `FILE_NAME` in `js/app.js`

### Add / edit puzzles
In `js/app.js`, edit `PUZZLE_BANK`. Each entry:
```js
{ type: 'Math Problem', question: 'What is 15 × 3?', answer: '45' },
```

**Supported types** (purely cosmetic labels — add any you like):
`Math Problem` · `Word Scramble` · `Number Sequence` · `Riddle` · `Reverse Word` · `Missing Letter` · `Roman Numerals` · `Color Code`

## Production Hardening

The app has **3 `BACKEND HOOK` comments** — one in `index.html` and two in `js/app.js` — marking where to swap client-side checks for server calls:

| Hook | What to build |
|------|--------------|
| Password | `POST /.netlify/functions/verify-password` — reads password from `process.env` |
| Puzzle answer | `POST /.netlify/functions/verify-puzzle` — stores answers in a signed session |
| File delivery | `GET /.netlify/functions/get-download-url` — returns a time-limited presigned URL |

### Example Netlify Function (password)
```js
// netlify/functions/verify-password.js
exports.handler = async ({ body }) => {
  const { password } = JSON.parse(body);
  const ok = password === process.env.VAULT_PASSWORD;
  return { statusCode: 200, body: JSON.stringify({ ok }) };
};
```
Set `VAULT_PASSWORD` in **Site settings → Environment variables**.

## Security Caveats (current state)
- ⚠️ Password lives in client JS — visible in DevTools
- ⚠️ Puzzle answers live in client JS — same caveat  
- ⚠️ `files/secret.txt` URL is guessable from source
- ✅ Fine for low-stakes gating (fun challenges, unlockable content)
- ✅ All `BACKEND HOOK` comments show exactly where to harden this
