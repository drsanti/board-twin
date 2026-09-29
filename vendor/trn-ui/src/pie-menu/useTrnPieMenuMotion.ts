/*******************************************************************************
 * File Name : useTrnPieMenuMotion.ts
 *
 * Description : Mount/visibility + CSS or GSAP open/close for TRNPieMenu.
 *
 *******************************************************************************/

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  resolveTrnPieMenuAnimation,
  trnPieMenuShouldReduceMotion,
  type TRNPieMenuAnimationConfig,
  type TRNPieMenuMotionSlot,
  type TRNPieMenuMotionTargetRefs,
} from "./trn-pie-menu-config.js";
import type { TRNPieMenuLayout } from "./trn-pie-menu-layout.js";
import {
  buildTrnPieMenuGsapCloseTimeline,
  buildTrnPieMenuGsapOpenTimeline,
  resetTrnPieMenuGsapTargets,
  trnPieMenuCssAnimationClass,
  trnPieMenuGsap,
  type TRNPieMenuMotionContext,
} from "./trn-pie-menu-motion.js";

export function useTrnPieMenuMotion(args: {
  open: boolean;
  animationConfig?: TRNPieMenuAnimationConfig;
  layout: TRNPieMenuLayout;
  slots: ReadonlyArray<TRNPieMenuMotionSlot | null>;
}) {
  const animation = useMemo(
    () => resolveTrnPieMenuAnimation(args.animationConfig),
    [args.animationConfig],
  );
  const cssAnimClass = trnPieMenuCssAnimationClass(animation);
  const useGsap =
    animation.engine === "gsap" &&
    animation.preset !== "none" &&
    !trnPieMenuShouldReduceMotion(animation);

  const clusterRef = useRef<HTMLDivElement | null>(null);
  /** GSAP spring target — hub ring only; hover arc stays outside this group. */
  const hubAnimRef = useRef<SVGGElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const sliceRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [mounted, setMounted] = useState(args.open);
  const timelineRef = useRef<ReturnType<typeof buildTrnPieMenuGsapOpenTimeline> | null>(
    null,
  );

  const setSliceRef = useCallback((slot: number, el: HTMLDivElement | null) => {
    sliceRefs.current[slot] = el;
  }, []);

  const motionContext = useCallback((): TRNPieMenuMotionContext => {
    const refs: TRNPieMenuMotionTargetRefs = {
      cluster: clusterRef.current,
      hub: hubAnimRef.current,
      title: titleRef.current,
      slices: sliceRefs.current,
    };
    return {
      refs,
      layout: args.layout,
      animation,
      gsap: trnPieMenuGsap,
      slots: args.slots,
    };
  }, [animation, args.layout, args.slots]);

  const motionContextRef = useRef(motionContext);
  motionContextRef.current = motionContext;

  useLayoutEffect(() => {
    if (args.open) {
      setMounted(true);
    }
  }, [args.open]);

  useLayoutEffect(() => {
    if (!mounted) {
      return;
    }

    timelineRef.current?.kill();
    timelineRef.current = null;

    if (!useGsap) {
      if (!args.open) {
        setMounted(false);
      }
      return;
    }

    const ctx = motionContextRef.current();

    if (args.open) {
      resetTrnPieMenuGsapTargets(ctx);
      let raf = 0;
      let tl: ReturnType<typeof buildTrnPieMenuGsapOpenTimeline> | null = null;
      const runOpen = () => {
        const nextCtx = motionContextRef.current();
        const hasTargets =
          nextCtx.refs.hub != null ||
          nextCtx.refs.title != null ||
          nextCtx.refs.slices.some((el) => el != null);
        if (!hasTargets) {
          raf = requestAnimationFrame(runOpen);
          return;
        }
        tl = buildTrnPieMenuGsapOpenTimeline(nextCtx);
        timelineRef.current = tl;
        if (animation.onOpenComplete) {
          tl.eventCallback("onComplete", animation.onOpenComplete);
        }
      };
      runOpen();
      return () => {
        if (raf !== 0) {
          cancelAnimationFrame(raf);
        }
        tl?.kill();
      };
    }

    if (!animation.animateClose) {
      setMounted(false);
      return;
    }

    const tl = buildTrnPieMenuGsapCloseTimeline(ctx);
    timelineRef.current = tl;
    tl.eventCallback("onComplete", () => {
      animation.onCloseComplete?.();
      setMounted(false);
    });
    return () => {
      tl.kill();
    };
  }, [animation, args.open, mounted, useGsap]);

  useLayoutEffect(() => {
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);

  return {
    mounted,
    useGsap,
    cssAnimClass,
    clusterRef,
    hubAnimRef,
    titleRef,
    setSliceRef,
  };
}
