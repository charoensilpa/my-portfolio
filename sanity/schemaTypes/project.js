export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      }
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'date',
      title: 'Date',
      type: 'object',
      fields: [
        {
          name: 'year',
          title: 'Year',
          type: 'number',
          validation: Rule => Rule.required().integer().min(1900).max(2100)
        },
        {
          name: 'month',
          title: 'Month (optional)',
          type: 'string',
          options: {
            list: [
              { title: 'Jan', value: '01' },
              { title: 'Feb', value: '02' },
              { title: 'Mar', value: '03' },
              { title: 'Apr', value: '04' },
              { title: 'May', value: '05' },
              { title: 'Jun', value: '06' },
              { title: 'Jul', value: '07' },
              { title: 'Aug', value: '08' },
              { title: 'Sep', value: '09' },
              { title: 'Oct', value: '10' },
              { title: 'Nov', value: '11' },
              { title: 'Dec', value: '12' }
            ],
            layout: 'dropdown'
          }
        }
      ]
    },
    {
      name: 'category',
      title: 'Category',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Graphic Design', value: 'graphics' },
          { title: 'Branding', value: 'branding' },
          { title: 'UX & UI', value: 'uxui' },
          { title: '3D Design', value: '3d' },
          { title: 'Animation', value: 'animation' },
          { title: 'Art', value: 'art' },
          { title: 'Photography', value: 'photography' }
        ],
        layout: 'list'
      }
    },
    {
      name: 'content',
      title: 'Content Blocks',
      type: 'array',
      of: [
        {
          name: 'imageDescription',
          title: 'Image Description',
          type: 'object',
          fields: [
            {
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
              validation: (Rule) => Rule.min(1).max(5),
              options: { layout: 'grid' }
            },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text' }
          ],
          preview: { select: { title: 'title', media: 'images.0' } }
        },
        {
          name: 'slideshow',
          title: 'Slideshow',
          type: 'object',
          fields: [
            {
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
              validation: (Rule) => Rule.max(30),
              options: { layout: 'grid' }
            }
          ],
          preview: {
            select: { media: 'images.0', images: 'images' },
            prepare({ media, images }) {
              return { title: `Slideshow (${images?.length || 0} images)`, media };
            }
          }
        },
        {
          name: 'bigImage',
          title: 'Big Image',
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule) => Rule.required()
            }
          ],
          preview: { select: { media: 'image' }, prepare: ({ media }) => ({ title: 'Big Image', media }) }
        },
        {
          name: 'video',
          title: 'Video',
          type: 'object',
          fields: [
            {
              name: 'file',
              title: 'Video file',
              type: 'file',
              options: { accept: 'video/*' },
              validation: (Rule) => Rule.required()
            }
          ],
          preview: { prepare: () => ({ title: 'Video' }) }
        }
      ]
    }
  ]
}