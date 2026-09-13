import { sanityClient } from '$lib/sanity'

export async function load() {
  const projects = await sanityClient.fetch(`
    *[_type == "project" && defined(category)] | order(date.year desc, date.month desc, _createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      image,
      "aspect": image.asset->metadata.dimensions.aspectRatio,
      category
    }
  `)

  return { projects }
}