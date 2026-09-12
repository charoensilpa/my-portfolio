// Writes a scroll position onto a node as a plain number in a CSS custom
// property. Two windows are available; both report 0 -> 1.
//
//   mode: 'through' (default)
//     0 when the node's top reaches the top of the viewport, 1 when its
//     bottom reaches the bottom. Use for a tall section you scroll THROUGH —
//     Selected Work's carousel is driven this way.
//
//   mode: 'exit'
//     0 when the node's bottom edge sits on the viewport bottom, 1 once that
//     edge has risen to the viewport top. Use for something LEAVING the
//     screen — the intro card row's handoff is driven this way.
//
// Like revealOnScroll.js, this knows nothing about what it's driving. It sets
// a number; the calling component's <style> block decides whether that number
// becomes a rotation, an opacity, or nothing at all. Easing belongs there too,
// not here — squaring the value in CSS is enough for most curves.
//
// Usage:
//   use:scrollProgress={{ property: '--p', max: projects.length - 1 }}
//   use:scrollProgress={{ property: '--exit', mode: 'exit' }}
//
// Why a CSS variable rather than Svelte state: this updates on every frame of
// every scroll. Writing one property on one element is far cheaper than
// putting a number through the component's reactivity and re-rendering.
export function scrollProgress(node, options = {}) {
	let { property = '--progress', max = 1, mode = 'through' } = options;

	// Reduced motion: park at 0 and never listen. Anything reading this value
	// therefore resolves to its resting state, so components must be written
	// so that 0 IS the resting state — not merely one end of a range.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		node.style.setProperty(property, '0');
		return { destroy() {} };
	}

	let frame = 0;

	function measure() {
		frame = 0;

		const rect = node.getBoundingClientRect();
		const viewport = window.innerHeight;
		let t = 0;

		if (mode === 'exit') {
			if (viewport > 0) t = (viewport - rect.bottom) / viewport;
		} else {
			// How far the node can scroll past the viewport before it's fully
			// gone. If the node is shorter than the viewport there's nothing to
			// travel through, so hold at 0 rather than dividing by zero.
			const travel = rect.height - viewport;
			if (travel > 0) t = -rect.top / travel;
		}

		t = Math.min(Math.max(t, 0), 1);
		node.style.setProperty(property, String(t * max));
	}

	// Scroll fires far more often than the screen redraws, so coalesce to one
	// measurement per frame.
	function schedule() {
		if (frame) return;
		frame = requestAnimationFrame(measure);
	}

	measure();

	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);

	return {
		// Svelte calls this when the options object changes — e.g. when the
		// project count changes and `max` along with it.
		update(next = {}) {
			if (next.property !== undefined) property = next.property;
			if (next.max !== undefined) max = next.max;
			if (next.mode !== undefined) mode = next.mode;
			measure();
		},
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		}
	};
}