## 2026-03-13 - [Scroll Event Rendering Isolation]
**Learning:** The entire Home page was re-rendering continuously on scroll because scrollY state was kept at the top level, recalculating heavy Map and ModelPreview components.
**Action:** Always isolate scroll-dependent state into the smallest possible component (e.g. ParallaxHero) and throttle state updates with requestAnimationFrame.
