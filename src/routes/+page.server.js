import { sanityClient } from '$lib/sanity'

export async function load() {
  const projects = await sanityClient.fetch(`
    *[_type == "project"] | order(_createdAt desc) {
      _id,
      title,
      slug,
      description,
      image,
      "imageUrl": image.asset->url
    }
  `)
  
  return { projects }
}