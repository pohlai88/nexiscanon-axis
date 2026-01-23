// Animation Utilities - Tailwind v4 optimized animation helpers
// Use these with Framer Motion or CSS animations

export * from "./variants"

// Transitions (Framer Motion Transition objects)
export {
  springDefault,
  springBouncy,
  springSmooth,
  springSnappy,
  springGentle,
  tweenFast,
  tweenDefault,
  tweenSlow,
  tweenVerySlow,
  createSpring,
  createTween,
  withDelay,
  createStagger,
  // Renamed to avoid conflict with easings
  easeInOut as easeInOutTransition,
  easeIn as easeInTransition,
  easeOut as easeOutTransition,
} from "./transitions"

// Easings (cubic bezier arrays)
export {
  linear,
  ease,
  easeIn,
  easeOut,
  easeInOut,
  easeInOutCubic,
  easeInOutQuart,
  easeInOutQuint,
  easeInQuad,
  easeInCubic,
  easeInQuart,
  easeOutQuad,
  easeOutCubic,
  easeOutQuart,
  easeOutBack,
  easeInOutBack,
  easeOutElastic,
  anticipate,
  materialStandard,
  materialDecelerate,
  materialAccelerate,
  materialSharp,
  iosStandard,
  iosDecelerate,
  iosAccelerate,
  createEasing,
  getEasing,
} from "./easings"
