<script>
	// 680 mirrors the min-height of .hero in Hero.svelte. If you change it there,
	// change it here too, or the bar will appear slightly early on short screens.
	//
	// alwaysVisible skips the hide-until-scrolled behaviour entirely. The
	// homepage wants the bar to stay out of the hero's way; pages with no hero
	// (the gallery) would otherwise have no navigation for the first screen.
	let { heroMinHeight = 680, alwaysVisible = false } = $props();

	let scrollY = $state(0);
	let viewportHeight = $state(0);

	const visible = $derived(alwaysVisible || scrollY >= Math.max(viewportHeight, heroMinHeight));

	/*
	  PROGRESSIVE BLUR, THE HARD WAY.

	  What we actually want is one blurred band that fades out at the bottom.
	  The obvious way to write that is a mask-image over an element carrying a
	  backdrop-filter — and it does not work. In Chrome the mask cancels the
	  blur outright while the element's background keeps rendering, so it
	  looks like a styling mistake rather than a dead effect. Safari renders
	  it correctly, which makes it very easy to miss. Several rounds went into
	  establishing this; don't reach for a mask again.

	  So instead: a stack of plain blurred layers, no mask anywhere. Each one
	  is shorter than the last, and blur COMPOUNDS where they overlap — a
	  layer's backdrop includes the layers already painted beneath it. Near
	  the top all five overlap and the blur is at full strength; near the
	  bottom only the tallest remains and it's barely blurred at all. The
	  result reads as a gradient even though every individual layer has a
	  hard edge, because the edges are between 2px and 4px of blur rather
	  than between blurred and sharp.

	  `extent` is a fraction of the WHOLE band — the bar plus the fade below
	  it — not of the fade alone, so the blur starts thinning partway up the
	  bar itself rather than being uniform across it.

	  ⚠️ WHY THE BLUR VALUES CLIMB INSTEAD OF ALL BEING EQUAL. Blur doesn't
	  add up; it combines in quadrature, so ten equal 1px layers come to
	  about 3.2px, not 10px. The practical consequence is that the FIRST
	  layer produces the biggest visible jump — going from no blur to a
	  little blur is far more noticeable than going from a lot to slightly
	  more. Equal values therefore put a hard, obvious seam at the bottom
	  edge and near-invisible ones at the top, which is what the banding
	  was.

	  These values are sqrt(2k-1) scaled, which is the sequence that makes
	  the accumulated blur climb in a straight line instead of a curve — so
	  every boundary contributes the same small step and none of them stands
	  out. The tallest layer is the faintest, and each shorter one adds a
	  little more.

	  To make the whole thing blurrier, scale every value up together. To
	  make the steps less visible, add more layers and scale them all down.
	*/
	const BLUR_LAYERS = [
		{ extent: 1.0, blur: 0.5 },
		{ extent: 0.91, blur: 0.9 },
		{ extent: 0.82, blur: 1.1 },
		{ extent: 0.73, blur: 1.3 },
		{ extent: 0.64, blur: 1.5 },
		{ extent: 0.55, blur: 1.7 },
		{ extent: 0.46, blur: 1.8 },
		{ extent: 0.37, blur: 1.9 },
		{ extent: 0.28, blur: 2.1 },
		{ extent: 0.19, blur: 2.2 }
	];
</script>

<svelte:window bind:scrollY bind:innerHeight={viewportHeight} />

<!--
  Each layer is its own FIXED, TOP-LEVEL element. Not wrapped in a container,
  and not nested inside <header>: a backdrop-filter inside another element
  that is itself animated has failed here before. Keep them flat.
-->
{#each BLUR_LAYERS as layer, i (i)}
	<div
		class="glass-layer"
		class:visible
		aria-hidden="true"
		style="height: calc((var(--nav-h) + var(--nav-fade)) * {layer.extent});
		       backdrop-filter: blur({layer.blur}px);
		       -webkit-backdrop-filter: blur({layer.blur}px);"
	></div>
{/each}

<header class:visible>
	<div class="bar">
		<!-- Absolute paths, not bare hashes: from /gallery, "#intro" would look
		     for that anchor on the gallery page and find nothing. "/#intro"
		     goes home first, and still behaves as a plain in-page jump when
		     you're already on the homepage. -->
		<a class="wordmark" href="/">charoen</a>
		<nav>
			<a href="/#intro">About</a>
			<a href="/#work">Work</a>
			<a href="/gallery">Gallery</a>
		</nav>
	</div>
</header>

<style>
	/*
	  ⚠️ The blurred layers fade with opacity ONLY — no transform. An animated
	  transform promotes the element to its own compositing layer, which is
	  another way to lose a backdrop-filter in Chrome. The bar itself still
	  slides down; the band underneath just fades in.
	*/
	.glass-layer {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 19;
		pointer-events: none;
		opacity: 0;
		transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.glass-layer.visible {
		opacity: 1;
	}

	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 20;
		/* No background: the blur layers are the whole effect now. */
		/* hidden state */
		opacity: 0;
		transform: translateY(-100%);
		pointer-events: none;
		transition:
			opacity 300ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	header.visible {
		opacity: 1;
		transform: none;
		pointer-events: auto;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 1200px;
		margin: 0 auto;
		padding: 18px 40px;
	}

	.wordmark {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 22px;
		color: var(--c-red);
		text-decoration: none;
	}

	nav {
		display: flex;
		gap: 30px;
		font-size: 13px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	nav a {
		color: var(--c-cream);
		text-decoration: none;
		transition: color 200ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	nav a:hover {
		color: var(--c-red);
	}

	@media (prefers-reduced-motion: reduce) {
		header {
			transform: none;
			transition: opacity 200ms linear;
		}
	}

	@media (max-width: 900px) {
		.bar {
			padding: 14px 24px;
		}
	}
</style>