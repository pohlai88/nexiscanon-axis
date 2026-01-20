"use client";

import * as React from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "../lib/utils";

type SpotlightCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  keyof MotionProps
> &
  MotionProps & {
    children: React.ReactNode;
    spotlightColor?: string;
  };

function SpotlightCard({
  className,
  children,
  spotlightColor = "var(--primary)",
  ...props
}: SpotlightCardProps) {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all",
        "hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10",
        className
      )}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}15, transparent 40%)`,
        }}
      />

      {/* Glow border */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}40, transparent 60%)`,
          opacity,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <motion.div
          className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent"
          animate={{
            translateX: ["100%", "-100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
}

export { SpotlightCard };
export type { SpotlightCardProps };
