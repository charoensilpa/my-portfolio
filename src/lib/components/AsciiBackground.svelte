<script>
	import { scratchReveal } from '$lib/actions/scratchReveal.js';

	let { text = '', radius = 60, opacity = 0.2, fade = 220 } = $props();

	const LINE_HEIGHT = 1.1; // must match the `line-height` on <pre> below

	const lines = $derived(text.split('\n'));
	const columns = $derived(lines.reduce((widest, line) => Math.max(widest, line.length), 1));
	const rows = $derived(lines.length);

	/* Width of one character, in ems. Monospace fonts are usually 0.5, but the
	   grid has to line up with the glyphs across hundreds of columns, so this
	   gets measured against the real font rather than assumed. */
	let advance = $state(0.5);

	let container = $state(null);
	let pre = $state(null);
	let width = $state(0);
	let height = $state(0);

	// The font size that makes the art span the full width of the section.
	const fontSize = $derived(width ? width / (columns * advance) : 0);

	let grid = $state(null);

	$effect(() => {
		let cancelled = false;
		const probe = document.createElement('canvas').getContext('2d');

		const measureAdvance = () => {
			probe.font = '100px Inconsolata, ui-monospace, monospace';
			const sample = 'M'.repeat(50);
			const measured = probe.measureText(sample).width / 50 / 100;
			if (!cancelled && measured > 0) advance = measured;
		};

		measureAdvance();
		// Re-measure once the webfont has actually loaded.
		document.fonts?.ready.then(() => !cancelled && measureAdvance());

		return () => (cancelled = true);
	});

	$effect(() => {
		// Re-run whenever anything that moves the text changes.
		void [fontSize, advance, columns, rows, width, height];
		if (!container || !pre || !fontSize) return;

		const outer = container.getBoundingClientRect();
		const inner = pre.getBoundingClientRect();

		grid = {
			x: inner.left - outer.left,
			y: inner.top - outer.top,
			cellWidth: fontSize * advance,
			cellHeight: fontSize * LINE_HEIGHT,
			columns,
			rows
		};
	});
</script>

<div
	class="ascii"
	bind:this={container}
	bind:clientWidth={width}
	bind:clientHeight={height}
	aria-hidden="true"
>
	<pre bind:this={pre} style="font-size: {fontSize}px; opacity: {opacity};">{text}</pre>
	<canvas use:scratchReveal={{ radius, fade, grid }}></canvas>
</div>

<style>
	.ascii {
		position: absolute;
		inset: 0;
		overflow: hidden;
		display: grid;
		place-items: center;
		/* the reveal listens on the window, so this layer never needs to
		   intercept clicks meant for links or headings above it */
		pointer-events: none;
	}

	pre {
		margin: 0;
		font-family: var(--font-mono);
		line-height: 1.1;
		color: var(--c-cream);
		white-space: pre;
	}

	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}
</style>