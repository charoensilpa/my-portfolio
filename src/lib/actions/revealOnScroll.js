// Adds an `is-visible` class to the node the first time it scrolls into view,
// then stops watching. Knows nothing about what the node looks like or what's
// inside it — the calling component's <style> block decides what "reveal"
// means (fade, rise, etc.) by styling the default state and the .is-visible
// state. That keeps this action reusable for any future section.
export function revealOnScroll(node, options = {}) {
	const { threshold = 0.2, rootMargin = '0px 0px -10% 0px' } = options;

	// Respect prefers-reduced-motion by skipping straight to the visible
	// state — no observer, no transition to trigger.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		node.classList.add('is-visible');
		return { destroy() {} };
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}