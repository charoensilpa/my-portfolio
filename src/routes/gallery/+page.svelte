<script>
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import GallerySection from '$lib/components/GallerySection.svelte';
	import { CATEGORIES } from '$lib/categories.js';

	let { data } = $props();

	const projects = $derived(data.projects ?? []);

	/* category is an ARRAY in Sanity — a project can carry several — so this
	   is `includes`, not `===`. A project tagged both 3D Design and
	   Animation deliberately appears in both sections. */
	function inCategory(value) {
		return projects.filter((project) => project.category?.includes(value));
	}
</script>

<svelte:head>
	<title>Gallery — charoen silpa</title>
</svelte:head>

<SiteHeader alwaysVisible />

{#each CATEGORIES as category (category.value)}
	<GallerySection
		id={category.value}
		title={category.label}
		projects={inCategory(category.value)}
		heading={category.heading}
		backText={category.backText}
		backBg={category.backBg}
	/>
{/each}