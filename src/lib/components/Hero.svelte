<script>
	import AsciiBackground from './AsciiBackground.svelte';

	// Vite's ?raw suffix imports a file as a plain string, so the artwork stays
	// a .txt file you can re-export at any time without touching code.
	import heroAscii from '$lib/assets/HOME_HeroBackground.txt?raw';
</script>

<section id="top" class="hero">
	<AsciiBackground text={heroAscii} radius={60} opacity={0.2} />

	<div class="content">
		<!-- The sticky card sits in the empty space at the left of this block.
		     It isn't rendered here — see StickyFlipCard.svelte. -->
		<div class="lockup">
			<h1>
				<span class="line">charoen</span>
				<span class="line indented">silpa</span>
			</h1>

			<div class="definitions">
				<p class="definition first">
					<span>"เจริญ" <strong>/jä 'rərn/</strong></span>
					<span>to grow; to prosper</span>
				</p>
				<p class="definition second">
					<span>"ศิลป์" <strong>/sǐn/</strong></span>
					<span>art, craft; skill</span>
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		height: 100vh;
		min-height: 680px;
		overflow: hidden;
	}

	.content {
		position: relative;
		z-index: 2;
		height: 100%;
		/* Shared with --card-top, so the card can't drift away from the type. */
		padding-top: var(--hero-pad-top);
	}

	.lockup {
		width: var(--hero-block);
		margin: 0 auto;
		/* Shifts the ENTIRE block (headline + definitions) as one rigid unit —
		   nothing inside .lockup changes position relative to anything else
		   inside it. See --hero-group-shift in global.css for what this
		   number is and why. */
		transform: translateX(var(--hero-group-shift));
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--hero-heading-size);
		line-height: 0.8;
		letter-spacing: -0.02em;
		color: var(--c-red);
	}

	.line {
		display: block;
	}

	/* Second line starts clear of the card sitting in the first two columns.
	   The nudge is an optical correction for the open left side of the "s" —
	   it pulls the word back into line with the definition below it. */
	.indented {
		margin-left: calc(var(--hero-indent-1) + var(--hero-silpa-nudge));
	}

	.definitions {
		margin-top: var(--hero-def-gap);
		font-size: var(--hero-caption);
		line-height: 1.25;
	}

	.definition {
		margin: 0;
		display: flex;
		flex-direction: column;
		/* .second sits close to the right edge of .lockup once
		   --hero-indent-2 is large, leaving little width before wrapping.
		   Lets the caption overflow instead — same idea as "charoen". */
		white-space: nowrap;
	}

	.definition strong {
		font-weight: 700;
	}

	/* Aligned under the start of "silpa". */
	.first {
		margin-left: var(--hero-indent-1);
	}

	/* Stepped down and across, echoing the stagger of the two headline lines. */
	.second {
		margin-left: var(--hero-indent-2);
		margin-top: 1.6em;
	}

	@media (max-width: 900px) {
		.lockup {
			padding: 0 24px;
			box-sizing: border-box;
		}
		.second {
			margin-top: 1em;
		}
	}
</style>