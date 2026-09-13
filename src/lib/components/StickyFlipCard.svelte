<script>
	let { src = '', alt = '' } = $props();

	let layer = $state(null);
	let sticky = $state(null);

	let scrollY = $state(0);
	let viewportHeight = $state(0);
	let reduceMotion = $state(false);

	/* The scroll position at which the card runs out of room and settles onto
	   the ring. Measured rather than hard-coded, so the flip always finishes
	   exactly as the card arrives — however much you change the spacing above
	   it. --tail in +page.svelte is what stops the layer short of the ring's
	   scroll travel; without it the card would ride all the way down. */
	let lockScroll = $state(0);

	/* Where in the descent the card starts giving way to the ring. 0.78 leaves
	   the last fifth of the travel for the handover, which is long enough to
	   read as receding and short enough not to look like a bug. */
	const HANDOVER_START = 0.5;

	/* How far back it sinks, in px. Negative is away from the viewer. Roughly
	   the ring's radius, so it comes to rest around the far side. */
	const SINK_DEPTH = -320;

	function measure() {
		if (!layer || !sticky) return;
		const offset = parseFloat(getComputedStyle(sticky).top) || 0;
		const layerBottom = layer.getBoundingClientRect().bottom + window.scrollY;
		lockScroll = Math.max(0, layerBottom - offset - sticky.offsetHeight);
	}

	$effect(() => {
		// Re-measure whenever the viewport height changes, since the card's
		// sticky offset is expressed in vh.
		viewportHeight;
		measure();
	});

	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = query.matches;
		const onChange = (event) => (reduceMotion = event.matches);
		query.addEventListener('change', onChange);

		// Catches images loading, fonts swapping, anything that shifts the page.
		const observer = new ResizeObserver(measure);
		observer.observe(document.body);

		return () => {
			query.removeEventListener('change', onChange);
			observer.disconnect();
		};
	});

	// One source for the descent, so the flip and the handover can never
	// disagree about how far down the card is.
	const progress = $derived.by(() => {
		if (reduceMotion || !lockScroll) return 0;
		return Math.min(1, Math.max(0, scrollY / lockScroll));
	});

	// 0 → 180 degrees across the descent, eased so the turn has weight.
	const rotation = $derived.by(() => {
		if (reduceMotion) return 0;
		const p = progress;
		const eased = p < 0.5 ? 2 * p ** 2 : 1 - (-2 * p + 2) ** 2 / 2;
		return eased * 180;
	});

	// 0 until the handover, then 0 → 1. The card sinks back and fades out over
	// the ring's front face, so it reads as slipping into the stack rather
	// than switching off.
	const handover = $derived.by(() => {
		if (reduceMotion) return 0;
		if (progress <= HANDOVER_START) return 0;
		return (progress - HANDOVER_START) / (1 - HANDOVER_START);
	});
</script>

<svelte:window bind:scrollY bind:innerHeight={viewportHeight} />

<!-- A sticky element can't leave its container, so where this layer ends is
     what stops the card. See --tail in +page.svelte. -->
<div class="layer" bind:this={layer}>
	<!-- The angles go to CSS as variables rather than into an inline
	     `transform`, because two separate transforms have to compose and an
	     inline one would win outright. See .inner below. -->
	<div
		class="sticky"
		bind:this={sticky}
		style="--flip: {rotation}deg; --sink: {(handover * SINK_DEPTH).toFixed(1)}px; --handover: {handover.toFixed(4)};"
	>
		<div class="inner">
			<div class="face front">
				{#if src}
					<img {src} {alt} />
				{/if}
			</div>
			<div class="face back stripe">back</div>
		</div>
	</div>
</div>

<style>
	.layer {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: var(--tail);
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.sticky {
		position: sticky;
		top: var(--card-top);
		/* Own size now — --flip-card-w/-h in global.css, decoupled from the
		   hero's --card-w/--card-h. Change --flip-card-w there to resize
		   just this card. */
		width: var(--flip-card-w);
		height: var(--flip-card-h);
		/* Shared with the ring's stage, so this card and the faces it sinks
		   into foreshorten identically. */
		perspective: var(--intro-perspective);
		/* Position only, deliberately still on --card-w (NOT --flip-card-w):
		   this places the card at "slot 2" of the hero's virtual row, which
		   is a hero-layout concept, not this card's own size. For a centred
		   row of N cards, slot 2's offset from the row's centre is
		   (1.5 - 0.5N) x (card + gap) — for our 6-card row that's -1.5x.
		   --card-slot2-mult lives in global.css so Hero.svelte's group-shift
		   calc and the ring's --intro-ring-shift use the same number. */
		transform: translateX(calc(-1 * var(--card-slot2-mult) * (var(--card-w) + var(--card-gap))));

		/* ⚠️ The fade sits HERE, not on .inner. opacity below 1 is a grouping
		   property: on an element with transform-style: preserve-3d it forces
		   the element flat, which would collapse the flip mid-fade. .sticky has
		   no preserve-3d, so it's safe. Do not move this down. */
		opacity: calc(1 - var(--handover, 0));
	}

	.inner {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		will-change: transform;

		/* ⚠️ Order matters. translateZ is listed FIRST so the sink happens
		   along the page's own z-axis. After the rotateY it would follow the
		   flipped card's axis instead and come toward the viewer once the
		   turn passes 90 degrees. */
		transform: translateZ(var(--sink, 0px)) rotateY(var(--flip, 0deg));
	}

	.face {
		position: absolute;
		inset: 0;
		border-radius: var(--card-radius);
		overflow: hidden;
		backface-visibility: hidden;
	}

	.front {
		background: #0b0b0b;
	}

	.front img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: grayscale(1);
	}

	.back {
		transform: rotateY(160deg);
	}

	@media (max-width: 900px) {
		/* Card leaves the sticky layer and simply joins the stack of cards. */
		.layer {
			position: static;
			margin: var(--card-gap) auto 0;
		}
		.sticky {
			position: static;
			transform: none;
			opacity: 1;
		}
		.inner {
			transform: none !important;
		}
	}
</style>