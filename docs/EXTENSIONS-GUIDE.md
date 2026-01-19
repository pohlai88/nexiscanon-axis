# Extensions Guide - NexusCanon AXIS

## Installed Extensions

### 1. Console Ninja ✅
**Purpose:** Shows console.log output directly in your editor

**Features:**
- Real-time console output inline
- Works with Next.js server & client components
- No configuration needed - just run your dev server

**Usage:**
- Start dev server: `pnpm dev:web`
- Add `console.log()` in your code
- See output inline immediately

---

### 2. Thunder Client ✅
**Purpose:** Lightweight REST API client

**Features:**
- Test API endpoints without leaving VS Code
- Collections & environments support
- GraphQL support

**Usage:**
- Click Thunder Client icon in sidebar
- Create new request
- Test your `/api/*` routes

**Alternative:** Use `.vscode/api-testing.http` with REST Client

---

### 3. TypeScript Error Translator ✅
**Purpose:** Makes TypeScript errors human-readable

**Features:**
- Plain English explanations for TS errors
- Works alongside `pretty-ts-errors`
- Click error for detailed explanation

**Usage:**
- Hover over TypeScript errors
- Click "Translate Error" for explanation

---

### 4. Inline Fold ✅
**Purpose:** Collapses long className strings

**Features:**
- Folds Tailwind className to `...`
- Click to expand/collapse
- Configurable opacity

**Usage:**
- Long classNames automatically fold
- Click `...` to expand
- Configured in `.vscode/settings.json`

**Example:**
```tsx
// Before: className="flex items-center justify-between px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
// After: className="..."
```

---

### 5. REST Client ✅
**Purpose:** Execute HTTP requests from `.http` files

**Features:**
- Test APIs directly from files
- Environment variables support
- Response history

**Usage:**
- Open `.vscode/api-testing.http`
- Click "Send Request" above any request
- View response in new tab

**Files:**
- `.vscode/api-testing.http` - API testing suite
- `evi002.http` - Evidence-based testing

---

### 6. Turbo Console Log ✅
**Purpose:** Quick console.log insertion

**Features:**
- Insert meaningful console.logs with shortcuts
- Auto-includes variable names
- Comment/uncomment all logs

**Usage:**
- **Windows/Linux:** `Ctrl + Alt + L` on variable
- **Mac:** `Cmd + Option + L` on variable
- Inserts: `console.log('varName:', varName)`

**Commands:**
- `Alt + Shift + C` - Comment all console.logs
- `Alt + Shift + U` - Uncomment all console.logs
- `Alt + Shift + D` - Delete all console.logs

---

## Extension Not Found

### Drizzle ORM ❌
**Status:** Not available in Cursor marketplace yet

**Workaround:**
- TypeScript IntelliSense works with Drizzle
- Use `@workspace/db` types for autocomplete

---

### Version Lens ❌
**Status:** Not available in Cursor marketplace yet

**Workaround:**
- Manually check `pnpm outdated`
- Use Dependabot (GitHub) for updates

---

## Keyboard Shortcuts Reference

### Console Ninja
- No shortcuts needed - works automatically

### Thunder Client
- `Ctrl/Cmd + Shift + P` → "Thunder Client: New Request"

### Turbo Console Log
- `Ctrl + Alt + L` - Insert console.log
- `Alt + Shift + C` - Comment all logs
- `Alt + Shift + U` - Uncomment all logs
- `Alt + Shift + D` - Delete all logs

### REST Client
- `Ctrl/Cmd + Alt + R` - Send request
- `Ctrl/Cmd + Alt + E` - Select environment

---

## Configuration Files

### `.vscode/settings.json`
- Console Ninja configuration
- Inline Fold regex for className
- Turbo Console Log preferences
- REST Client base URL

### `.vscode/extensions.json`
- Recommended extensions list
- Auto-prompt for installation

### `.vscode/api-testing.http`
- API endpoint testing suite
- Environment variables
- Sample requests for all routes

---

## Tips & Best Practices

### API Testing Workflow
1. Use Thunder Client for ad-hoc testing
2. Use `.http` files for documented/repeatable tests
3. Keep `api-testing.http` updated with new endpoints

### Console Logging
1. Use Turbo Console Log shortcuts for speed
2. Console Ninja shows output inline (no terminal check needed)
3. Clean up logs before committing (use Alt + Shift + D)

### TypeScript Errors
1. Hover for quick error
2. Click "Translate Error" for explanation
3. Use with `pretty-ts-errors` for best experience

### Tailwind CSS
1. Let Inline Fold collapse long classNames
2. Click `...` to edit
3. Improves code readability significantly

---

## Troubleshooting

### Console Ninja not showing output?
- Ensure dev server is running (`pnpm dev:web`)
- Check Output panel → Console Ninja
- Restart VS Code

### REST Client not working?
- Check baseUrl in `.vscode/settings.json`
- Ensure dev server is running on correct port
- Verify `.http` file syntax

### Inline Fold not working?
- Reload VS Code window
- Check regex in `.vscode/settings.json`
- Ensure className is on single line

---

## Need Help?
- Open Command Palette: `Ctrl/Cmd + Shift + P`
- Search for extension name
- Check extension settings
