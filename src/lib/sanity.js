import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: '6tr6jsd5',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
  token: 'skXGrsCDrTlrVdQbw7TPtm4ob6g9jWguuHfwQGOzXogKKQGv7lLdDnWLUda0GLQoxK3YZKkFOQSbO0cIfX8aeyguPI4Rp23B93JhEgcY877Y3KT5o7fMn845VtGpfpG45KBYVwQ2eRP0OptAtSfx7rkVShWGuFCOF0gcLjF2O2brUUejOjY1'
})