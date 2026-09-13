/* ------------------------------------------------------------------
   THE CATEGORY TABLE — one list, read by every part of the site that
   needs to know what the categories are.

   Why this file exists: the labels used to be written out twice, once
   in sanity/schemaTypes/project.js as `title`s and again in
   SelectedWork.svelte as CATEGORY_LABELS. The gallery would have made
   that three times. They live here instead, and the components import
   them.

   ⚠️ STILL COUPLED TO SANITY. The `value` strings below must match the
   `value`s in sanity/schemaTypes/project.js exactly — they are what
   Studio stores on each document and what appears in URLs. Adding a
   category means editing that file AND this one. Renaming a label is
   safe here alone; renaming a VALUE orphans any project already tagged
   with the old one.

   ⚠️ ALSO COUPLED TO --intro-step. The homepage ring draws one card per
   category, and --intro-step in global.css must equal 360deg divided by
   the length of this array. IntroCards.svelte keeps its own CARDS array
   for now, so changing the count here means checking both.

   Colours are written as var() references, not hex, so the palette in
   global.css stays the only place a colour is actually defined.
   ------------------------------------------------------------------ */

export const CATEGORIES = [
	{
		value: 'graphics',
		label: 'Graphic Design',
		heading: 'var(--c-red)',
		backText: 'var(--c-red)',
		backBg: 'var(--c-green)'
	},
	{
		value: 'branding',
		label: 'Branding',
		heading: 'var(--c-cream)',
		backText: 'var(--c-blue)',
		backBg: 'var(--c-cream)'
	},
	{
		value: 'uxui',
		label: 'UX & UI',
		heading: 'var(--c-blue)',
		backText: 'var(--c-cream)',
		backBg: 'var(--c-blue)'
	},
	{
		value: '3d',
		label: '3D Design',
		heading: 'var(--c-green)',
		backText: 'var(--c-green)',
		backBg: 'var(--c-cream)'
	},
	{
		value: 'animation',
		label: 'Animation',
		heading: 'var(--c-cream)',
		backText: 'var(--c-cream)',
		backBg: 'var(--c-blue)'
	},
	{
		value: 'art',
		label: 'Art',
		heading: 'var(--c-red)',
		backText: 'var(--c-cream)',
		backBg: 'var(--c-red)'
	},
	{
		value: 'photography',
		label: 'Photography',
		heading: 'var(--c-green)',
		backText: 'var(--c-green)',
		backBg: 'var(--c-blue)'
	}
];

/* Stored value -> display label, e.g. 'uxui' -> 'UX & UI'. Built from the
   table above so the two can never disagree. Used by SelectedWork.svelte,
   which receives values from Sanity and has to show words. */
export const CATEGORY_LABELS = Object.fromEntries(
	CATEGORIES.map((category) => [category.value, category.label])
);