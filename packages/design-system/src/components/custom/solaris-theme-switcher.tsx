"use client";

import { useTheme } from "next-themes";
import { useColorTheme } from "../../providers/theme-provider";
import { THEME_NAMES, THEME_LABELS, type ThemeName } from "../../tokens/theme";
import { Moon, Sun, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SolarisThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setIsTransitioning(true);
    
    // Create solaris morphing effect
    const transition = document.createElement("div");
    transition.className = "solaris-transition";
    transition.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
      background: radial-gradient(circle at center, 
        var(--primary) 0%, 
        var(--primary-foreground) 50%, 
        transparent 100%);
      opacity: 0;
      mix-blend-mode: ${newTheme === "dark" ? "multiply" : "screen"};
    `;
    
    document.body.appendChild(transition);
    
    // Animate solaris effect
    transition.animate([
      { opacity: 0, transform: "scale(0)" },
      { opacity: 0.8, transform: "scale(2)" },
      { opacity: 0, transform: "scale(4)" }
    ], {
      duration: 800,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }).onfinish = () => {
      transition.remove();
      setIsTransitioning(false);
    };
    
    setTheme(newTheme);
  };

  const handleColorChange = (newColor: ThemeName) => {
    setIsTransitioning(true);
    
    // Create color morph effect
    const colorOverlay = document.createElement("div");
    colorOverlay.className = "color-morph-overlay";
    colorOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9998;
      pointer-events: none;
      background: var(--primary);
      opacity: 0;
      mix-blend-mode: color;
    `;
    
    document.body.appendChild(colorOverlay);
    
    colorOverlay.animate([
      { opacity: 0 },
      { opacity: 0.6 },
      { opacity: 0 }
    ], {
      duration: 600,
      easing: "ease-in-out"
    }).onfinish = () => {
      colorOverlay.remove();
      setIsTransitioning(false);
    };
    
    setColorTheme(newColor);
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-40 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm" />
        <div className="h-10 w-24 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-3">
      {/* Enhanced Color Theme Selector */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex items-center gap-2 rounded-lg border border-border/50 bg-background/80 px-3 py-2 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-background/90 hover:shadow-lg hover:shadow-primary/5">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <select
            className="bg-transparent text-sm font-medium outline-none cursor-pointer"
            value={colorTheme}
            onChange={(e) => handleColorChange(e.target.value as ThemeName)}
            disabled={isTransitioning}
          >
            {THEME_NAMES.map((name: ThemeName) => (
              <option key={name} value={name}>
                {THEME_LABELS[name]}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Solaris Dark Mode Toggle */}
      <motion.button
        type="button"
        className="group relative flex h-10 items-center gap-2 overflow-hidden rounded-lg border border-border/50 bg-background/80 px-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-background/90 hover:shadow-lg hover:shadow-primary/5"
        onClick={() => handleThemeChange(isDark ? "light" : "dark")}
        disabled={isTransitioning}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
          animate={{
            x: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Icon animation */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Moon className="h-4 w-4 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Sun className="h-4 w-4 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <span className="relative text-sm font-medium">
          {isDark ? "Dark" : "Light"}
        </span>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            translateX: ["100%", "-100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.button>
    </div>
  );
}
