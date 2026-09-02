'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: ReactNode;
  containerClassName?: string;
  textClassName?: string;
  baseOpacity?: number;
  baseRotation?: number;
};

export default function ScrollReveal({
  children,
  containerClassName = '',
  textClassName = '',
  baseOpacity = 0.16,
  baseRotation = 2,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      return (
        <span className="reveal-word inline-block" key={`${word}-${index}`}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || reduceMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          rotate: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom center',
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        element.querySelectorAll<HTMLElement>('.reveal-word'),
        { opacity: baseOpacity, y: 18 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom-=15%',
            end: 'bottom center',
            scrub: true,
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [baseOpacity, baseRotation, reduceMotion]);

  return (
    <div ref={containerRef} className={containerClassName}>
      <p className={textClassName}>{splitText}</p>
    </div>
  );
}
