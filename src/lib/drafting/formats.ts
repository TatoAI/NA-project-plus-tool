export const FORMATS = {
  linkedin_post: {
    label: "LinkedIn post",
    instructions:
      "Write a LinkedIn post. Open with a strong first line that earns the 'see more' click. Short paragraphs, plenty of white space, roughly 150-250 words. End with a question or a clear takeaway. At most 3 hashtags, only if natural.",
  },
  x_thread: {
    label: "X / Twitter thread",
    instructions:
      "Write an X thread of 5-8 posts. Number them 1/, 2/, and so on. Each post must stand alone and stay under 280 characters. The first post is the hook; the last post wraps up with a takeaway or call to action.",
  },
  instagram_caption: {
    label: "Instagram caption",
    instructions:
      "Write an Instagram caption. A punchy first line, a short body, and a light call to action. Add 5-8 relevant hashtags on a separate final line.",
  },
  newsletter: {
    label: "Newsletter",
    instructions:
      "Write a newsletter issue. Start with 3 subject line options, then a one-line preview text, then the body: a short personal opening, 2-3 clearly headed sections, and a closing with one call to action.",
  },
  blog_post: {
    label: "Blog post",
    instructions:
      "Write a blog post of about 700-900 words with a title, a short intro, headed sections, and a conclusion. Prefer concrete examples over generalities.",
  },
} as const;

export type FormatKey = keyof typeof FORMATS;

export function isFormatKey(value: unknown): value is FormatKey {
  return typeof value === "string" && value in FORMATS;
}
