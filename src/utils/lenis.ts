import Lenis from 'lenis';

let lenis: Lenis | null = null;

export const initLenis = () => {
  if (!lenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    const raf = (time: number) => {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  return lenis;
};

export const getLenis = () => {
  return lenis;
};