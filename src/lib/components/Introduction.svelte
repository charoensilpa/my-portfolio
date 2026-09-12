<script>
	import { revealOnScroll } from '$lib/actions/revealOnScroll.js';
</script>

<section class="intro-text">
	<p use:revealOnScroll>
		I'm a multidisciplinary designer with a passion for motion, material and the small details that
		make a thing feel alive. Above: six frames from the last year of making things.
	</p>
</section>

<style>
	.intro-text {
		max-width: 800px;
		margin: 0 auto;
		padding: 96px 40px;
		text-align: center;
	}

	p {
		font-size: 24px;
		line-height: 1.5;
		margin: 0;
		text-wrap: pretty;

		/* Starting state for the reveal: invisible and slightly lower.
		   revealOnScroll adds .is-visible once this scrolls into view. */
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 500ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	p:global(.is-visible) {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		p {
			transition: none;
			transform: none;
		}
	}

	@media (max-width: 900px) {
		.intro-text {
			padding: 56px 24px;
		}
		p {
			font-size: 18px;
		}
	}
</style>