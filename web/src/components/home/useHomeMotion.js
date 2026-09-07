import { useEffect } from 'react';
import { scheduleAfterPaint } from './motionUtils.js';

export function useHomeMotion(homeRef) {
  useEffect(() => {
    let cancelled = false;
    let stopMotion = () => {};

    const loadMotion = async () => {
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

          const heroItems = homeElement.querySelectorAll('[data-home-hero-reveal]');
          const heroTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
          heroTimeline.from(heroItems, {
            duration: 0.48,
            stagger: 0.09,
            y: desktop ? 18 : 12,
          });

          const sectionCleanups = [];
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

          if (desktop && processPin && processViewport && processTrack && processSteps.length > 1) {
            const stickyHeader = document.querySelector('header.sticky');
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
                }, transitionStart + 0.2)
                .addLabel(`process-step-${index + 2}`, transitionStart + 0.65);
            });

            sectionCleanups.push(() => {
              processTimeline.scrollTrigger?.kill();
              processTimeline.kill();
              gsap.set(processSteps, { clearProps: 'opacity,transform,zIndex,willChange' });
              processProgressItems.forEach((item, index) => {
                item.dataset.state = index === 0 ? 'active' : 'upcoming';
                if (index === 0) item.setAttribute('aria-current', 'step');
                else item.removeAttribute('aria-current');
              });
              delete processSection.dataset.homeProcessEnhanced;
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
          };
        },
      );

      stopMotion = () => media.revert();
    };

    const cancelScheduledLoad = scheduleAfterPaint(() => {
      loadMotion().catch(() => {
        // Motion is optional. The page remains fully usable if the enhancement fails.
      });
    });

    return () => {
      cancelled = true;
      cancelScheduledLoad();
      stopMotion();
    };
  }, [homeRef]);
}
