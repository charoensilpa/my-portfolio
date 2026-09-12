/**
 * scratchReveal — a Svelte action for a <canvas>.
 *
 * The canvas is filled with an opaque colour, sitting on top of whatever you
 * want to hide. As the pointer moves, areas are *erased* out of that fill, so
 * the layer underneath shows through. Erased stays erased, which is what gives
 * you the permanent trail.
 *
 * Given a `grid`, the erasing snaps to that grid instead of using circles: a
 * character is either revealed or it isn't, so letters pop into existence one
 * at a time rather than fading in through a soft edge.
 *
 * Usage:
 *   <canvas use:scratchReveal={{ radius: 60, grid }}></canvas>
 *
 * Options:
 *   radius  — reveal radius in CSS pixels (default 60)
 *   color   — colour of the cover layer (default the page black)
 *   fade    — ms each character takes to arrive; 0 for an instant pop (default 220)
 *   grid    — { x, y, cellWidth, cellHeight, columns, rows }, or null for
 *             soft-edged circles
 */
export function scratchReveal(canvas, options = {}) {
	let { radius = 60, color = '#000000', fade = 220, grid = null } = options;

	const ctx = canvas.getContext('2d');

	let cssWidth = 0;
	let cssHeight = 0;
	let dpr = 1;
	let previous = null;
	let pending = null;
	let frame = 0;

	/** key → { rect, start, progress } for every cell that has been touched */
	const revealed = new Map();
	/** keys still fading in */
	const arriving = new Set();

	function gridSignature(value) {
		if (!value) return 'none';
		return [value.x, value.y, value.cellWidth, value.cellHeight, value.columns, value.rows]
			.map((n) => Math.round(n * 100))
			.join(':');
	}

	let signature = gridSignature(grid);

	/**
	 * Repaint the full cover, wiping any existing trail.
	 *
	 * This paints in raw buffer pixels rather than on-screen pixels. On a retina
	 * screen the buffer is twice the size of the canvas, so filling it with
	 * on-screen measurements would cover only a quarter of the area — and cover()
	 * is called from update() too, where the 2x scaling can't be assumed to still
	 * be in place.
	 */
	function cover() {
		revealed.clear();
		arriving.clear();
		previous = null;

		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalCompositeOperation = 'source-over';
		ctx.globalAlpha = 1;
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.restore();
	}

	/** Match the pixel buffer to the on-screen size and the screen density. */
	function resize() {
		const rect = canvas.getBoundingClientRect();
		if (!rect.width || !rect.height) return;

		// Can change mid-session by dragging the window to another monitor.
		dpr = window.devicePixelRatio || 1;
		cssWidth = rect.width;
		cssHeight = rect.height;

		const bufferWidth = Math.round(cssWidth * dpr);
		const bufferHeight = Math.round(cssHeight * dpr);

		// Assigning width/height clears the canvas, so only do it when it changed.
		if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
			canvas.width = bufferWidth;
			canvas.height = bufferHeight;
		}

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		cover();
	}

	function erase(rect, alpha) {
		ctx.globalCompositeOperation = 'destination-out';
		ctx.globalAlpha = alpha;
		ctx.fillStyle = '#000000';
		ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
		ctx.globalAlpha = 1;
	}

	/* Cell edges are rounded to whole pixels so neighbours butt up exactly:
	   no hairline gaps, no overlapping strips that would erase twice. */
	function cellRect(col, row) {
		const left = Math.round(grid.x + col * grid.cellWidth);
		const right = Math.round(grid.x + (col + 1) * grid.cellWidth);
		const top = Math.round(grid.y + row * grid.cellHeight);
		const bottom = Math.round(grid.y + (row + 1) * grid.cellHeight);
		return [left, top, right - left, bottom - top];
	}

	/* Distance from a point to the line the pointer just travelled. Measuring
	   against the whole segment rather than its endpoints means fast movement
	   still catches every character in between. */
	function distanceToSegment(px, py, from, to) {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const lengthSquared = dx * dx + dy * dy;
		let t = lengthSquared ? ((px - from.x) * dx + (py - from.y) * dy) / lengthSquared : 0;
		t = Math.max(0, Math.min(1, t));
		return Math.hypot(px - (from.x + t * dx), py - (from.y + t * dy));
	}

	function markCells(from, to) {
		const minX = Math.min(from.x, to.x) - radius;
		const maxX = Math.max(from.x, to.x) + radius;
		const minY = Math.min(from.y, to.y) - radius;
		const maxY = Math.max(from.y, to.y) + radius;

		const firstCol = Math.max(0, Math.floor((minX - grid.x) / grid.cellWidth));
		const lastCol = Math.min(grid.columns - 1, Math.floor((maxX - grid.x) / grid.cellWidth));
		const firstRow = Math.max(0, Math.floor((minY - grid.y) / grid.cellHeight));
		const lastRow = Math.min(grid.rows - 1, Math.floor((maxY - grid.y) / grid.cellHeight));

		const now = performance.now();

		for (let row = firstRow; row <= lastRow; row++) {
			for (let col = firstCol; col <= lastCol; col++) {
				const key = row * grid.columns + col;
				if (revealed.has(key)) continue;

				const centreX = grid.x + (col + 0.5) * grid.cellWidth;
				const centreY = grid.y + (row + 0.5) * grid.cellHeight;
				if (distanceToSegment(centreX, centreY, from, to) > radius) continue;

				revealed.set(key, { rect: cellRect(col, row), start: now, progress: 0 });
				arriving.add(key);
			}
		}
	}

	/** Fallback when there's no grid: a soft-edged circle. */
	function punchCircle(from, to) {
		const distance = Math.hypot(to.x - from.x, to.y - from.y);
		const steps = Math.max(1, Math.ceil(distance / (radius / 3)));

		ctx.globalCompositeOperation = 'destination-out';
		for (let i = 1; i <= steps; i++) {
			const x = from.x + ((to.x - from.x) * i) / steps;
			const y = from.y + ((to.y - from.y) * i) / steps;
			const gradient = ctx.createRadialGradient(x, y, radius * 0.65, x, y, radius);
			gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
			gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	/* Erasing is cumulative, so to move a cell from `progress` to `target` we
	   erase the share of what's left, not the target value itself. */
	function advanceArrivals() {
		const now = performance.now();

		for (const key of arriving) {
			const cell = revealed.get(key);
			const elapsed = fade > 0 ? Math.min(1, (now - cell.start) / fade) : 1;

			if (elapsed >= 1) {
				erase(cell.rect, 1);
				cell.progress = 1;
				arriving.delete(key);
				continue;
			}

			const target = 1 - (1 - elapsed) ** 3;
			const share = (target - cell.progress) / (1 - cell.progress);
			if (share > 0.002) {
				erase(cell.rect, Math.min(1, share));
				cell.progress = target;
			}
		}
	}

	function loop() {
		frame = 0;

		if (pending && cssWidth) {
			const rect = canvas.getBoundingClientRect();
			const point = { x: pending.x - rect.left, y: pending.y - rect.top };
			pending = null;

			const outside =
				point.x < -radius ||
				point.y < -radius ||
				point.x > cssWidth + radius ||
				point.y > cssHeight + radius;

			if (outside) {
				previous = null;
			} else {
				const from = previous ?? point;
				if (grid) markCells(from, point);
				else punchCircle(from, point);
				previous = point;
			}
		}

		advanceArrivals();

		if (pending || arriving.size) frame = requestAnimationFrame(loop);
	}

	function schedule() {
		if (!frame) frame = requestAnimationFrame(loop);
	}

	/* Listening on the window rather than the canvas means the reveal keeps
	   working over the headline sitting on top of it. */
	function onPointerMove(event) {
		pending = { x: event.clientX, y: event.clientY };
		schedule();
	}

	/** A new stroke shouldn't be joined to wherever the pointer was last seen. */
	function onBreak() {
		previous = null;
	}

	const observer = new ResizeObserver(resize);
	observer.observe(canvas);

	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerdown', onBreak, { passive: true });
	window.addEventListener('blur', onBreak);
	// Catches a change of screen density, which ResizeObserver won't report.
	window.addEventListener('resize', resize);
	resize();

	return {
		update(next = {}) {
			radius = next.radius ?? radius;
			color = next.color ?? color;
			fade = next.fade ?? fade;

			const nextSignature = gridSignature(next.grid ?? null);
			if (nextSignature !== signature) {
				// The character grid moved or resized, so the old trail no longer
				// lines up with the letters. Start clean.
				grid = next.grid ?? null;
				signature = nextSignature;
				if (cssWidth) cover();
				else resize(); // first run, before the canvas had been measured
			}
		},
		destroy() {
			observer.disconnect();
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerdown', onBreak);
			window.removeEventListener('blur', onBreak);
			window.removeEventListener('resize', resize);
			if (frame) cancelAnimationFrame(frame);
		}
	};
}