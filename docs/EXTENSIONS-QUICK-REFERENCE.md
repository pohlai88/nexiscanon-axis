# Quick Reference - Installed Extensions

## ✅ Successfully Installed (6/8)

| Extension | Purpose | Key Shortcut |
|-----------|---------|--------------|
| **Console Ninja** | Shows console.log inline | Auto (no shortcut needed) |
| **Thunder Client** | REST API client | Sidebar icon |
| **TS Error Translator** | Human-readable TS errors | Hover on error |
| **Inline Fold** | Collapse long classNames | Auto (click `...` to expand) |
| **REST Client** | Execute `.http` files | `Ctrl+Alt+R` (Send Request) |
| **Turbo Console Log** | Quick console.log | `Ctrl+Alt+L` (Insert) |

## ❌ Not Available (2/8)

| Extension | Status | Workaround |
|-----------|--------|------------|
| Drizzle ORM | Not in marketplace | Use TypeScript IntelliSense |
| Version Lens | Not in marketplace | Run `pnpm outdated` |

## 🚀 Quick Start

### Test Your API (2 ways)

**Option 1: Thunder Client**
1. Click Thunder Client icon (left sidebar)
2. New Request → GET → `http://localhost:3000/api/health`
3. Send

**Option 2: REST Client**
1. Open `.vscode/api-testing.http`
2. Click "Send Request" above any endpoint
3. View response

### Debug with Console Ninja
```tsx
// Just add console.log - see output inline instantly!
console.log('User:', user);
console.log('Data:', data);
```

### Quick Console.log with Turbo
1. Select variable name
2. Press `Ctrl+Alt+L`
3. Auto-inserts: `console.log('varName:', varName)`

## 📁 Files Created

- `.vscode/extensions.json` - Recommended extensions
- `.vscode/settings.json` - Extension configurations
- `.vscode/api-testing.http` - API test suite
- `.vscode/EXTENSIONS-GUIDE.md` - Full documentation
- `.vscode/QUICK-REFERENCE.md` - This file

## 🔧 Configuration Applied

```json
// Console Ninja
"console-ninja.featureSet": "Community"

// Inline Fold (for Tailwind)
"inlineFold.regex": "(class|className)=\"([^\"]*)"

// REST Client
"rest-client.environmentVariables": {
  "baseUrl": "http://localhost:3000"
}

// Turbo Console Log
"turboConsoleLog.insertEnclosingFunction": true
```

## ⚡ Power User Tips

1. **Clean Logs Fast**: `Alt+Shift+D` removes all console.logs
2. **Fold All Classes**: Long Tailwind classNames auto-collapse
3. **Test APIs**: Keep `api-testing.http` updated with new routes
4. **TS Errors**: Click "Translate Error" for plain English
5. **Thunder Collections**: Group related API tests together

## 🎯 Next Steps

1. Start dev server: `pnpm dev:web`
2. Open any file with `console.log`
3. See Console Ninja magic! ✨
4. Test API with Thunder Client or REST Client
5. Write code with better error messages

---

**Need help?** Check `.vscode/EXTENSIONS-GUIDE.md` for detailed docs.
