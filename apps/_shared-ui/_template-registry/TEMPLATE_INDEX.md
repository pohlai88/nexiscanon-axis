# Template Index for AI Code Generation

**Purpose**: Train Cursor AI to use `@workspace/design-system` correctly.

**Location**: `apps/_shared-ui/_template-registry/TEMPLATE_INDEX.md`

**Referenced by**: `.cursor/rules/template-enforcement.always.mdc`

---

## 🎯 Core Rules (MANDATORY)

When generating code in `apps/`, **ALWAYS** follow:

### Rule 1: Workspace Imports Only
```tsx
// ✅ CORRECT
import { Button, Card, Input } from "@workspace/design-system";
import { HeroSection01, NavbarComponent01 } from "@workspace/shared-ui/blocks";
import { cn } from "@workspace/design-system/lib/utils";

// ❌ STOP - Fix immediately
import { Button } from "./components/ui/button";
import { Card } from "../components/card";
```

### Rule 2: cn() for className (Never Template Literals)
```tsx
// ✅ CORRECT
<div className={cn(
  "rounded-lg border p-4",
  "transition-all duration-300",
  isActive && "bg-primary text-primary-foreground"
)} />

// ❌ STOP - Fix immediately
<div className={`rounded-lg border p-4 ${isActive ? 'bg-primary' : ''}`} />
```

### Rule 3: Semantic Color Tokens (Never Hardcoded)
```tsx
// ✅ CORRECT
"bg-background"
"bg-primary text-primary-foreground"
"bg-card border-border"
"from-primary to-primary/60"

// ❌ STOP - Fix immediately
"bg-white"
"bg-blue-500 text-white"
"bg-gray-100 border-gray-300"
```

### Rule 4: Explicit Transition Durations
```tsx
// ✅ CORRECT
"transition-all duration-300"
"transition-colors duration-200"

// ❌ STOP - Fix immediately
"transition-all"
"transition-colors"
```

---

## 📦 Available Blocks

### Marketing Blocks
```tsx
import {
  HeroSection01,        // Hero with badge, CTA, optional image
  NavbarComponent01,    // Sticky header with logo/nav
  FooterComponent01,    // Three-section footer
  FeaturesSection01,    // Three-column feature grid
  CtaSection01,         // CTA with app store buttons
  FaqComponent01,       // Accordion FAQ
} from "@workspace/shared-ui/blocks";
```

### Dashboard Blocks
```tsx
import {
  ApplicationShell01,   // Sidebar layout with header
  DashboardSidebar01,   // Sidebar with nav menu
  DashboardHeader01,    // Header with breadcrumbs
} from "@workspace/shared-ui/blocks";
```

### Data Tables
```tsx
import {
  DataFortress,         // Advanced table (sort/filter/export)
  MagicApprovalTable,   // Lightweight approval table
} from "@workspace/shared-ui/blocks";
```

---

## 🏗️ Page Templates

### Landing Page Pattern

**When user asks**: "Create a landing page"

```tsx
import {
  NavbarComponent01,
  HeroSection01,
  FeaturesSection01,
  CtaSection01,
  FooterComponent01,
} from "@workspace/shared-ui/blocks";
import { Zap, Shield, Rocket } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarComponent01
        logo={{ text: "Brand Name", href: "/" }}
        leftNav={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
        ]}
        rightNav={[
          { label: "Docs", href: "/docs" },
          { label: "Sign In", href: "/login" },
        ]}
      />

      <HeroSection01
        badge="✨ New Release"
        heading="Your Product Headline"
        description="Compelling value proposition in 1-2 sentences."
        primaryCta={{ label: "Get Started", href: "/signup" }}
        secondaryCta={{ label: "Learn More", href: "/docs" }}
      />

      <FeaturesSection01
        heading="Everything you need"
        description="Built with best practices"
        features={[
          {
            icon: Zap,
            title: "Lightning Fast",
            description: "Optimized for performance",
          },
          {
            icon: Shield,
            title: "Secure",
            description: "Enterprise-grade security",
          },
          {
            icon: Rocket,
            title: "Scalable",
            description: "Grows with your business",
          },
        ]}
      />

      <CtaSection01
        heading="Ready to get started?"
        description="Join thousands of satisfied customers"
        appStore={{ href: "https://apps.apple.com" }}
        playStore={{ href: "https://play.google.com" }}
      />

      <FooterComponent01
        logo={{ text: "Brand Name", href: "/" }}
        navigation={[
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
        ]}
        social={[
          { platform: "twitter", href: "https://twitter.com" },
          { platform: "github", href: "https://github.com" },
        ]}
      />
    </div>
  );
}
```

---

### Dashboard Pattern

**When user asks**: "Create a dashboard"

```tsx
import { ApplicationShell01 } from "@workspace/shared-ui/blocks";
import { Card } from "@workspace/design-system";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  return (
    <ApplicationShell01
      sidebarItems={[
        {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard",
          isActive: true,
        },
        {
          label: "Users",
          icon: <Users className="h-5 w-5" />,
          href: "/dashboard/users",
        },
        {
          label: "Reports",
          icon: <FileText className="h-5 w-5" />,
          href: "/dashboard/reports",
        },
        {
          label: "Settings",
          icon: <Settings className="h-5 w-5" />,
          href: "/dashboard/settings",
        },
      ]}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Overview" },
      ]}
      user={{
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://github.com/shadcn.png",
      }}
      onLogoutClick={() => console.log("Logout")}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-3xl font-bold">$45,231</div>
          </Card>
        </div>
        
        {children}
      </div>
    </ApplicationShell01>
  );
}
```

---

### Dashboard Template 02 (Shadcn-Inspired)

**When user asks**: "Create a dashboard like shadcn dashboard-01"

```tsx
import { ApplicationShell01 } from "@workspace/shared-ui/blocks";
import { DataFortress } from "@workspace/shared-ui/blocks";
import type { DataFortressColumn } from "@workspace/shared-ui/blocks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

export default function Dashboard02() {
  return (
    <ApplicationShell01
      sidebarItems={[...]}
      breadcrumbs={[...]}
      user={{...}}
    >
      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Section Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader>...</CardHeader>
              <CardContent>...</CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Area */}
        <Card>
          <CardHeader>...</CardHeader>
          <CardContent>...</CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent>
            <DataFortress data={data} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </ApplicationShell01>
  );
}
```

---

### Tasks Pattern

**When user asks**: "Create a tasks page"

```tsx
import { ApplicationShell01 } from "@workspace/shared-ui/blocks";
import { SmartTaskList } from "@workspace/shared-ui/blocks";
import type { Task } from "@workspace/shared-ui/blocks";
import { Button, Card, Input } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

export default function TasksPage01() {
  return (
    <ApplicationShell01 {...}>
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Input placeholder="Search tasks..." />
            <Button variant="outline">Filters</Button>
          </div>
        </Card>

        {/* Task List */}
        <SmartTaskList
          tasks={tasks}
          onTaskUpdate={handleUpdate}
          showAssignee
          showDueDate
          showPriority
        />
      </div>
    </ApplicationShell01>
  );
}
```

---

### Login Page 03 Pattern (Shadcn-Inspired)

**When user asks**: "Create a login page like shadcn login-03"

```tsx
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, FieldGroup, FieldLabel, FieldSeparator, Input } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

export default function LoginPage03() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Logo/Brand */}
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Icon className="size-4" />
          </div>
          Brand Name
        </a>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Login with your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <FieldGroup>
                <Field>
                  <Button variant="outline" type="button">Login with Apple</Button>
                  <Button variant="outline" type="button">Login with Google</Button>
                </Field>
                <FieldSeparator>Or continue with</FieldSeparator>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" />
                </Field>
                <Field>
                  <Button type="submit">Login</Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### Login Page 04 Pattern (Shadcn-Inspired)

**When user asks**: "Create a login page like shadcn login-04"

```tsx
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, FieldGroup, FieldLabel, FieldSeparator, Input } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

export default function LoginPage04() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card>
          <div className="grid md:grid-cols-2">
            {/* Form Section */}
            <div className="p-6 md:p-8">
              <CardHeader className="px-0">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your email to sign in</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <form>
                  <FieldGroup>
                    {/* Form fields */}
                  </FieldGroup>
                </form>
              </CardContent>
            </div>

            {/* Image Section */}
            <div className="hidden bg-muted/50 md:block">
              <div className="flex h-full items-center justify-center p-8">
                {/* Image or illustration */}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

### Data Table Pattern

**When user asks**: "Create a data table"

```tsx
import { DataFortress } from "@workspace/shared-ui/blocks";
import type { DataFortressColumn } from "@workspace/shared-ui/blocks";
import { cn } from "@workspace/design-system/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

const columns: DataFortressColumn<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    sortable: true,
    filterable: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    sortable: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        row.original.status === "active"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      )}>
        {row.original.status}
      </span>
    ),
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage your users</p>
      </div>

      <DataFortress
        data={users}
        columns={columns}
        selectable
        auditEnabled
        exportable
        onExport={(format) => console.log("Export:", format)}
      />
    </div>
  );
}
```

---

### Form Pattern

**When user asks**: "Create a form"

```tsx
import { Button, Input, Label, Card } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";
import { useState } from "react";

export default function FormExample() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log("Submit:", formData);
    }
  };

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Card>
  );
}
```

---

## 🎨 Common Patterns

### Conditional Styling
```tsx
<button
  className={cn(
    "rounded-lg border px-4 py-2",
    "transition-all duration-200",
    isActive
      ? "border-primary bg-primary text-primary-foreground shadow-lg"
      : "bg-card hover:bg-accent hover:text-accent-foreground",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>
```

### Responsive Layout
```tsx
<div className={cn(
  "grid grid-cols-1 gap-4 p-4",
  "md:grid-cols-2 md:gap-6 md:p-6",
  "lg:grid-cols-3 lg:gap-8 lg:p-8"
)}>
  {/* Content */}
</div>
```

### Loading States
```tsx
{isLoading ? (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="h-20 animate-pulse rounded-lg bg-muted"
      />
    ))}
  </div>
) : (
  <div>{/* Actual content */}</div>
)}
```

### Empty States
```tsx
{data.length === 0 ? (
  <Card className="p-12 text-center">
    <p className="text-muted-foreground">No data found</p>
    <Button className="mt-4">Add New</Button>
  </Card>
) : (
  <div>{/* Data display */}</div>
)}
```

---

## 🚫 Anti-Patterns (NEVER DO)

### ❌ Creating Custom Components
```tsx
// ❌ WRONG
export function CustomButton({ children }) {
  return <button className="...">{children}</button>;
}

// ✅ CORRECT
import { Button } from "@workspace/design-system";
```

### ❌ Template Literals in className
```tsx
// ❌ WRONG
<div className={`base ${isActive ? 'active' : ''}`} />

// ✅ CORRECT
<div className={cn("base", isActive && "active")} />
```

### ❌ Hardcoded Colors
```tsx
// ❌ WRONG
<div className="bg-blue-500 text-white" />

// ✅ CORRECT
<div className="bg-primary text-primary-foreground" />
```

### ❌ Missing Durations
```tsx
// ❌ WRONG
<div className="transition-all" />

// ✅ CORRECT
<div className="transition-all duration-300" />
```

### ❌ Inline Styles
```tsx
// ❌ WRONG
<div style={{ backgroundColor: '#3B82F6' }} />

// ✅ CORRECT
<div className="bg-primary" />
```

---

## 📊 Color Token Reference

### Backgrounds
```tsx
"bg-background"      // Page background
"bg-card"            // Card background
"bg-muted"           // Muted background
"bg-accent"          // Accent background
"bg-primary"         // Primary brand
"bg-secondary"       // Secondary brand
"bg-destructive"     // Error/destructive
```

### Text
```tsx
"text-foreground"           // Primary text
"text-muted-foreground"     // Secondary text
"text-card-foreground"      // Text on card
"text-primary-foreground"   // Text on primary
"text-accent-foreground"    // Text on accent
"text-destructive"          // Error text
```

### Borders
```tsx
"border-border"      // Default border
"border-primary"     // Primary border
"border-accent"      // Accent border
"border-destructive" // Error border
```

### Gradients
```tsx
"bg-gradient-to-r from-primary to-primary/60"
"bg-gradient-to-br from-accent to-accent/60"
"bg-gradient-to-br from-primary to-secondary"
```

---

## 🎯 Quick Summary

When generating code for apps:

1. **ALWAYS** import from `@workspace/design-system` and `@workspace/shared-ui`
2. **ALWAYS** use `cn()` for conditional classes
3. **ALWAYS** use semantic color tokens
4. **ALWAYS** specify transition durations
5. **NEVER** create custom components
6. **NEVER** use template literals in className
7. **NEVER** use hardcoded Tailwind colors
8. **NEVER** use inline styles

This ensures all apps maintain A+ quality like the design system itself.
