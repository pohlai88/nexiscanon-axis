/**
 * Settings Page Template 01
 * 
 * Tabbed settings interface with:
 * - Application shell
 * - Tab navigation
 * - Settings sections
 * - Form controls
 * 
 * Usage: Copy to apps/[app]/app/dashboard/settings/page.tsx and customize
 */

"use client";

import { ApplicationShell01 } from "@workspace/shared-ui/blocks";
import { Button, Card, Input, Label, Switch } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  User,
  Bell,
  Shield,
  CreditCard,
} from "lucide-react";
import { useState } from "react";

type TabId = "profile" | "notifications" | "security" | "billing";

const tabs = [
  { id: "profile" as TabId, label: "Profile", icon: User },
  { id: "notifications" as TabId, label: "Notifications", icon: Bell },
  { id: "security" as TabId, label: "Security", icon: Shield },
  { id: "billing" as TabId, label: "Billing", icon: CreditCard },
];

export default function SettingsPage01() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <ApplicationShell01
      sidebarItems={[
        {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard",
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
          isActive: true,
        },
      ]}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings" },
      ]}
      user={{
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://github.com/shadcn.png",
      }}
      onLogoutClick={() => console.log("Logout clicked")}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                    "transition-colors duration-200",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "profile" && (
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-bold">Profile Information</h2>
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className={cn(
                      "flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "transition-colors duration-200",
                      "placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    placeholder="Tell us about yourself..."
                    defaultValue=""
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-bold">
                Notification Preferences
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-bold">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 font-medium">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Update Security</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-bold">Billing Information</h2>
              <div className="space-y-6">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Plan: Professional</p>
                      <p className="text-sm text-muted-foreground">
                        $29/month • Renews on Feb 21, 2026
                      </p>
                    </div>
                    <Button variant="outline">Upgrade Plan</Button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-medium">Payment Method</h3>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">
                            Expires 12/2026
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Update</Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="destructive">Cancel Subscription</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ApplicationShell01>
  );
}
