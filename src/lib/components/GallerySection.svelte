<script>
	import { projectImage } from '$lib/sanityImage.js';

	/*
	  ONE SECTION OF THE GALLERY. Knows nothing about which category it is
	  drawing — it is handed an id, a title, three colours and a list of
	  projects, and renders that. /gallery/+page.svelte decides which
	  categories exist and in what order.

	  - id              anchor for this section, e.g. "graphics". The intro
	                    carousel on the homepage links straight to it, so it
	                    must be the category's stored Sanity value.
	  - title           the heading, e.g. "Graphic Design"
	  - projects        already filtered to this category by the page
	  - heading         colour of the heading text
	  - backText        colour of the title on a flipped card
	  - backBg          colour behind that title
	  - placeholders    how many striped cards to show when there are no
	                    projects yet; they vanish on their own the moment a
	                    real project is published in this category
	*/
	let {
		id,
		title,
		projects = [],
		heading = 'var(--c-cream)',
		backText = 'var(--c-black)',
		backBg = 'var(--c-cream)',
		placeholders = 5
	} = $props();

	const isEmpty = $derived(projects.length === 0);

	/*
	  CARD SHAPE COMES FROM THE IMAGE. Each project's `aspect` is width ÷
	  height, read from Sanity's own asset metadata in +page.server.js — so
	  a card is exactly as tall or as squat as the artwork Amanda uploaded,
	  with nothing cropped away. A row is as tall as its tallest card and
	  the shorter ones centre against it.

	  FALLBACK_ASPECT covers a project published without an image, and the
	  striped placeholders in an empty category.

	  A markedly landscape image takes two columns rather than one: at a
	  single column width a 16:9 photograph would be roughly 145px tall,
	  which reads as a strip rather than a card.
	*/
	const FALLBACK_ASPECT = 0.8;
	const WIDE_ASPECT = 1.5;

	/*
	  FLIP AXIS also comes from the card's own shape, but off a different,
	  simpler threshold than WIDE_ASPECT above: aspect > 1 means the image
	  is wider than it is tall (landscape / "horizontal"), so the card
	  flips top-over-bottom (rotateX) instead of the usual left-to-right
	  (rotateY) — the flip axis matches the card's own long axis. This is
	  independent of whether the card spans one column or two; a card can
	  be "horizontal" for flip purposes without being wide enough to earn
	  a second column. See .is-horizontal in <style> below.
	*/

	function aspectOf(project) {
		const value = Number(project?.aspect);
		return Number.isFinite(value) && value > 0 ? value : FALLBACK_ASPECT;
	}

	/*
	  Shapes for the placeholder cards in an empty category. Chosen by
	  POSITION, not at random, so the layout is identical on the server and
	  in the browser and doesn't reshuffle on every page load.
	*/
	const PLACEHOLDER_ASPECTS = [0.75, 1.6, 0.82, 1.0, 0.7];

	/* Rendered widths, in CSS pixels, at the two possible column spans —
	   used to work out which image sizes are worth offering the browser. */
	const NARROW_WIDTHS = [300, 600, 900];
	const WIDE_WIDTHS = [600, 900, 1400];

	function srcsetFor(image, wide) {
		const widths = wide ? WIDE_WIDTHS : NARROW_WIDTHS;
		return widths.map((w) => `${projectImage(image, w)} ${w}w`).join(', ');
	}
</script>

<section class="section" {id}>
	<div class="heading-bar">
		<h2 class="heading" style="color: {heading};">{title}</h2>
	</div>

	<div class="grid" style="--back-text: {backText}; --back-bg: {backBg};">
		{#if isEmpty}
			{#each Array.from( { length: placeholders }, (_, i) => PLACEHOLDER_ASPECTS[i % PLACEHOLDER_ASPECTS.length] ) as aspect, i (i)}
				<div
					class="card is-placeholder"
					class:is-wide={aspect >= WIDE_ASPECT}
					class:is-horizontal={aspect > 1}
					style="--card-aspect: {aspect};"
				>
					<div class="face stripe">Nothing here yet</div>
				</div>
			{/each}
		{:else}
			{#each projects as project (project._id)}
				{@const aspect = aspectOf(project)}
				<a
					class="card"
					class:is-wide={aspect >= WIDE_ASPECT}
					class:is-horizontal={aspect > 1}
					style="--card-aspect: {aspect};"
					href="/project/{project.slug}"
				>
					<span class="inner">
						<span class="face front">
							{#if project.image}
								<img
									src={projectImage(project.image, 600)}
									srcset={srcsetFor(project.image, aspect >= WIDE_ASPECT)}
									sizes={aspect >= WIDE_ASPECT
										? '(max-width: 900px) 88vw, 552px'
										: '(max-width: 900px) 42vw, 260px'}
									alt={project.title ?? ''}
									loading="lazy"
									decoding="async"
								/>
							{:else}
								<span class="stripe no-image">No image</span>
							{/if}
						</span>

						<span class="face back">{project.title}</span>
					</span>
				</a>
			{/each}
		{/if}
	</div>
</section>

<style>
	.section {
		/* Never shorter than one screen, but grows freely past it once there
		   are enough cards to need the room.

		   ⚠️ NO overflow property here, ever. The heading bar below is
		   sticky and bounded by this element — the moment anything gives
		   .section an overflow other than visible it becomes a scroll
		   container and the heading silently stops pinning, the same trap
		   .work-card has in Selected Work. */
		min-height: 100svh;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 var(--gallery-pad-x) var(--gallery-pad-y);
	}

	/*
	  Pins just below the nav bar and rides down the page. Because sticky is
	  bounded by the nearest scrolling ancestor's box — here .section — the
	  heading is carried off the top of the screen by its own section's
	  bottom edge exactly as the next section's heading arrives to replace
	  it. That handover is free; there is no JavaScript watching scroll.

	  The negative side margins cancel .section's padding so the bar spans
	  the full window. Deliberately NOT the .full-bleed utility: that uses
	  100vw, which counts the scrollbar and would overflow by ~15px.
	*/
	/*
	  Pins just below the nav bar and rides down the page. Because sticky is
	  bounded by the nearest scrolling ancestor's box — here .section — the
	  heading is carried off the top of the screen by its own section's
	  bottom edge exactly as the next section's heading arrives to replace
	  it. That handover is free; there is no JavaScript watching scroll.

	  ⚠️ z-index 21 puts this ABOVE the site header's 20, deliberately. The
	  heading pins at top: 0, so it sits INSIDE the nav bar rather than
	  below it — the section name reads as part of the bar for as long as
	  that section is on screen. Painting over the header is what keeps the
	  bar's tint from washing the text out, and why the heading needs no
	  background of its own. It must not have a backdrop-filter either; the
	  nav bar's own blur is doing that work.

	  The bar is exactly --gallery-nav-offset tall with the heading centred
	  in it, so the text lines up with the wordmark and the nav links rather
	  than sitting against the top edge of the window.
	*/
	.heading-bar {
		position: sticky;
		top: 12px;
		z-index: 21;
		align-self: stretch;
		height: var(--nav-h);
		display: grid;
		place-items: center;
		margin: 0 0 var(--gallery-heading-gap);

		/* The bar spans the width of the section, so it must not swallow
		   hover or clicks meant for the cards travelling underneath it —
		   nor the nav links it is now sitting on top of. */
		pointer-events: none;
	}

	.heading {
		position: relative;
		margin: 0;
		pointer-events: auto; /* the bar ignores the pointer; the words themselves stay selectable */
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--gallery-heading-size);
		line-height: 1;
		text-align: center;
		text-wrap: balance;
	}

	/*
	  Fixed-width tiles rather than stretchy ones: with only two projects in
	  a category, stretchy tiles would blow them up to half the screen each.
	  Fixed sizes keep every card the same scale site-wide.

	  This is flexbox with wrapping, not CSS Grid. The reason is centering:
	  flexbox centers EACH WRAPPED ROW independently, so a short last row —
	  two cards left over under a full first row — centers on its own line
	  instead of packing to the left edge of a track layout sized for the
	  row above it. `align-items: center` centres cards within their own
	  row against whichever card in that row is tallest.

	  ⚠️ TRADE-OFF, on purpose: CSS Grid's `grid-auto-flow: dense` (which
	  this used to use) can slide a later single-width card back to fill a
	  gap a two-wide card leaves at the end of a row. Flexbox has no
	  equivalent — a wide card that doesn't fit just wraps to the next line
	  and leaves a hole. Reliable centering on every row was judged more
	  important than avoiding that occasional gap. Revisit if a lot of wide
	  cards start showing up mixed in with narrow ones.
	*/
	.grid {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--gallery-card-gap);
		width: 100%;

		/* No max-width (was var(--gallery-max-w), 1200px, removed earlier).
		   The section's own padding is --gallery-pad-x, tied to this same
		   gap, so a row that's wide enough spans edge to edge with a
		   gutter that reads as "one more gap" rather than a separate
		   margin. justify-content: center, combined with flex-wrap, keeps
		   every row — not just the first — centred as its own block. */
	}

	/*
	  --card-aspect is set per card in the markup, straight from the image's
	  own metadata. The height that shape implies is then held between
	  --gallery-card-h-min and --gallery-card-h-max, so cards vary without
	  any one of them towering over its neighbours. A card pushed to either
	  limit is cropped by object-fit rather than distorted.

	  --card-track-w is how wide this card actually renders, which the
	  height has to be worked out from: one column normally, two columns
	  plus the gap between them when the image is landscape enough to span.
	*/
	.card {
		--card-track-w: var(--gallery-card-w);

		display: block;
		flex: 0 0 var(--card-track-w); /* fixed size: don't grow, don't shrink */
		height: clamp(
			var(--gallery-card-h-min),
			calc(var(--card-track-w) / var(--card-aspect, var(--gallery-card-aspect))),
			var(--gallery-card-h-max)
		);
		text-decoration: none;

		/* Perspective on the outer element, not the rotating one, so each
		   card is viewed head-on rather than sharing one vanishing point
		   across the whole grid. */
		perspective: var(--gallery-perspective);
	}

	/* Landscape images take a double-wide slot, so they aren't reduced to a
	   thin strip at a single card's width. --card-track-w is redefined
	   before .card reads it, so both flex-basis and the height calc above
	   pick up the wider number automatically. */
	.is-wide {
		--card-track-w: calc(2 * var(--gallery-card-w) + var(--gallery-card-gap));
	}

	.inner {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform var(--gallery-flip) cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* :focus-visible on the link drives the same flip, so the titles are
	   reachable by keyboard and not only by mouse.

	   The axis depends on the card's own shape (see the FLIP AXIS comment
	   in <script>): a vertical (portrait) card flips left-to-right around
	   its vertical axis, a horizontal (landscape) card flips top-to-bottom
	   around its horizontal axis instead — the rotation always runs across
	   the card's short axis, matching its own proportions. */
	.card:hover .inner,
	.card:focus-visible .inner {
		transform: rotateY(180deg);
	}

	.card.is-horizontal:hover .inner,
	.card.is-horizontal:focus-visible .inner {
		transform: rotateX(180deg);
	}

	.card:focus-visible {
		outline: 2px solid var(--c-cream);
		outline-offset: 4px;
	}

	.face {
		position: absolute;
		inset: 0;
		border-radius: var(--card-radius);

		/* Safe here — nothing inside a card is sticky. Do not copy this onto
		   a container that has sticky children (see .work-card). */
		overflow: hidden;

		/* Whichever face is turned away drops out, so the two never show
		   through each other mid-turn. */
		backface-visibility: hidden;
	}

	.front img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.back {
		/* Pre-rotated to match the front, so it lands right-way-up once the
		   flip completes. Must mirror whichever axis .inner rotates on
		   above — a horizontal card's back uses rotateX, not rotateY, or
		   the title would land upside-down. */
		transform: rotateY(180deg);
		display: grid;
		place-items: center;
		padding: 0 12px;
		text-align: center;
		text-wrap: balance;
		color: var(--back-text);
		background: var(--back-bg);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--gallery-title-size);
		line-height: 1.15;
	}

	.is-horizontal .back {
		transform: rotateX(180deg);
	}

	.no-image,
	.is-placeholder .face {
		width: 100%;
		height: 100%;
	}

	/* Placeholders aren't links and don't flip — there's nothing to flip to
	   until a project exists. */
	.is-placeholder {
		position: relative;
		pointer-events: none;
	}

	@media (max-width: 900px) {
		/* The wordmark plus three nav links already fill the bar on a phone,
		   so the heading drops below it rather than colliding with them. */
		.heading-bar {
			top: var(--nav-h);
			height: auto;
			padding-top: var(--gallery-heading-pad);
		}

		/* Two columns at most here, so a double-width card would either take
		   a whole row to itself or, at one column, overflow the grid
		   entirely. Everything goes back to a single card's width. */
		.is-wide {
			--card-track-w: var(--gallery-card-w);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		/* No rotation at all. The back face sits on top of the front and
		   fades in instead, which shows the same information without the
		   card moving. */
		.inner {
			transform-style: flat;
			transition: none;
		}

		.card:hover .inner,
		.card:focus-visible .inner,
		.card.is-horizontal:hover .inner,
		.card.is-horizontal:focus-visible .inner {
			transform: none;
		}

		.face {
			backface-visibility: visible;
		}

		.back,
		.is-horizontal .back {
			transform: none;
			opacity: 0;
			transition: opacity 200ms linear;
		}

		.card:hover .back,
		.card:focus-visible .back {
			opacity: 1;
		}
	}
</style>