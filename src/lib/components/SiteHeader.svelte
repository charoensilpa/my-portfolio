<script>
	// 680 mirrors the min-height of .hero in Hero.svelte. If you change it there,
	// change it here too, or the bar will appear slightly early on short screens.
	let { heroMinHeight = 680 } = $props();

	let scrollY = $state(0);
	let viewportHeight = $state(0);

	const visible = $derived(scrollY >= Math.max(viewportHeight, heroMinHeight));
</script>

<svelte:window bind:scrollY bind:innerHeight={viewportHeight} />

<header class:visible>
	<div class="bar">
		<a class="wordmark" href="#top">charoen</a>
		<nav>
			<a href="#intro">About</a>
			<a href="#work">Work</a>
		</nav>
	</div>
</header>

<style>
	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 20;
		background: rgba(0, 0, 0, 0.72);
		backdrop-filter: blur(10px);
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