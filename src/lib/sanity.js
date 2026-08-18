import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: '6tr6jsd5',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
  token: process.env.SANITY_TOKEN
})