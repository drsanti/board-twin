/*******************************************************************************
 * File Name : trn-pie-menu-motion.ts
 *
 * Description : CSS + GSAP open/close timelines for TRNPieMenu.
 *
 *******************************************************************************/

import { gsap } from "gsap";
import type {
  TRNPieMenuBuildTimelineContext,
  TRNPieMenuGsapConfig,
  TRNPieMenuMotionTargetRefs,
  TRNPieMenuResolvedAnimation,
} from "./trn-pie-menu-config.js";

export type TRNPieMenuMotionContext = TRNPieMenuBuildTimelineContext;

export function trnPieMenuCssAnimationClass(
  animation: TRNPieMenuResolvedAnimation,
): string | null {
  if (animation.engine !== "css" || animation.preset === "none") {
    return null;
  }
  if (animation.preset === "spring") {
    return null;
  }
  if (animation.preset === "fade-scale") {
    return "trn-pie-menu--anim-fade-scale";
  }
  if (animation.preset === "blender") {
    return "trn-pie-menu--anim-blender";
  }
  return null;
}

function motionSliceElements(refs: TRNPieMenuMotionTargetRefs): HTMLElement[] {
  return refs.slices.filter((el): el is HTMLElement => el != null);
}

function presetGsapConfig(
  preset: TRNPieMenuResolvedAnimation["preset"],
  animation: TRNPieMenuResolvedAnimation,
): TRNPieMenuGsapConfig {
  const duration = animation.durationSec;
  const stagger = animation.staggerSec;
  if (preset === "spring") {
    return {
      ease: "back.out(1.35)",
      hubFrom: { opacity: 0, scale: 0.55 },
      hubTo: { opacity: 1, scale: 1, duration, ease: "elastic.out(1, 0.55)" },
      sliceFrom: { opacity: 0, scale: 0.72 },
      sliceTo: { opacity: 1, scale: 1, duration, ease: "back.out(1.35)" },
      titleFrom: { opacity: 0 },
      titleTo: { opacity: 1, duration: duration * 0.9, ease: "power2.out" },
      stagger: { each: stagger, from: "center" },
    };
  }
  if (preset === "blender") {
    return {
      ease: "power3.out",
      hubFrom: { opacity: 0, scale: 0.82 },
      hubTo: { opacity: 1, scale: 1, duration: duration * 0.85 },
      sliceFrom: { opacity: 0 },
      sliceTo: { opacity: 1, duration: duration * 0.65 },
      titleFrom: { opacity: 0 },
      titleTo: { opacity: 1, duration: duration * 0.5 },
      stagger: stagger * 0.35,
    };
  }
  return {
    ease: "power2.out",
    hubFrom: { opacity: 0, scale: 0.6 },
    hubTo: { opacity: 1, scale: 1, duration },
    sliceFrom: { opacity: 0, scale: 0.88 },
    sliceTo: { opacity: 1, scale: 1, duration },
    titleFrom: { opacity: 0 },
    titleTo: { opacity: 1, duration: duration * 0.85 },
    stagger: stagger,
  };
}

function mergeGsapConfig(
  animation: TRNPieMenuResolvedAnimation,
): TRNPieMenuGsapConfig {
  const base = presetGsapConfig(animation.preset, animation);
  const override = animation.gsap ?? {};
  return {
    ...base,
    ...override,
    hubFrom: { ...base.hubFrom, ...override.hubFrom },
    hubTo: { ...base.hubTo, ...override.hubTo },
    sliceFrom: { ...base.sliceFrom, ...override.sliceFrom },
    sliceTo: { ...base.sliceTo, ...override.sliceTo },
    titleFrom: { ...base.titleFrom, ...override.titleFrom },
    titleTo: { ...base.titleTo, ...override.titleTo },
  };
}

export function buildTrnPieMenuGsapOpenTimeline(
  ctx: TRNPieMenuMotionContext,
): gsap.core.Timeline {
  if (ctx.animation.buildOpenTimeline) {
    const custom = ctx.animation.buildOpenTimeline(ctx);
    if (custom != null) {
      return custom;
    }
  }
  const cfg = mergeGsapConfig(ctx.animation);
  const tl = ctx.gsap.timeline({ defaults: { ease: cfg.ease ?? "power2.out" } });
  const cluster = ctx.refs.cluster;
  const hub = ctx.refs.hub;
  const title = ctx.refs.title;
  const slices = motionSliceElements(ctx.refs);

  if (cluster != null) {
    ctx.gsap.set(cluster, { opacity: 1 });
  }

  if (hub != null) {
    ctx.gsap.set(hub, cfg.hubFrom ?? { opacity: 0, scale: 0.6 });
    tl.to(hub, { ...(cfg.hubTo ?? { opacity: 1, scale: 1 }), overwrite: "auto" }, 0);
  }
  if (title != null) {
    ctx.gsap.set(title, cfg.titleFrom ?? { opacity: 0 });
    tl.to(
      title,
      { ...(cfg.titleTo ?? { opacity: 1 }), overwrite: "auto" },
      0,
    );
  }
  if (slices.length > 0) {
    ctx.gsap.set(slices, cfg.sliceFrom ?? { opacity: 0, scale: 0.88 });
    tl.to(
      slices,
      {
        ...(cfg.sliceTo ?? { opacity: 1, scale: 1 }),
        stagger: cfg.stagger ?? ctx.animation.staggerSec,
        overwrite: "auto",
      },
      0,
    );
  }
  return tl;
}

export function buildTrnPieMenuGsapCloseTimeline(
  ctx: TRNPieMenuMotionContext,
): gsap.core.Timeline {
  if (ctx.animation.buildCloseTimeline) {
    const custom = ctx.animation.buildCloseTimeline(ctx);
    if (custom != null) {
      return custom;
    }
  }
  const duration = Math.max(0.1, ctx.animation.durationSec * 0.55);
  const tl = ctx.gsap.timeline({ defaults: { ease: "power2.out" } });
  const cluster = ctx.refs.cluster;
  const hub = ctx.refs.hub;
  const title = ctx.refs.title;
  const slices = motionSliceElements(ctx.refs);

  // Fade the whole cluster as one layer — no per-slice stagger/scale (those blink).
  if (cluster != null) {
    tl.to(cluster, { opacity: 0, duration, overwrite: "auto" }, 0);
  } else {
    if (slices.length > 0) {
      tl.to(slices, { opacity: 0, duration, overwrite: "auto" }, 0);
    }
    if (title != null) {
      tl.to(title, { opacity: 0, duration, overwrite: "auto" }, 0);
    }
    if (hub != null) {
      tl.to(hub, { opacity: 0, duration, overwrite: "auto" }, 0);
    }
  }
  return tl;
}

export function resetTrnPieMenuGsapTargets(ctx: TRNPieMenuMotionContext): void {
  const targets = [
    ctx.refs.cluster,
    ctx.refs.hub,
    ctx.refs.title,
    ...motionSliceElements(ctx.refs),
  ].filter((el): el is HTMLElement | SVGElement => el != null);
  if (targets.length === 0) {
    return;
  }
  ctx.gsap.set(targets, { clearProps: "opacity,transform,scale" });
}

export { gsap as trnPieMenuGsap };
