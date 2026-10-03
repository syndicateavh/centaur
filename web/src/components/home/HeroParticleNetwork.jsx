import React, { useEffect, useRef } from 'react';

const NETWORK_COLORS = Object.freeze({
  cool: [185, 205, 232],
  accent: [212, 175, 55],
});
const MAX_FRAME_DELTA = 34;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

function createRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function getPathCount(width) {
  if (width < 640) return 10;
  if (width < 1024) return 14;
  return 20;
}

function getParticlesPerPath(width) {
  return width < 1024 ? 1 : 2;
}

const cubicBezier = (start, controlOne, controlTwo, end, progress) => {
  const inverse = 1 - progress;
  return {
    x: (inverse ** 3) * start.x
      + 3 * (inverse ** 2) * progress * controlOne.x
      + 3 * inverse * (progress ** 2) * controlTwo.x
      + (progress ** 3) * end.x,
    y: (inverse ** 3) * start.y
      + 3 * (inverse ** 2) * progress * controlOne.y
      + 3 * inverse * (progress ** 2) * controlTwo.y
      + (progress ** 3) * end.y,
  };
};

export function HeroParticleNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest('[data-home-hero]');
    const context = canvas?.getContext('2d');
    if (!canvas || !hero || !context) return undefined;

    let width = 0;
    let height = 0;
    let devicePixelRatio = 1;
    let paths = [];
    let particles = [];
    let animationFrame;
    let resizeObserver;
    let intersectionObserver;
    let visible = true;
    let reducedMotion = false;
    const pointer = { x: null, y: null };
    const pointerTarget = { x: null, y: null };

    const getFocalPoints = () => {
      const stackedLayout = width < 1024;
      const centerX = width * (stackedLayout ? 0.5 : 0.585);
      const centerY = height * (stackedLayout ? 0.68 : 0.58);
      const spread = Math.min(width * (stackedLayout ? 0.06 : 0.012), stackedLayout ? 28 : 18);
      return [
        { x: centerX - spread, y: centerY },
        { x: centerX + spread, y: centerY },
      ];
    };

    const createNetwork = () => {
      const random = createRandom(Math.round(width * 17 + height * 31));
      const focalPoints = getFocalPoints();
      const pathCount = getPathCount(width);
      const particlesPerPath = getParticlesPerPath(width);
      const pathsPerSide = pathCount / 2;
      const overscan = Math.max(24, Math.min(width, height) * 0.06);
      const convergenceHeight = Math.min(height * 0.16, 110);
      const stackedLayout = width < 1024;

      paths = Array.from({ length: pathCount }, (_, index) => {
        const fromLeft = index % 2 === 0;
        const laneIndex = Math.floor(index / 2);
        const laneProgress = pathsPerSide > 1 ? laneIndex / (pathsPerSide - 1) : 0.5;
        const outerLane = laneIndex === 0 || laneIndex === pathsPerSide - 1;
        const focalPoint = fromLeft ? focalPoints[0] : focalPoints[1];
        const start = {
          x: fromLeft ? -overscan : width + overscan,
          y: height * (-0.025 + laneProgress * 1.05)
            + (outerLane ? 0 : (random() - 0.5) * height * 0.008),
        };

        const end = {
          x: focalPoint.x + (random() - 0.5) * Math.min(width * 0.008, 10),
          y: focalPoint.y
            + (laneProgress - 0.5) * convergenceHeight
            + (random() - 0.5) * Math.min(height * 0.012, 8),
        };
        const approachOffset = width * (stackedLayout ? 0.18 : 0.15);
        const controlOneX = fromLeft ? width * 0.2 : width * 0.8;
        const controlTwoX = fromLeft ? end.x - approachOffset : end.x + approachOffset;

        return {
          fromLeft,
          outerLane,
          start,
          controlOne: {
            x: controlOneX,
            y: start.y,
          },
          controlTwo: {
            x: controlTwoX,
            y: end.y + (start.y - end.y) * 0.12,
          },
          end,
          normal: { x: 0, y: 1 },
          phase: random() * Math.PI * 2,
          sway: 0.75 + random() * 1.25,
          accent: index % 7 === 0,
        };
      });

      particles = paths.flatMap((path, pathIndex) => Array.from({ length: particlesPerPath }, (_, particleIndex) => ({
        pathIndex,
        progress: (particleIndex / particlesPerPath + random() * 0.35) % 1,
        speed: 0.000065 + random() * 0.000045,
        radius: 1.2 + random() * 1.4,
        alpha: 0.34 + random() * 0.34,
        accent: path.accent || random() > 0.91,
      })));
    };

    const resize = () => {
      const bounds = hero.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      createNetwork();
    };

    const draw = (now) => {
      if (!width || !height) return;

      context.clearRect(0, 0, width, height);
      const focalPoints = getFocalPoints();
      const time = now * 0.001;

      paths.forEach((path) => {
        const sway = reducedMotion ? 0 : Math.sin(time * 0.26 + path.phase) * path.sway;
        const controlOne = {
          x: path.controlOne.x + path.normal.x * sway,
          y: path.controlOne.y + path.normal.y * sway,
        };
        const controlTwo = {
          x: path.controlTwo.x - path.normal.x * sway * 0.55,
          y: path.controlTwo.y - path.normal.y * sway * 0.55,
        };
        const lineGradient = context.createLinearGradient(
          path.start.x,
          path.start.y,
          path.end.x,
          path.end.y,
        );
        const sideBoost = path.fromLeft ? 1 : 1.28;
        const visibilityBoost = sideBoost * (path.outerLane ? 1.18 : 1);
        lineGradient.addColorStop(0, `rgba(${NETWORK_COLORS.cool.join(',')}, ${0.065 * visibilityBoost})`);
        lineGradient.addColorStop(0.7, `rgba(${NETWORK_COLORS.cool.join(',')}, ${0.14 * visibilityBoost})`);
        lineGradient.addColorStop(1, `rgba(${NETWORK_COLORS.cool.join(',')}, ${0.22 * visibilityBoost})`);
        context.strokeStyle = lineGradient;
        context.lineWidth = path.outerLane ? 0.95 : 0.85;
        context.beginPath();
        context.moveTo(path.start.x, path.start.y);
        context.bezierCurveTo(
          controlOne.x,
          controlOne.y,
          controlTwo.x,
          controlTwo.y,
          path.end.x,
          path.end.y,
        );
        context.stroke();
      });

      if (pointer.x !== null && pointer.y !== null && pointerTarget.x !== null && pointerTarget.y !== null) {
        pointer.x += (pointerTarget.x - pointer.x) * 0.12;
        pointer.y += (pointerTarget.y - pointer.y) * 0.12;
      }

      const positions = particles.map((particle) => {
        const path = paths[particle.pathIndex];
        if (!path) return null;
        const sway = reducedMotion ? 0 : Math.sin(time * 0.26 + path.phase) * path.sway;
        const progress = particle.progress;
        const point = cubicBezier(
          path.start,
          {
            x: path.controlOne.x + path.normal.x * sway,
            y: path.controlOne.y + path.normal.y * sway,
          },
          {
            x: path.controlTwo.x - path.normal.x * sway * 0.55,
            y: path.controlTwo.y - path.normal.y * sway * 0.55,
          },
          path.end,
          progress,
        );
        if (!reducedMotion) {
          const frameDelta = Math.min(MAX_FRAME_DELTA, Math.max(0, now - (particle.lastFrame ?? now)));
          particle.progress += particle.speed * frameDelta;
          particle.lastFrame = now;
          if (particle.progress > 1) particle.progress %= 1;
        }

        const edgeFade = Math.min(
          clamp(progress / 0.1, 0, 1),
          clamp((1 - progress) / 0.14, 0, 1),
        );
        const focusAmount = clamp((progress - 0.55) / 0.38, 0, 1);

        if (pointer.x !== null && pointer.y !== null && !reducedMotion) {
          const deltaX = pointer.x - point.x;
          const deltaY = pointer.y - point.y;
          const distance = Math.hypot(deltaX, deltaY);
          const influence = clamp(1 - distance / 220, 0, 1);
          point.x += deltaX * influence * 0.01;
          point.y += deltaY * influence * 0.01;
        }

        return {
          ...point,
          edgeFade,
          focusAmount,
          particle,
          visibilityBoost: path.fromLeft ? 1 : 1.16,
        };
      }).filter(Boolean);

      positions.forEach(({ x, y, edgeFade, focusAmount, particle, visibilityBoost }) => {
        const accentActive = particle.accent && focusAmount > 0.18;
        const color = accentActive ? NETWORK_COLORS.accent : NETWORK_COLORS.cool;
        const radius = accentActive ? particle.radius * 1.45 : particle.radius;
        const alpha = Math.min(0.9, particle.alpha * edgeFade * (0.72 + focusAmount * 0.32) * visibilityBoost);
        context.fillStyle = `rgba(${color.join(',')}, ${alpha})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();

        if (accentActive) {
          context.fillStyle = `rgba(${color.join(',')}, ${alpha * 0.26})`;
          context.beginPath();
          context.arc(x, y, radius * 3.8, 0, Math.PI * 2);
          context.fill();
        }
      });

      focalPoints.forEach((focalPoint, index) => {
        const pulse = reducedMotion ? 0.4 : 0.34 + Math.sin(time * 1.6 + index * Math.PI) * 0.08;
        context.fillStyle = `rgba(${NETWORK_COLORS.accent.join(',')}, ${pulse})`;
        context.beginPath();
        context.arc(focalPoint.x, focalPoint.y, 2.1, 0, Math.PI * 2);
        context.fill();
      });
    };

    const stopAnimation = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    };

    const render = (now) => {
      draw(now);
      if (!reducedMotion && visible) animationFrame = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      stopAnimation();
      if (!visible) return;
      particles.forEach((particle) => {
        particle.lastFrame = undefined;
      });
      if (reducedMotion) {
        draw(performance.now());
        return;
      }
      animationFrame = requestAnimationFrame(render);
    };

    const updatePointer = (event) => {
      const bounds = hero.getBoundingClientRect();
      pointerTarget.x = event.clientX - bounds.left;
      pointerTarget.y = event.clientY - bounds.top;
      if (pointer.x === null || pointer.y === null) {
        pointer.x = pointerTarget.x;
        pointer.y = pointerTarget.y;
      }
    };

    const clearPointer = () => {
      pointerTarget.x = null;
      pointerTarget.y = null;
      pointer.x = null;
      pointer.y = null;
    };

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileViewport = window.matchMedia('(max-width: 639px)');
    const updateMotionState = () => {
      reducedMotion = motionPreference.matches || mobileViewport.matches;
      startAnimation();
    };
    reducedMotion = motionPreference.matches || mobileViewport.matches;
    if (motionPreference.addEventListener) motionPreference.addEventListener('change', updateMotionState);
    else motionPreference.addListener?.(updateMotionState);
    if (mobileViewport.addEventListener) mobileViewport.addEventListener('change', updateMotionState);
    else mobileViewport.addListener?.(updateMotionState);

    resize();
    hero.addEventListener('pointermove', updatePointer, { passive: true });
    hero.addEventListener('pointerleave', clearPointer, { passive: true });

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(hero);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    if (typeof IntersectionObserver === 'function') {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) startAnimation();
        else stopAnimation();
      }, { rootMargin: '120px 0px' });
      intersectionObserver.observe(hero);
    }

    startAnimation();

    return () => {
      stopAnimation();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', resize);
      hero.removeEventListener('pointermove', updatePointer);
      hero.removeEventListener('pointerleave', clearPointer);
      if (motionPreference.removeEventListener) motionPreference.removeEventListener('change', updateMotionState);
      else motionPreference.removeListener?.(updateMotionState);
      if (mobileViewport.removeEventListener) mobileViewport.removeEventListener('change', updateMotionState);
      else mobileViewport.removeListener?.(updateMotionState);
      context.clearRect(0, 0, width, height);
    };
  }, []);

  return <canvas ref={canvasRef} data-home-hero-particles className="home-hero-particles pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
