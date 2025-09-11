# Pathfinder - Quick Start for Teammates

A minimal, step-by-step guide with the exact commands to run and contribute.

## 1) Clone the repo
```bash
git clone https://github.com/HienVo22/PathFinder.git
cd PathFinder
```

## 2) Ensure Node.js + npm are available
- macOS/Linux (recommended: nvm)
```bash
# If nvm is not installed, install it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Load nvm in this terminal session
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
# Install and use the latest LTS Node
nvm install --lts
nvm use --lts
```
- Windows: install Node.js from https://nodejs.org (LTS). Then open a new terminal.

Verify:
```bash
node -v
npm -v
```

## 3) Install dependencies
```bash
npm install
```

## 4) Run the app (dev server)
```bash
npm run dev
```
- Open: http://localhost:3000 (Next.js will use 3001 if 3000 is busy; check terminal output.)

## 5) Demo account (for quick testing)
- Email: demo@pathfinder.com
- Password: password

---

## Contributing (feature-branch workflow)
Always branch from `main` and open a Pull Request when done.

### Start a new feature
```bash
git checkout main
git pull origin main
git checkout -b feature/short-description
```

### Make changes, run locally, then commit
```bash
npm run dev   # keep this running while you develop
# in another terminal
git add -p    # stage only the changes you intend
git commit -m "feat: add short description of your change"
```

### Push and open a PR
```bash
git push -u origin feature/short-description
```
- Open a Pull Request on GitHub targeting `main`.
- After review, choose "Squash and merge".

### Keep your branch up to date
```bash
git fetch origin
git rebase origin/main
# if conflicts occur, resolve them, then
git push --force-with-lease
```

---

## Common issues (quick fixes)

### npm: command not found
```bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use --lts
```

### Port already in use
```bash
PORT=3001 npm run dev
```

### White/blank page while developing
```bash
# Hard refresh the browser
# macOS: Cmd+Shift+R   Windows: Ctrl+Shift+R
```
Also check the terminal output for the exact local URL and any errors.

---

## Project structure (reference)
```text
app/
  api/auth/          # login/register/me API routes
  dashboard/         # user dashboard
  globals.css        # global styles (Tailwind)
  layout.js          # root layout
  page.js            # home page (login/register)
contexts/
  AuthContext.js     # client-side auth context
```

That’s it. If you can run commands 1–4 above, you’re ready to contribute. Happy building! 🚀
