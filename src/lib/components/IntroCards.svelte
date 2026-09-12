<script>
	import { scrollProgress } from '$lib/actions/scrollProgress.js';

	// The intro copy is rendered inside the pinned stage, below the ring, so it
	// stays on screen for the whole rotation. It arrives as a snippet rather
	// than being written here, so Introduction.svelte still owns the words and
	// +page.svelte still decides what appears. See "the page file composes and
	// nothing else" in the project notes.
	let { children } = $props();

	// ⚠️ Six cards, matching --intro-step (360 / 6 = 60deg) in global.css.
	// Change the length of this array and that token must change with it.
	// The hrefs point at routes that DON'T EXIST YET — they will 404 until the
	// category and project pages are built. Swap `label` for a real image once
	// there's artwork for each.
	const CARDS = [
		{ label: 'graphic design', href: '/category/graphics' },
		{ label: 'branding', href: '/category/branding' },
		{ label: 'ux & ui', href: '/category/uxui' },
		{ label: '3d', href: '/category/3d' },
		{ label: 'animation', href: '/category/animation' },
		{ label: 'art', href: '/category/art' },
		{ label: 'photography', href: '/category/photography' }
	];
</script>

<!--
  The page holds still here and the ring turns instead. The section is tall to
  provide that scroll distance; the stage inside it sticks to the top of the
  viewport and stays put while the page moves past.

  ⚠️ Do NOT add overflow: hidden / auto / scroll to this section. It becomes a
  scroll container and the sticky stage silently stops sticking. overflow-x on
  .stage is `clip`, which is deliberate — see below.
-->
<section id="intro" class="intro" style="--r: 0;" use:scrollProgress={{ property: '--r' }}>
	<div class="stage">
		<div class="ring">
			{#each CARDS as card, i (card.href)}
				<a class="card" href={card.href} style="--i: {i};">
					<span class="stripe">{card.label}</span>
				</a>
			{/each}
		</div>

		<div class="below">
			{@render children?.()}
		</div>
	</div>
</section>

<style>
	.intro {
		/* One screen to hold still in, plus the travel that turns the ring. */
		min-height: calc(100svh + var(--intro-scroll));
	}

	.stage {
		position: sticky;
		top: 0;
		height: 100svh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: var(--intro-pad-top);
		perspective: var(--intro-perspective);

		/* The faces swing well past the viewport edges at the rim of the ring,
		   and transformed elements still count toward scrollable overflow. clip
		   trims that without becoming a scroll container — which `hidden` would,
		   killing this element's own stickiness. Do not change it to hidden. */
		overflow-x: clip;
	}

	.ring {
		position: relative;
		width: var(--intro-card-w);
		height: var(--intro-card-h);
		flex: none;
		transform-style: preserve-3d;

		/* --r counts 0 -> 1 across the section, written by scrollProgress.js. */
		transform: rotateY(calc(var(--r) * var(--intro-turn)));
	}

	/* Whatever sits under the ring — currently the intro copy — centred in the
	   room the ring leaves. */
	.below {
		flex: 1;
		display: grid;
		place-items: center;
		width: 100%;
		min-height: 0;
	}

	.card {
		position: absolute;
		inset: 0;
		border-radius: var(--card-radius);
		overflow: hidden;
		text-decoration: none;
		pointer-events: auto;

		/* Stand each face at its own angle, then push it out to the rim.
		   --pop is the hover lift, added to the radius so the card moves
		   straight toward the viewer along its own normal rather than sliding. */
		transform: rotateY(calc(var(--i) * var(--intro-step)))
			translateZ(calc(var(--intro-ring-radius) + var(--pop, 0px)));

		/* Faces turned away drop out rather than showing a mirrored back. This
		   is what makes the ring read as solid, and it also stops the back
		   half of the ring swallowing clicks meant for the front. */
		backface-visibility: hidden;

		transition:
			transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
			filter 320ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.card:hover,
	.card:focus-visible {
		--pop: var(--intro-hover-pop);
		filter: brightness(1.18);
	}

	.card:focus-visible {
		outline: 2px solid var(--c-red);
		outline-offset: 3px;
	}

	.card .stripe {
		width: 100%;
		height: 100%;
	}

	@media (prefers-reduced-motion: reduce) {
		/* Keep the hover cue, drop the movement. */
		.card {
			transition: filter 200ms linear;
		}
		.card:hover,
		.card:focus-visible {
			--pop: 0px;
		}
	}

	@media (max-width: 900px), (prefers-reduced-motion: reduce) {
		/* No pinning and no rotation: the ring flattens into a wrapped grid and
		   the section is only as tall as its contents. scrollProgress.js parks
		   --r at 0 under reduced motion, so every rule reading it is
		   neutralised here rather than left at one end of a range. */
		.intro {
			min-height: 0;
			max-width: 1200px;
			margin: 0 auto;
			padding: 56px 24px 0;
		}

		.stage {
			position: static;
			height: auto;
			display: block;
			padding-top: 0;
			perspective: none;
			overflow-x: visible;
		}

		.ring {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: var(--card-gap);
			width: 100%;
			height: auto;
			transform: none;
			transform-style: flat;
		}

		.card {
			position: static;
			width: var(--intro-card-w);
			height: var(--intro-card-h);
			flex: none;
			transform: none;
		}

		.below {
			display: block;
			padding-top: var(--space-section);
		}
	}
</style>