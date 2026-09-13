import imageUrlBuilder from '@sanity/image-url';

/* ------------------------------------------------------------------
   Builds Sanity CDN image URLs at whatever size the page asks for,
   instead of serving the full-resolution original.

   ⚠️ WHY THIS IS A SEPARATE FILE FROM src/lib/sanity.js, AND MUST STAY
   THAT WAY: sanity.js creates a client holding SANITY_TOKEN. Anything a
   .svelte component imports gets bundled and sent to the browser, so
   importing sanity.js into a component would ship the token to every
   visitor. This file has no token and no client — only the project ID
   and dataset name, both of which are already public in the repo.

   ⚠️ DUPLICATED VALUES: projectId and dataset also appear in
   src/lib/sanity.js. Two copies is the price of keeping the token out
   of the browser bundle. If the project ID or dataset ever changes,
   change it in both files.
   ------------------------------------------------------------------ */

const builder = imageUrlBuilder({
	projectId: '6tr6jsd5',
	dataset: 'production'
});

/**
 * Ask Sanity for a resized, web-optimised version of a project image.
 *
 * `auto('format')` serves WebP or AVIF to browsers that accept them and
 * falls back to JPEG for the rest.
 *
 * NOTE: this deliberately does NOT crop. The gallery sizes each card to
 * its own image's proportions, so there is nothing to trim — which also
 * means the `hotspot: true` setting in the schema has no effect here.
 * Hotspot only matters where an image is being forced into a box of a
 * different shape, so it will start earning its keep on the individual
 * project pages if those use a fixed-shape hero.
 *
 * @param {object} source - the raw `image` object from a GROQ query
 * @param {number} width - pixel width to request; height follows the
 *                         image's own proportions
 */
export function projectImage(source, width) {
	return builder.image(source).width(width).auto('format').url();
}