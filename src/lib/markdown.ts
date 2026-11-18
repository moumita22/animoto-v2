import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({
  gfm: true,
  breaks: true,
});

const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    'b',
    'strong',
    'i',
    'em',
    'u',
    's',
    'del',
    'strike',
    'p',
    'br',
    'hr',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'code',
    'pre',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'span',
  ],
  ALLOWED_ATTR: [
    'href',
    'title',
    'target',
    'rel',
    'src',
    'alt',
    'width',
    'height',
    'class',
  ],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

/**
 * Robust, XSS-sanitized markdown renderer that handles:
 * - Standard markdown: **bold**, *italic*
 * - Double-click / space tolerance: ** bold ** or **bold ** -> rendered properly!
 * - Raw HTML tags: <b>bold</b>, <i>italic</i>, <u>underline</u>
 * - Headings, bullet lists, quotes
 * - DOMPurify sanitization preventing stored XSS injection
 */
export function renderMarkdown(content: string): string {
  if (!content || !content.trim()) return '';

  // Normalize spaces inside ** and * so selections with trailing spaces render 100% reliably
  const normalized = content
    .replace(/\*\*\s*([^\*\n]+?)\s*\*\*/g, '<b>$1</b>')
    .replace(/__\s*([^_\n]+?)\s*__/g, '<b>$1</b>')
    .replace(/(?<!\*)\*\s*([^\*\n]+?)\s*\*(?!\*)/g, '<i>$1</i>')
    .replace(/(?<!_)_\s*([^_\n]+?)\s*_(?!_)/g, '<i>$1</i>');

  const rawHtml = marked.parse(normalized, { gfm: true, breaks: true }) as string;

  // Sanitize raw HTML against stored XSS attacks
  return DOMPurify.sanitize(rawHtml, SANITIZE_OPTIONS);
}
