'use client';

import { motion, useReducedMotion, type Easing, type Transition } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type BlurTextProps = {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  easing?: Easing | Easing[];
};

const buildKeyframes = (
  from: Record<string, number>,
  steps: Array<Record<string, number>>,
): Record<string, number[]> => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);
  const keyframes: Record<string, number[]> = {};
  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });
  return keyframes;
};

export default function BlurText({
  text,
  delay = 70,
  className = '',
  animateBy = 'words',
  direction = 'bottom',
  threshold = 0.1,
  rootMargin = '0px',
  easing = [0.16, 1, 0.3, 1],
}: BlurTextProps) {
  const segments = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion, rootMargin, threshold]);

  const from = useMemo(
    () => ({ opacity: 0, y: direction === 'top' ? -28 : 28 }),
    [direction],
  );
  const to = useMemo(() => [{ opacity: 0.65, y: direction === 'top' ? 4 : -4 }, { opacity: 1, y: 0 }], [direction]);
  const keyframes = buildKeyframes(from, to);

  return (
    <h1 ref={ref} className={`blur-text ${className}`}>
      {segments.map((segment, index) => {
        const transition: Transition = {
          duration: 0.7,
          times: [0, 0.35, 1],
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            key={`${segment}-${index}`}
            initial={reduceMotion ? false : from}
            animate={reduceMotion || inView ? keyframes : from}
            transition={transition}
            className="inline-block"
          >
            {segment}
            {animateBy === 'words' && index < segments.length - 1 ? '\u00A0' : null}
          </motion.span>
        );
      })}
    </h1>
  );
}
