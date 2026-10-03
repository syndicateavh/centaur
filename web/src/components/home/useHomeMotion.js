import { useEffect } from 'react';
import { scheduleAfterPaint } from './motionUtils.js';

function restoreHomeMotionStyles(homeElement) {
  if (!homeElement) return;

  const animatedElements = homeElement.querySelectorAll([
    '.home-hero-grid',
    '[data-home-hero-particles]',
    '[data-home-hero-glow]',
    '[data-home-hero-orbit]',
    '[data-home-hero-reveal]',
    '.home-hero-flow-item',
    '.home-hero-flow-line',
    '.home-hero-flow-index',
    '.home-hero-flow-border',
    '.home-hero-flow-border rect',
    '.home-hero-flow-arrow',
    '[data-home-process-step]',
    '[data-home-process-media]',
    '[data-home-image-reveal] img',
    '[data-home-final-cta-media]',
  ].join(','));

  animatedElements.forEach((element) => {
    [
      'opacity',
      'visibility',
      'transform',
      'translate',
      'rotate',
      'scale',
      'transform-origin',
      'stroke-dashoffset',
      'top',
      'background-position',
      'will-change',
    ].forEach((property) => element.style.removeProperty(property));
  });

  const processSection = homeElement.querySelector('[data-home-process-scroll]');
  if (processSection) {
    delete processSection.dataset.homeProcessEnhanced;
    processSection.querySelectorAll('[data-home-process-progress-item]').forEach((item, index) => {
      item.dataset.state = index === 0 ? 'active' : 'upcoming';
      if (index === 0) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }
}

export function useHomeMotion(homeRef) {
  useEffect(() => {
    let cancelled = false;
    let stopMotion = () => {};

    const loadMotion = async () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (cancelled || !homeRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const media = gsap.matchMedia();
      media.add(
        {
          desktop: '(min-width: 960px)',
          finePointer: '(hover: hover) and (pointer: fine)',
          reducedMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, finePointer, reducedMotion } = context.conditions;
          if (reducedMotion) return undefined;

          const homeElement = homeRef.current;
          if (!homeElement) return undefined;

          const hero = homeElement.querySelector('[data-home-hero]');
          const heroGrid = hero?.querySelector('.home-hero-grid');
          const heroParticles = hero?.querySelector('[data-home-hero-particles]');
          const heroGlow = hero?.querySelector('[data-home-hero-glow]');
          const heroOrbit = hero?.querySelector('[data-home-hero-orbit]');
          const heroPanel = hero?.querySelector('[data-home-hero-panel]');
          const heroItems = homeElement.querySelectorAll('[data-home-hero-reveal]:not([data-home-hero-panel]):not([data-home-lcp])');
          const heroDetails = Array.from(hero?.querySelectorAll('[data-home-hero-detail]:not([data-home-hero-flow-item])') ?? [])
            .filter((detail) => !detail.closest('.home-hero-support'));
          const heroFlowItems = hero?.querySelectorAll('[data-home-hero-flow-item]') ?? [];
          const heroFlowLines = hero?.querySelectorAll('[data-home-hero-flow-line]') ?? [];
          const heroFlowIndexes = hero?.querySelectorAll('[data-home-hero-flow-item] .home-hero-flow-index') ?? [];
          const heroFlowBorders = hero?.querySelectorAll('.home-hero-flow-border') ?? [];
          const heroFlowBorderRects = hero?.querySelectorAll('.home-hero-flow-border rect') ?? [];
          const heroFlowArrows = hero?.querySelectorAll('.home-hero-flow-arrow') ?? [];
          const setHeroFlowState = (activeIndex) => {
            heroFlowItems.forEach((flowItem, itemIndex) => {
              flowItem.dataset.state = itemIndex === activeIndex
                ? 'active'
                : itemIndex < activeIndex ? 'complete' : 'upcoming';

              if (itemIndex === activeIndex) flowItem.setAttribute('aria-current', 'step');
              else flowItem.removeAttribute('aria-current');
            });

            heroFlowLines.forEach((flowLine, lineIndex) => {
              flowLine.dataset.state = lineIndex < activeIndex
                ? 'complete'
                : lineIndex === activeIndex ? 'active' : 'upcoming';
            });
          };

          if (heroFlowItems.length) setHeroFlowState(0);

          const sectionCleanups = [];
          const heroTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
          heroTimeline
            .fromTo(heroGrid, { opacity: 0.08, scale: 1.08 }, { opacity: 0.4, scale: 1, duration: 1.2, ease: 'power2.out' }, 0)
            .fromTo(heroParticles, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: desktop ? 0.74 : 0.56, scale: 1, duration: 1.5, ease: 'power2.out' }, 0.05)
            .fromTo(heroGlow, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 0.7, scale: 1, duration: 1.3, ease: 'power3.out' }, 0)
            .fromTo(heroOrbit, { autoAlpha: 0, scale: 0.65, rotation: -18 }, { autoAlpha: 0.65, scale: 1, rotation: 0, duration: 1.1, ease: 'power2.out' }, 0.08)
            .from(heroItems, {
              duration: 0.55,
              stagger: 0.1,
              autoAlpha: 0,
              y: desktop ? 24 : 14,
            }, 0.18)
            .fromTo(heroPanel, { autoAlpha: 0, y: 32, scale: 0.96, rotationX: 3 }, { autoAlpha: 1, y: 0, scale: 1, rotationX: 0, duration: 0.8, ease: 'power3.out' }, 0.35)
            .from(heroDetails, { autoAlpha: 0, y: 12, duration: 0.4, stagger: 0.08 }, 0.78);

          let heroFlowLoop;
          if (desktop && heroFlowItems.length > 1) {
            const flowBorderDuration = 3.8;
            const flowArrowDuration = 1.25;
            const flowStepPause = 0.3;
            heroFlowLoop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.7 });

            const resetHeroFlowVisuals = () => {
              gsap.set(heroFlowBorders, { autoAlpha: 0 });
              gsap.set(heroFlowBorderRects, { strokeDashoffset: 0 });
              gsap.set(heroFlowArrows, { autoAlpha: 0, top: '0%' });
            };

            heroFlowItems.forEach((_, index) => {
              const flowBorder = heroFlowBorders[index];
              const flowBorderRect = heroFlowBorderRects[index];
              const flowArrow = heroFlowArrows[index];

              heroFlowLoop.call(() => {
                resetHeroFlowVisuals();
                setHeroFlowState(index);
                if (flowBorder) gsap.set(flowBorder, { autoAlpha: 1 });
              });

              if (flowBorderRect) {
                heroFlowLoop.to(flowBorderRect, {
                  strokeDashoffset: -100,
                  duration: flowBorderDuration,
                  ease: 'none',
                });
                if (flowBorder) {
                  heroFlowLoop.to(flowBorder, {
                    autoAlpha: 0,
                    duration: 0.2,
                    ease: 'power1.out',
                  }, `>-0.2`);
                }
              } else {
                heroFlowLoop.to({}, { duration: flowBorderDuration });
              }

              if (flowArrow) {
                heroFlowLoop.to(flowArrow, {
                  autoAlpha: 1,
                  top: '100%',
                  duration: flowArrowDuration,
                  ease: 'power1.inOut',
                });
                heroFlowLoop.to(flowArrow, {
                  autoAlpha: 0,
                  duration: 0.12,
                  ease: 'power1.out',
                }, '>-0.12');
              } else {
                heroFlowLoop.to({}, { duration: flowArrowDuration });
              }

              heroFlowLoop.to({}, { duration: flowStepPause });
            });

            heroTimeline.eventCallback('onComplete', () => {
              if (!cancelled) heroFlowLoop.restart(true);
            });

            sectionCleanups.push(() => {
              heroFlowLoop.kill();
              setHeroFlowState(0);
            });
          }

          if (heroGrid) {
            const gridDrift = gsap.to(heroGrid, {
              backgroundPosition: '52px 52px',
              duration: 18,
              repeat: -1,
              ease: 'none',
            });
            sectionCleanups.push(() => gridDrift.kill());
          }

          if (heroGlow) {
            const glowPulse = gsap.to(heroGlow, {
              scale: 1.08,
              opacity: 0.55,
              duration: 5,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            });
            sectionCleanups.push(() => glowPulse.kill());
          }

          if (heroOrbit) {
            const orbitSpin = gsap.to(heroOrbit, {
              rotation: 360,
              duration: 38,
              repeat: -1,
              ease: 'none',
            });
            sectionCleanups.push(() => orbitSpin.kill());
          }

          if (heroPanel) {
            const panelFloat = gsap.to(heroPanel, {
              rotation: 0.22,
              duration: 4.5,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: 1.3,
            });
            sectionCleanups.push(() => panelFloat.kill());
          }

          if (hero) {
            const heroScrollTimeline = gsap.timeline({
              scrollTrigger: {
                id: 'home-hero-depth',
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.6,
              },
            });

            if (heroGrid) heroScrollTimeline.to(heroGrid, { yPercent: 14, ease: 'none' }, 0);
            if (heroParticles) heroScrollTimeline.to(heroParticles, { yPercent: 11, ease: 'none' }, 0);
            if (heroGlow) heroScrollTimeline.to(heroGlow, { yPercent: 18, ease: 'none' }, 0);
            if (heroPanel) heroScrollTimeline.to(heroPanel, { yPercent: -4, ease: 'none' }, 0);

            sectionCleanups.push(() => {
              heroScrollTimeline.scrollTrigger?.kill();
              heroScrollTimeline.kill();
            });
          }

          let revealObserver;

          const processSection = homeElement.querySelector('[data-home-process-scroll]');
          const processPin = processSection?.querySelector('[data-home-process-pin]');
          const processViewport = processSection?.querySelector('[data-home-process-viewport]');
          const processTrack = processSection?.querySelector('[data-home-process-track]');
          const processSteps = processSection
            ? Array.from(processSection.querySelectorAll('[data-home-process-step]'))
            : [];
          const processProgressItems = processSection
            ? Array.from(processSection.querySelectorAll('[data-home-process-progress-item]'))
            : [];
          const processStepMedia = processSteps.map((step) => (
            step.querySelector('[data-home-process-media]')
          ));

          if (desktop && processPin && processViewport && processTrack && processSteps.length > 1) {
            const stickyHeader = document.querySelector('[data-site-header]');
            const getStickyHeaderHeight = () => Math.round(stickyHeader?.getBoundingClientRect().height ?? 0);
            const getProcessScrollDistance = () => (
              Math.max(window.innerHeight * 0.72, 520) * (processSteps.length - 1)
            );
            const setActiveProcessStep = (progress = 0) => {
              const activeIndex = Math.min(
                processSteps.length - 1,
                Math.max(0, Math.round(progress * (processSteps.length - 1))),
              );

              processProgressItems.forEach((item, index) => {
                item.dataset.state = index < activeIndex
                  ? 'complete'
                  : index === activeIndex ? 'active' : 'upcoming';

                if (index === activeIndex) item.setAttribute('aria-current', 'step');
                else item.removeAttribute('aria-current');
              });
            };

            processSection.dataset.homeProcessEnhanced = 'true';
            gsap.set(processSteps, { opacity: 0, y: 64, scale: 0.985, zIndex: 0 });
            gsap.set(processSteps[0], { opacity: 1, y: 0, scale: 1, zIndex: 1 });
            setActiveProcessStep(0);

            if (processStepMedia[0]) {
              const firstProcessMediaReveal = gsap.fromTo(processStepMedia[0], {
                autoAlpha: 0,
                y: 12,
                scale: 1.025,
              }, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: processViewport,
                  start: 'top 84%',
                  once: true,
                },
              });

              sectionCleanups.push(() => {
                firstProcessMediaReveal.scrollTrigger?.kill();
                firstProcessMediaReveal.kill();
              });
            }

            const processTimeline = gsap.timeline({
              scrollTrigger: {
                id: 'home-process-vertical-scroll',
                trigger: processPin,
                pin: processPin,
                pinSpacing: true,
                start: () => `top top+=${getStickyHeaderHeight()}`,
                end: () => `+=${getProcessScrollDistance()}`,
                scrub: 0.7,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => setActiveProcessStep(self.progress),
                onRefresh: (self) => setActiveProcessStep(self.progress),
              },
            });

            processTimeline.addLabel('process-step-1', 0);
            processSteps.slice(1).forEach((step, index) => {
              const previousStep = processSteps[index];
              const nextMedia = processStepMedia[index + 1];
              const transitionStart = index;

              processTimeline
                .to(previousStep, {
                  duration: 0.55,
                  ease: 'power1.inOut',
                  opacity: 0,
                  y: -48,
                  scale: 0.985,
                }, transitionStart)
                .fromTo(step, {
                  opacity: 0,
                  y: 64,
                  scale: 0.985,
                  zIndex: index + 2,
                }, {
                  duration: 0.65,
                  ease: 'power1.inOut',
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  zIndex: index + 2,
                }, transitionStart + 0.2);

              if (nextMedia) {
                processTimeline.fromTo(nextMedia, {
                  autoAlpha: 0,
                  y: 12,
                  scale: 1.025,
                }, {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.52,
                  ease: 'power2.out',
                }, transitionStart + 0.28);
              }

              processTimeline.addLabel(`process-step-${index + 2}`, transitionStart + 0.65);
            });

            sectionCleanups.push(() => {
              processTimeline.scrollTrigger?.kill();
              processTimeline.kill();
              gsap.set(processSteps, { clearProps: 'opacity,transform,zIndex,willChange' });
              gsap.set(processStepMedia.filter(Boolean), { clearProps: 'opacity,visibility,transform' });
              processProgressItems.forEach((item, index) => {
                item.dataset.state = index === 0 ? 'active' : 'upcoming';
                if (index === 0) item.setAttribute('aria-current', 'step');
                else item.removeAttribute('aria-current');
              });
              delete processSection.dataset.homeProcessEnhanced;
            });
          } else {
            processStepMedia.filter(Boolean).forEach((mediaElement) => {
              const mediaReveal = gsap.fromTo(mediaElement, {
                autoAlpha: 0,
                y: 12,
              }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.58,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: mediaElement,
                  start: 'top 88%',
                  once: true,
                },
              });

              sectionCleanups.push(() => {
                mediaReveal.scrollTrigger?.kill();
                mediaReveal.kill();
                gsap.set(mediaElement, { clearProps: 'opacity,visibility,transform' });
              });
            });
          }

          const editorialImages = Array.from(homeElement.querySelectorAll('[data-home-image-reveal] img'));
          editorialImages.forEach((image) => {
            const imageReveal = gsap.fromTo(image, {
              scale: 1.045,
            }, {
              scale: 1,
              duration: 1.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: image.closest('[data-home-image-reveal]'),
                start: 'top 86%',
                once: true,
              },
            });

            sectionCleanups.push(() => {
              imageReveal.scrollTrigger?.kill();
              imageReveal.kill();
              gsap.set(image, { clearProps: 'transform' });
            });
          });

          const finalCta = homeElement.querySelector('[data-home-section="final-cta"]');
          const finalCtaMedia = finalCta?.querySelector('[data-home-final-cta-media]');
          if (desktop && finalCta && finalCtaMedia) {
            const finalCtaDepth = gsap.fromTo(finalCtaMedia, {
              yPercent: -3,
              scale: 1.06,
            }, {
              yPercent: 3,
              scale: 1.02,
              ease: 'none',
              scrollTrigger: {
                trigger: finalCta,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            });

            sectionCleanups.push(() => {
              finalCtaDepth.scrollTrigger?.kill();
              finalCtaDepth.kill();
              gsap.set(finalCtaMedia, { clearProps: 'transform' });
            });
          }

          const revealContainer = (container) => {
            if (container.dataset.homeContainerMotionInitialized === 'true') return;

            container.dataset.homeContainerMotionInitialized = 'true';
            const animation = gsap.from(container, {
              duration: 0.58,
              ease: 'power2.out',
              autoAlpha: 0,
              y: 24,
              clearProps: 'opacity,visibility,transform',
              scrollTrigger: {
                trigger: container,
                start: 'top 86%',
                once: true,
              },
            });

            sectionCleanups.push(() => {
              animation.scrollTrigger?.kill();
              animation.kill();
              gsap.set(container, { clearProps: 'opacity,visibility,transform' });
              delete container.dataset.homeContainerMotionInitialized;
            });
          };

          const revealGroup = (group) => {
            if (group.dataset.homeMotionInitialized === 'true') return;

            const cards = group.querySelectorAll('[data-home-reveal]');
            if (!cards.length) return;

            group.dataset.homeMotionInitialized = 'true';
            const animation = gsap.from(cards, {
              duration: 0.5,
              ease: 'power2.out',
              stagger: desktop ? 0.08 : 0.05,
              autoAlpha: 0,
              y: desktop ? 20 : 12,
              clearProps: 'opacity,visibility,transform',
              scrollTrigger: {
                trigger: group,
                start: 'top 82%',
                once: true,
              },
            });

            sectionCleanups.push(() => {
              animation.scrollTrigger?.kill();
              animation.kill();
              gsap.set(cards, { clearProps: 'opacity,visibility,transform' });
              delete group.dataset.homeMotionInitialized;
            });
          };

          const revealContainers = Array.from(homeElement.querySelectorAll('[data-home-reveal-container]'))
            .filter((container) => !container.matches('[data-home-process-scroll]'));
          const revealGroups = Array.from(homeElement.querySelectorAll('[data-home-reveal-group]'));
          const standaloneRevealGroups = revealGroups.filter((group) => (
            !group.closest('[data-home-reveal-container]')
            && !group.closest('[data-home-process-scroll]')
          ));
          const revealTargets = [...revealContainers, ...standaloneRevealGroups];

          const revealTarget = (target) => {
            if (target.matches('[data-home-reveal-container]')) {
              revealContainer(target);
              target.querySelectorAll('[data-home-reveal-group]').forEach(revealGroup);
              return;
            }

            revealGroup(target);
          };

          if (typeof window.IntersectionObserver === 'function') {
            revealObserver = new window.IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (!entry.isIntersecting) return;
                  revealTarget(entry.target);
                  revealObserver.unobserve(entry.target);
                });
              },
              { rootMargin: '240px 0px' },
            );
            revealTargets.forEach((target) => revealObserver.observe(target));
          } else {
            revealTargets.forEach(revealTarget);
          }

          const cleanups = [
            () => revealObserver?.disconnect(),
            () => sectionCleanups.forEach((cleanup) => cleanup()),
          ];

          if (finePointer) {
            if (hero) {
              if (heroPanel) gsap.set(heroPanel, { transformPerspective: 900, transformOrigin: 'center center' });
              const panelRotateXTo = heroPanel ? gsap.quickTo(heroPanel, 'rotationX', { duration: 0.55, ease: 'power3.out' }) : null;
              const panelRotateYTo = heroPanel ? gsap.quickTo(heroPanel, 'rotationY', { duration: 0.55, ease: 'power3.out' }) : null;
              const panelXTo = heroPanel ? gsap.quickTo(heroPanel, 'x', { duration: 0.65, ease: 'power3.out' }) : null;
              const panelYTo = heroPanel ? gsap.quickTo(heroPanel, 'y', { duration: 0.65, ease: 'power3.out' }) : null;
              const gridXTo = heroGrid ? gsap.quickTo(heroGrid, 'x', { duration: 0.9, ease: 'power3.out' }) : null;
              const gridYTo = heroGrid ? gsap.quickTo(heroGrid, 'y', { duration: 0.9, ease: 'power3.out' }) : null;
              const particlesXTo = heroParticles ? gsap.quickTo(heroParticles, 'x', { duration: 1, ease: 'power3.out' }) : null;
              const particlesYTo = heroParticles ? gsap.quickTo(heroParticles, 'y', { duration: 1, ease: 'power3.out' }) : null;
              const glowXTo = heroGlow ? gsap.quickTo(heroGlow, 'x', { duration: 1.1, ease: 'power3.out' }) : null;
              const glowYTo = heroGlow ? gsap.quickTo(heroGlow, 'y', { duration: 1.1, ease: 'power3.out' }) : null;

              const resetHeroPointer = () => {
                panelRotateXTo?.(0);
                panelRotateYTo?.(0);
                panelXTo?.(0);
                panelYTo?.(0);
                gridXTo?.(0);
                gridYTo?.(0);
                particlesXTo?.(0);
                particlesYTo?.(0);
                glowXTo?.(0);
                glowYTo?.(0);
              };

              const onHeroPointerMove = (event) => {
                const bounds = hero.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
                const y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
                panelRotateXTo?.(y * -2.5);
                panelRotateYTo?.(x * 3);
                panelXTo?.(x * 4);
                panelYTo?.(y * 4);
                gridXTo?.(x * 12);
                gridYTo?.(y * 8);
                particlesXTo?.(x * 9);
                particlesYTo?.(y * 6);
                glowXTo?.(x * 28);
                glowYTo?.(y * 22);
              };

              hero.addEventListener('pointermove', onHeroPointerMove);
              hero.addEventListener('pointerleave', resetHeroPointer);
              cleanups.push(() => {
                hero.removeEventListener('pointermove', onHeroPointerMove);
                hero.removeEventListener('pointerleave', resetHeroPointer);
                resetHeroPointer();
              });
            }

            const magneticButtons = homeElement.querySelectorAll('[data-home-magnetic]');
            magneticButtons.forEach((button) => {
              const xTo = gsap.quickTo(button, 'x', { duration: 0.32, ease: 'power3.out' });
              const yTo = gsap.quickTo(button, 'y', { duration: 0.32, ease: 'power3.out' });
              const onButtonPointerMove = (event) => {
                const bounds = button.getBoundingClientRect();
                xTo((event.clientX - bounds.left - bounds.width / 2) * 0.13);
                yTo((event.clientY - bounds.top - bounds.height / 2) * 0.18);
              };
              const onButtonPointerLeave = () => {
                xTo(0);
                yTo(0);
              };
              button.addEventListener('pointermove', onButtonPointerMove);
              button.addEventListener('pointerleave', onButtonPointerLeave);
              cleanups.push(() => {
                button.removeEventListener('pointermove', onButtonPointerMove);
                button.removeEventListener('pointerleave', onButtonPointerLeave);
              });
            });
          }

          return () => {
            cleanups.forEach((cleanup) => cleanup());
            heroTimeline.kill();
            gsap.set(heroItems, { clearProps: 'transform,opacity,visibility' });
            gsap.set([
              heroPanel,
              heroGrid,
              heroParticles,
              heroGlow,
              heroOrbit,
              ...heroDetails,
              ...heroFlowItems,
              ...heroFlowLines,
              ...heroFlowIndexes,
              ...heroFlowBorders,
              ...heroFlowBorderRects,
              ...heroFlowArrows,
            ].filter(Boolean), { clearProps: 'strokeDashoffset,top,transform,opacity,visibility,transformOrigin' });
            if (heroGrid) gsap.set(heroGrid, { clearProps: 'backgroundPosition' });
          };
        },
      );

      stopMotion = () => media.revert();
    };

    const cancelScheduledLoad = scheduleAfterPaint(() => {
      loadMotion().catch(() => {
        // Motion is optional. If an enhancement fails after applying an
        // initial state, restore the normal visible page instead of leaving
        // process steps or hero content hidden.
        restoreHomeMotionStyles(homeRef.current);
      });
    });

    return () => {
      cancelled = true;
      cancelScheduledLoad();
      stopMotion();
    };
  }, [homeRef]);
}
