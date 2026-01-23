# AFANDA - The Unified Decision Board

> **Analytics, Finance, Actions, Notifications, Data, Alerts**
>
> One board to see everything. One place for decisions.

---

## 📊 Overview

AFANDA is the executive dashboard and decision support system for the AXIS ERP platform. It provides a unified view of critical business metrics, pending actions, and real-time alerts across all organizational functions.

### Core Philosophy

**"What is happening? What needs attention? What should I do? How are we performing?"**

AFANDA answers these four questions in real-time, empowering decision-makers with actionable intelligence.

---

## 🎯 Key Features

### 1. **Real-Time Analytics**
- KPI metrics with trend indicators
- Interactive charts and visualizations
- Drill-down capabilities
- Customizable dashboards

### 2. **Action Management**
- Approval queues with SLA tracking
- Task prioritization
- Delegation workflows
- Read receipt system

### 3. **Alert System**
- Severity-based alerts (critical, warning, info, success)
- Acknowledgment tracking
- Escalation ladders
- Smart filtering

### 4. **Financial Intelligence**
- Cash position monitoring
- Revenue tracking (MTD, QTD, YTD)
- Expense analysis
- Budget variance alerts

### 5. **Multi-Dimensional Theming**
- 9 base themes (midnight default)
- 5 style presets (mia default)
- 9 accent colors
- Light/dark mode
- Texture effects
- Glass morphism

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ (via Neon)

### Installation

```bash
# From monorepo root
pnpm install

# Run AFANDA in development mode
pnpm --filter @axis/afanda dev
```

AFANDA runs on **http://localhost:3001**

### Environment Variables

```env
# Database (Neon)
DATABASE_URL="postgresql://..."

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID="..."
```

---

## 📁 Project Structure

```
apps/afanda/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with theme initialization
│   │   ├── page.tsx                # Dashboard home
│   │   ├── globals.css             # Global styles + theme imports
│   │   ├── approvals/              # Approval queue pages
│   │   ├── alerts/                 # Alert management pages
│   │   └── reports/                # Report builder pages
│   ├── components/
│   │   ├── layout/
│   │   │   ├── shell.tsx           # Application shell
│   │   │   ├── sidebar.tsx         # Navigation sidebar
│   │   │   └── header.tsx          # Top header bar
│   │   ├── widgets/
│   │   │   ├── metric-card.tsx     # KPI metric cards
│   │   │   ├── chart-widget.tsx    # Chart components
│   │   │   ├── alert-card.tsx      # Alert display cards
│   │   │   ├── theme-switcher.tsx  # Theme customization UI
│   │   │   └── theme-toggle.tsx    # Quick dark mode toggle
│   │   ├── providers/
│   │   │   └── theme-provider.tsx  # Theme context + next-themes
│   │   └── providers.tsx           # Root providers
│   └── lib/
│       ├── api/                    # API client functions
│       └── utils/                  # Utility functions
├── AFANDA.md                       # Architecture documentation
├── DESIGN_SYSTEM_GUIDE.md          # Design system reference
├── THEME_INTEGRATION.md            # Theme system guide
└── README.md                       # This file
```

---

## 🎨 Design System

AFANDA uses the **@workspace/design-system** package with comprehensive theming:

### Theme Configuration

```tsx
// Default AFANDA theme
{
  baseTheme: "midnight",      // Electric ink, professional
  style: "mia",               // Soft, rounded
  accent: "neutral",          // No accent overlay
  mode: "system",             // Follow system preference
  textureEnabled: true,       // Subtle grain texture
}
```

### Quick Reference

```tsx
// Import components
import { Button, Card, Badge } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

// Import blocks
import { ApprovalQueue } from "@workspace/design-system/blocks";

// Use theme hooks
import { useTheme, useThemeConfig } from "@/components/providers/theme-provider";

// Apply glass effects
<Card className="glass glass-solid glass-grain">
```

**See [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) for complete reference.**

---

## 🧩 Core Components

### 1. Application Shell

```tsx
import { AfandaShell } from "@/components/layout/shell";

<AfandaShell>
  {/* Dashboard content */}
</AfandaShell>
```

**Features:**
- Collapsible sidebar
- Responsive header
- Breadcrumb navigation
- Theme toggle
- User menu

### 2. Metric Cards

```tsx
import { MetricCard, MetricCardGroup } from "@/components/widgets/metric-card";

<MetricCardGroup columns={4}>
  <MetricCard
    label="Revenue MTD"
    value="$124,563"
    trend="up"
    change="+12.3%"
    description="vs last month"
  />
</MetricCardGroup>
```

### 3. Alert System

```tsx
import { AlertCard, AlertList } from "@/components/widgets/alert-card";

<AlertCard
  id="1"
  title="Low Cash Position"
  description="Cash position is below threshold"
  severity="critical"
  timestamp="2 minutes ago"
  onAcknowledge={(id) => handleAcknowledge(id)}
/>
```

### 4. Approval Queue

```tsx
import { ApprovalQueue } from "@workspace/design-system/blocks";

<ApprovalQueue
  items={approvalItems}
  onApprove={(id) => handleApprove(id)}
  onReject={(id) => handleReject(id)}
  onDelegate={(id, userId) => handleDelegate(id, userId)}
/>
```

---

## 🔧 Configuration

### Theme Customization

Users can customize the theme via the ThemeSwitcher component:

```tsx
import { ThemeSwitcher } from "@/components/widgets/theme-switcher";

function SettingsPage() {
  return <ThemeSwitcher />;
}
```

**Customizable:**
- Base theme (9 options)
- Light/dark mode
- Style preset (5 options)
- Accent color (9 options)
- Texture effects (on/off)

### Dashboard Layout

Configure dashboard widgets in `src/app/page.tsx`:

```tsx
const widgets = [
  { id: "revenue", type: "metric", span: 1 },
  { id: "cash", type: "metric", span: 1 },
  { id: "approvals", type: "queue", span: 2 },
  { id: "alerts", type: "list", span: 2 },
];
```

---

## 📊 Data Integration

### API Client

```tsx
import { api } from "@/lib/api";

// Fetch metrics
const metrics = await api.metrics.getKPIs();

// Fetch approvals
const approvals = await api.approvals.getPending();

// Fetch alerts
const alerts = await api.alerts.getActive();
```

### Real-Time Updates

```tsx
import { useRealtime } from "@/lib/hooks/use-realtime";

function Dashboard() {
  const { data, isConnected } = useRealtime("dashboard");
  
  return (
    <div>
      {isConnected && <Badge>Live</Badge>}
      {/* Dashboard content */}
    </div>
  );
}
```

---

## 🧪 Testing

```bash
# Run tests
pnpm --filter @axis/afanda test

# Run tests in watch mode
pnpm --filter @axis/afanda test:watch

# Run E2E tests
pnpm --filter @axis/afanda test:e2e
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [AFANDA.md](./AFANDA.md) | Architecture and design decisions |
| [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) | Complete design system reference |
| [THEME_INTEGRATION.md](./THEME_INTEGRATION.md) | Theme system implementation guide |
| [B11-AFANDA.md](../../.cursor/ERP/B11-AFANDA.md) | Canonical specification |
| [A01-CANONICAL.md](../../.cursor/ERP/A01-CANONICAL.md) | AXIS philosophy |

---

## 🛠️ Development

### Scripts

```bash
# Development server (port 3001)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm typecheck
```

### Code Style

AFANDA follows the AXIS coding standards:

- **TypeScript**: Strict mode, no `any` types
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS v4 with semantic tokens
- **Imports**: Workspace protocol (`@workspace/...`)
- **Naming**: `kebab-case` for files, `PascalCase` for components

**See [00-global.always.mdc](../../.cursor/rules/00-global.always.mdc) for complete rules.**

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod

# Environment variables required:
# - DATABASE_URL
# - NEXT_PUBLIC_ANALYTICS_ID (optional)
```

### Docker

```bash
# Build Docker image
docker build -t afanda:latest .

# Run container
docker run -p 3001:3001 afanda:latest
```

---

## 🤝 Contributing

AFANDA is part of the AXIS monorepo. See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

### Key Principles

1. **DRY + KISS**: Don't Repeat Yourself; Keep It Simple, Stupid
2. **Minimal Change**: Do the minimum change that solves the problem
3. **Canonical Sources**: Prefer canonical sources over copy/paste
4. **Quality Gates**: No broken links, no duplicated rules, no `any` types

---

## 📝 License

Proprietary - AXIS ERP Platform

---

## 📞 Support

For questions or issues:

1. Check [AFANDA.md](./AFANDA.md) for architecture details
2. Review [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) for styling
3. Consult [B11-AFANDA.md](../../.cursor/ERP/B11-AFANDA.md) for specifications

---

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Core dashboard layout
- [x] Multi-dimensional theming
- [x] Metric cards with trends
- [x] Alert system
- [x] Approval queue integration

### Phase 2 (Next)
- [ ] Real-time data updates
- [ ] Advanced chart types
- [ ] Custom dashboard builder
- [ ] Mobile responsive design
- [ ] Export/print functionality

### Phase 3 (Future)
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Natural language queries
- [ ] Multi-tenant support
- [ ] Advanced role-based access

---

**Built with ❤️ by the AXIS Architecture Team**
