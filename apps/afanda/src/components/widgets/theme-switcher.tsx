"use client";

/**
 * AFANDA Theme Switcher
 *
 * Comprehensive theme customization widget with:
 * - Base theme selection (9 themes)
 * - Light/dark mode toggle
 * - Style preset selection (5 styles)
 * - Accent color picker (9 colors)
 * - Texture effects toggle
 *
 * @see DESIGN_SYSTEM_GUIDE.md
 */

import * as React from "react";
import { Moon, Sun, Palette, Sparkles } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";
import {
  useTheme,
  useThemeConfig,
  THEME_NAMES,
  STYLE_NAMES,
  ACCENT_NAMES,
  type ThemeName,
  type StyleName,
  type AccentName,
} from "@/components/providers/theme-provider";
import {
  THEME_LABELS,
  THEME_DESCRIPTIONS,
  STYLE_LABELS,
  STYLE_DESCRIPTIONS,
  ACCENT_LABELS,
  ACCENT_SWATCHES,
} from "@workspace/design-system/tokens";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const {
    baseTheme,
    setBaseTheme,
    style,
    setStyle,
    accent,
    setAccent,
    textureEnabled,
    setTextureEnabled,
  } = useThemeConfig();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Customize the appearance of your AFANDA dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="accent">Accent</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          {/* Base Theme Selection */}
          <TabsContent value="theme" className="space-y-4">
            <div className="space-y-2">
              <Label>Color Mode</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex-1"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex-1"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex-1"
                >
                  System
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Base Theme</Label>
              <RadioGroup
                value={baseTheme}
                onValueChange={(value) => setBaseTheme(value as ThemeName)}
                className="grid grid-cols-1 gap-2"
              >
                {THEME_NAMES.map((themeName) => (
                  <div key={themeName} className="flex items-center space-x-2">
                    <RadioGroupItem value={themeName} id={themeName} />
                    <Label
                      htmlFor={themeName}
                      className="flex flex-1 cursor-pointer flex-col"
                    >
                      <span className="font-medium">
                        {THEME_LABELS[themeName]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {THEME_DESCRIPTIONS[themeName]}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>

          {/* Style Preset Selection */}
          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label>Visual Density</Label>
              <RadioGroup
                value={style}
                onValueChange={(value) => setStyle(value as StyleName)}
                className="grid grid-cols-1 gap-2"
              >
                {STYLE_NAMES.map((styleName) => (
                  <div key={styleName} className="flex items-center space-x-2">
                    <RadioGroupItem value={styleName} id={styleName} />
                    <Label
                      htmlFor={styleName}
                      className="flex flex-1 cursor-pointer flex-col"
                    >
                      <span className="font-medium">
                        {STYLE_LABELS[styleName]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {STYLE_DESCRIPTIONS[styleName]}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>

          {/* Accent Color Selection */}
          <TabsContent value="accent" className="space-y-4">
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="grid grid-cols-3 gap-2">
                {ACCENT_NAMES.map((accentName) => (
                  <button
                    key={accentName}
                    onClick={() => setAccent(accentName)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all duration-200",
                      accent === accentName
                        ? "border-primary bg-accent"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{
                        backgroundColor: ACCENT_SWATCHES[accentName],
                      }}
                    />
                    <span className="text-xs font-medium">
                      {ACCENT_LABELS[accentName]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Effects */}
          <TabsContent value="effects" className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="texture-toggle" className="font-medium">
                    Texture Effects
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable subtle grain texture on surfaces
                </p>
              </div>
              <Switch
                id="texture-toggle"
                checked={textureEnabled}
                onCheckedChange={setTextureEnabled}
              />
            </div>

            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-2 font-medium">Preview</h4>
              <div
                className={cn(
                  "h-32 rounded-lg border border-border bg-card p-4",
                  textureEnabled && "glass glass-grain"
                )}
              >
                <p className="text-sm text-muted-foreground">
                  This is a preview of the texture effect. Toggle the switch
                  above to see the difference.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
