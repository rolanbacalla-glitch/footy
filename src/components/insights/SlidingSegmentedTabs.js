"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Apple Human Interface Guidelines (HIG) Motion Calibration:
 * - Critically-damped / snappy spring matching SwiftUI `.spring(response: 0.32, dampingFraction: 0.86)`
 *   and iOS / macOS UISegmentedControl gliding thumb physics.
 * - Immediately interruptible mid-flight with zero rubbery overshoot.
 * - Automatically honours `prefers-reduced-motion: reduce`.
 */
export const APPLE_SPRING = {
  type: "spring",
  stiffness: 460,
  damping: 36,
  mass: 0.85,
};

export const APPLE_SLIDE_EASE = [0.22, 1, 0.36, 1];

export function SlidingSegmentedTabs({
  tabs,
  value,
  onChange,
  layoutId,
  ariaLabel = "Navigation tabs",
  variant = "lime", // "lime" | "glass" | "light"
  size = "md", // "xs" | "sm" | "md"
  className = "",
}) {
  const prefersReducedMotion = useReducedMotion();

  const handleKeyDown = (e, index) => {
    if (!tabs.length) return;
    let nextIndex = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      onChange(tabs[nextIndex].id);
    }
  };

  const trackCls =
    variant === "glass"
      ? "inline-flex items-center p-1 rounded-full gap-0.5 bg-white/[0.03] border border-white/[0.06]"
      : "glass-segmented inline-flex items-center p-1 rounded-full gap-0.5";

  const sizeCls =
    size === "xs"
      ? "min-h-[28px] px-2.5 py-1 text-[11px]"
      : size === "sm"
      ? "min-h-[30px] px-3 py-1 text-xs"
      : "min-h-[34px] px-3 py-1.5 text-xs";

  const thumbCls =
    variant === "light"
      ? "bg-white shadow-[0_2px_10px_rgba(255,255,255,0.22)]"
      : variant === "glass"
      ? "bg-white/[0.12] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
      : "bg-[#D2F865] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_14px_-2px_rgba(210,248,101,0.38)]";

  const activeTextCls =
    variant === "glass" ? "text-white" : "text-[#0E100C]";

  const inactiveTextCls = "text-[#8A8D96] hover:text-white";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`${trackCls} relative overflow-x-auto scrollbar-none max-w-full ${className}`}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = value === tab.id;

        return (
          <motion.button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            title={tab.title || tab.label}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            className={`relative z-10 ${sizeCls} rounded-full font-medium flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer select-none ${
              isActive ? activeTextCls : inactiveTextCls
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                transition={
                  prefersReducedMotion ? { duration: 0.01 } : APPLE_SPRING
                }
                className={`absolute inset-0 rounded-full -z-10 ${thumbCls}`}
              />
            )}
            {Icon && (
              <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            )}
            <span>{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Directional Sliding Content Panel (Apple HIG Spatial Continuity):
 * - Slides subtly (±16px) in the physical direction of tab travel while crossfading.
 * - Automatically collapses spatial displacement to a calm opacity fade when
 *   the user has Reduce Motion enabled.
 */
export function SlidingTabPanel({
  activeKey,
  direction = 1,
  axis = "x", // "x" (horizontal tabs) | "y" (vertical rail)
  distance = 16,
  children,
  className = "",
}) {
  const prefersReducedMotion = useReducedMotion();
  const offset = prefersReducedMotion ? 0 : direction * distance;
  const exitOffset = prefersReducedMotion ? 0 : direction * -Math.round(distance * 0.75);

  const initialProps =
    axis === "y"
      ? { opacity: 0, y: offset }
      : { opacity: 0, x: offset };

  const animateProps =
    axis === "y"
      ? { opacity: 1, y: 0 }
      : { opacity: 1, x: 0 };

  const exitProps =
    axis === "y"
      ? { opacity: 0, y: exitOffset }
      : { opacity: 0, x: exitOffset };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeKey}
        initial={initialProps}
        animate={animateProps}
        exit={exitProps}
        transition={
          prefersReducedMotion
            ? { duration: 0.12 }
            : { duration: 0.22, ease: APPLE_SLIDE_EASE }
        }
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
