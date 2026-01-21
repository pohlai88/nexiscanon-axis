# Command-K Palette Documentation

## Overview

The Command-K Palette is a keyboard-first command interface that enables power users to quickly navigate, search, and execute actions without leaving their keyboard.

## Features

✅ **Keyboard-First Navigation**
- ⌘K (Mac) / Ctrl+K (Windows) to open
- ↑↓ arrow keys to navigate
- Enter to execute
- ESC to close

✅ **Fuzzy Search**
- Search across labels, descriptions, keywords, and categories
- Smart ranking based on relevance

✅ **Grouped Results**
- Actions organized by category
- Visual hierarchy with headers

✅ **Recent Actions**
- Remembers your last 5 commands
- Quick access without typing

✅ **Keyboard Shortcuts**
- Display shortcuts inline
- Execute with single keypress

✅ **Visual Polish**
- Smooth animations
- Backdrop blur
- Icon support
- Badge indicators

---

## Quick Start

### 1. Basic Usage

```tsx
import { CommandKPalette, useCommandK } from "@workspace/shared-ui/blocks";

function App() {
  const { isOpen, close } = useCommandK(); // Auto-registers ⌘K

  const actions = [
    {
      id: "action-1",
      label: "Create New Document",
      description: "Start a new document",
      category: "File",
      action: () => console.log("New doc"),
    },
  ];

  return (
    <CommandKPalette
      isOpen={isOpen}
      onClose={close}
      actions={actions}
    />
  );
}
```

### 2. With Groups

```tsx
const commandGroups = [
  {
    id: "navigation",
    label: "Navigation",
    actions: [
      {
        id: "nav-home",
        label: "Go to Home",
        icon: <Home className="h-4 w-4" />,
        action: () => navigate("/"),
      },
    ],
  },
  {
    id: "file",
    label: "File Operations",
    actions: [
      {
        id: "file-new",
        label: "New File",
        shortcut: "⌘N",
        action: () => createFile(),
      },
    ],
  },
];

<CommandKPalette
  isOpen={isOpen}
  onClose={close}
  groups={commandGroups}
/>
```

### 3. With Recent Actions

```tsx
const [recentActions, setRecentActions] = React.useState([]);

const handleActionExecute = (action) => {
  setRecentActions((prev) => [action, ...prev].slice(0, 5));
};

<CommandKPalette
  isOpen={isOpen}
  onClose={close}
  actions={actions}
  recentActions={recentActions}
  onActionExecute={handleActionExecute}
  showRecent
/>
```

---

## Props Reference

### CommandKPalette Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | Required | Palette open state |
| `onClose` | `() => void` | Required | Close handler |
| `actions` | `CommandAction[]` | `[]` | Standalone actions |
| `groups` | `CommandGroup[]` | `[]` | Grouped actions |
| `recentActions` | `CommandAction[]` | `[]` | Recent actions list |
| `placeholder` | `string` | "Type a command..." | Input placeholder |
| `emptyMessage` | `string` | "No results found" | Empty state message |
| `showRecent` | `boolean` | `true` | Show recent section |
| `showShortcuts` | `boolean` | `true` | Display shortcuts |
| `maxResults` | `number` | `50` | Max search results |
| `onActionExecute` | `(action) => void` | - | Action execute callback |

### CommandAction Interface

```typescript
interface CommandAction {
  id: string;                    // Unique ID
  label: string;                 // Display label
  description?: string;          // Optional description
  icon?: React.ReactNode;        // Icon component
  category?: string;             // Group category
  keywords?: string[];           // Search keywords
  shortcut?: string;             // Keyboard shortcut display
  action: () => void;            // Execution handler
  url?: string;                  // Optional URL
  badge?: string;                // Badge text
  metadata?: Record<string, any>; // Extra data
}
```

### useCommandK Hook

```typescript
const { isOpen, open, close, toggle } = useCommandK();
```

Returns:
- `isOpen`: Current open state
- `open()`: Open the palette
- `close()`: Close the palette
- `toggle()`: Toggle open/close

---

## Integration Examples

### With NavbarOverlay

```tsx
import { NavbarOverlay, CommandKPalette, useCommandK } from "@workspace/shared-ui/blocks";

function App() {
  const { isOpen, open, close } = useCommandK();

  return (
    <>
      <NavbarOverlay
        title="My App"
        onSearchClick={open}  // ⌘K button
        user={user}
      />
      
      <CommandKPalette
        isOpen={isOpen}
        onClose={close}
        actions={actions}
      />
    </>
  );
}
```

### With Audit Trail

```tsx
const commands = [
  {
    id: "toggle-audit",
    label: "Toggle Audit Trail",
    category: "View",
    shortcut: "⌘A",
    action: () => setShowAuditTrail(!showAuditTrail),
  },
  {
    id: "export-audit",
    label: "Export Audit Log",
    category: "Audit",
    action: () => exportAuditLog(),
  },
];
```

### With Navigation

```tsx
import { CommonCommands } from "@workspace/shared-ui/blocks";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
const navCommands = CommonCommands.navigation(navigate);
```

---

## Common Command Presets

### Navigation Commands

```tsx
CommonCommands.navigation((path) => navigate(path))
```

Returns:
- Go to Home (⌘H)
- Open Settings (⌘,)

### File Commands

```tsx
CommonCommands.file({
  new: () => createFile(),
  open: () => openFile(),
})
```

Returns:
- New Document (⌘N)
- Open Document (⌘O)

### Audit Commands

```tsx
CommonCommands.audit({
  viewAudit: () => setShowAudit(true),
  exportAudit: () => exportLog(),
})
```

Returns:
- View Audit Trail (⌘A)
- Export Audit Log

---

## Advanced Usage

### Custom Shortcuts

```tsx
const actions = [
  {
    id: "custom",
    label: "Custom Action",
    shortcut: "⌘⇧P",  // Display only
    action: () => console.log("Action"),
  },
];

// Register actual shortcut separately
React.useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "p") {
      e.preventDefault();
      // Execute action
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Dynamic Actions

```tsx
const getDynamicActions = () => {
  const userActions = currentUser.role === "admin" 
    ? adminActions 
    : userActions;
    
  return [...commonActions, ...userActions];
};

<CommandKPalette
  actions={getDynamicActions()}
/>
```

### Action with Navigation

```tsx
{
  id: "open-profile",
  label: "Open Profile",
  action: () => {
    navigate("/profile");
    // Automatically closes palette
  },
}
```

### External Links

```tsx
{
  id: "docs",
  label: "Documentation",
  description: "View help docs",
  url: "https://docs.example.com",
  icon: <ExternalLink className="h-4 w-4" />,
  action: () => window.open("https://docs.example.com", "_blank"),
}
```

---

## Keyboard Reference

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Open palette |
| `ESC` | Close palette |
| `↑` | Move selection up |
| `↓` | Move selection down |
| `Enter` | Execute selected action |
| Type text | Filter actions |

---

## Search Syntax

- **Plain text**: Fuzzy search across all fields
- **@ prefix**: Search users (coming soon)
- **# prefix**: Search tags (coming soon)
- **/ prefix**: Search commands (coming soon)

---

## Styling

The palette uses CSS variables from `@workspace/design-system`:

```css
/* Backdrop */
bg-black/50 backdrop-blur-sm

/* Card */
shadow-2xl

/* Selected item */
bg-primary text-primary-foreground

/* Hover item */
hover:bg-muted
```

---

## Performance

- **Debounced search**: Smooth typing experience
- **Virtual scrolling**: Handle 1000+ actions
- **Keyboard optimization**: Instant response
- **Lazy loading**: Load actions on-demand

---

## Accessibility

✅ **WCAG 2.1 AA Compliant**
- Keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader support

---

## Best Practices

1. **Keep labels short**: Max 40 characters
2. **Add descriptions**: Help users understand actions
3. **Use keywords**: Improve discoverability
4. **Group related actions**: Use categories
5. **Show shortcuts**: Help users learn keyboard shortcuts
6. **Track recent actions**: Improve UX for repeat users
7. **Limit results**: Don't overwhelm with 100+ results

---

## Troubleshooting

### Command-K not opening?
- Check `useCommandK()` is called in component
- Verify no conflicting keyboard shortcuts
- Check browser console for errors

### Actions not appearing?
- Verify `actions` or `groups` prop is passed
- Check `maxResults` prop (default 50)
- Look for console errors

### Search not working?
- Check `label`, `description`, `keywords` fields
- Verify actions have unique `id`
- Test with simple query first

---

## Examples

See complete integration examples:
- [command-k-integration.tsx](../examples/command-k-integration.tsx)
- [integrated-audit-system.tsx](../examples/integrated-audit-system.tsx)

---

## Related Components

Works great with:
- `NavbarOverlay` - Trigger from navbar
- `AuditTrailViewer` - Audit trail commands
- `SearchCommandPalette` - Alternative implementation
- `QuickActionToolbar` - Complementary UI

---

## Future Enhancements

- [ ] @ mentions for user search
- [ ] # tags for filtering
- [ ] / command prefix
- [ ] AI-powered suggestions
- [ ] Usage analytics
- [ ] Custom themes
- [ ] Mobile optimizations
- [ ] Plugin system
