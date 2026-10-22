export const initialDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'A little space for your next idea.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Good work often starts with a few words. This is a real rich text editor, ready for your notes, articles, release updates, or anything in between.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Make it your own' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Highlight a sentence and give it a little emphasis.',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Turn a few thoughts into a list.' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Save your draft and come back when inspiration strikes.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Start small. Keep going. Make something that matters to you.',
            },
          ],
        },
      ],
    },
    { type: 'paragraph' },
  ],
}
