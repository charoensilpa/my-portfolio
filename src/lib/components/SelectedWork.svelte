<script>
	let { projects = [] } = $props();

	// Studio stores the value (e.g. "uxui"); the label is presentation, so it lives here.
	const CATEGORY_LABELS = {
		graphics: 'Graphic Design',
		branding: 'Branding',
		uxui: 'UX & UI',
		'3d': '3D Design',
		animation: 'Animation',
		art: 'Art',
		photography: 'Photography'
	};

	const MONTH_LABELS = {
		'01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
		'05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
		'09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
	};

	function formatDate(date) {
		if (!date?.year) return '';
		const month = date.month ? MONTH_LABELS[date.month] : '';
		return month ? `${month} ${date.year}` : String(date.year);
	}

	function formatCategories(category) {
		if (!Array.isArray(category) || category.length === 0) return '';
		return category.map((value) => CATEGORY_LABELS[value] ?? value).join(', ');
	}
</script>

<section id="work" class="selected-work full-bleed">
	{#each projects as project (project._id)}
		<article class="work-card">
			{#if project.imageUrl}
				<img class="work-image" src={project.imageUrl} alt={project.title ?? ''} />
			{/if}

			<div class="work-text">
				<span class="work-date">{formatDate(project.date)}</span>
				<h3 class="work-title">{project.title}</h3>
				<span class="work-category">{formatCategories(project.category)}</span>
			</div>
		</article>
	{/each}
</section>

<style>
	.selected-work {
		width: 100%;
	}

	.work-card {
		position: relative;
		width: 100%;
		min-height: 100svh;
		padding: var(--work-pad-y) var(--work-pad-x);
		border-radius: var(--card-radius);
		background: rgba(236, 234, 226, 0.08);
		isolation: isolate; /* keeps mix-blend-mode contained to this card */

		/*
		  ⚠️ Do NOT add overflow: hidden here. It makes the card a scroll
		  container, which silently kills position: sticky on .work-text.
		  The image is clipped by border-radius: inherit instead.
		*/
	}

	.work-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
	}

	.work-text {
		position: sticky;
		top: var(--work-sticky-top);
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: baseline;
		gap: 1rem;
		color: #00a670;
		mix-blend-mode: difference;
	}

	.work-date,
	.work-category {
		font-family: var(--font-body);
		font-weight: 400;
		font-size: var(--work-date-size);
	}

	.work-date {
		text-align: left;
	}

	.work-category {
		font-size: var(--work-category-size);
		text-align: right;
	}

	.work-title {
		margin: 0;
		text-align: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--work-title-size);
	}
</style>