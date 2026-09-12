<script>
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import IntroCards from '$lib/components/IntroCards.svelte';
	import Introduction from '$lib/components/Introduction.svelte';
	import StickyFlipCard from '$lib/components/StickyFlipCard.svelte';
	import SelectedWork from '$lib/components/SelectedWork.svelte';

	let { data } = $props();

	const projects = $derived(data.projects ?? []);

	// TODO: this GIF still loads from your old Framer site.
	// Save it into static/ and change this to '/portrait.gif' before launch.
	const portrait = 'https://framerusercontent.com/images/4Mi9uTCEm4uQe4xhim1Lj2zN9c.gif';
</script>

<SiteHeader />

<!--
  The sticky card can travel through everything inside .scope and no further.

  ⚠️ StickyFlipCard is listed BEFORE IntroCards on purpose. Both are
  out-of-flow siblings, so document order decides which paints on top — and
  the card has to pass BEHIND the ring's front faces as it sinks away. Its
  position doesn't depend on where it sits in the markup.
-->
<div class="scope">
	<Hero />
	<StickyFlipCard src={portrait} alt="Portrait of Amanda" />
	<!-- Introduction is passed IN so it renders inside the pinned stage, below
	     the ring, and stays on screen for the whole rotation. It is still its
	     own component and still owns its own copy. -->
	<IntroCards>
		<Introduction />
	</IntroCards>
</div>

<SelectedWork {projects} />

<style>
	.scope {
		/* How far short of the bottom of .scope the card stops.

		   ⚠️ This is no longer 0. IntroCards is now 100svh + --intro-scroll
		   tall, and the card has to stop the moment the ring pins — not ride
		   all the way down through the rotation. Working backwards from
		   .scope's bottom, that point is the ring's travel, plus the pinned
		   screen, less the card's own resting height and offset. Change
		   --intro-scroll and this follows automatically. */
		--tail: calc(100svh + var(--intro-scroll) - var(--card-top) - var(--card-h));

		position: relative;
	}
</style>