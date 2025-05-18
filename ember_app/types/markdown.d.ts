declare module 'markdown' {
  interface Markdown {
    toHTML(markdownString: string): string;
  }
  const markdown: Markdown;
}