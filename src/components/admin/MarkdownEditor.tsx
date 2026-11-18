'use client';

import { useState, useRef } from 'react';
import { Bold, Italic, Underline, List, Quote, Heading2, Eye, Edit3 } from 'lucide-react';
import { renderMarkdown } from '@/lib/markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  required?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write here...',
  rows = 6,
  required = false,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Robust selection wrapper that handles trailing spaces from double-clicking words
  const insertSyntax = (before: string, after: string = before, defaultText: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    
    const rawSelected = hasSelection ? value.substring(start, end) : defaultText;
    const leadingSpaces = rawSelected.match(/^\s*/)?.[0] || '';
    const trailingSpaces = rawSelected.match(/\s*$/)?.[0] || '';
    const trimmed = rawSelected.trim() || defaultText;

    const replacement = `${leadingSpaces}${before}${trimmed}${after}${trailingSpaces}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorStart = start + leadingSpaces.length + before.length;
      const newCursorEnd = newCursorStart + trimmed.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    });
  };

  const handleBold = () => insertSyntax('**', '**', 'bold text');
  const handleItalic = () => insertSyntax('*', '*', 'italic text');
  const handleUnderline = () => insertSyntax('<u>', '</u>', 'underlined text');
  const handleQuote = () => insertSyntax('\n> ', '', 'quote');
  const handleList = () => insertSyntax('\n- ', '', 'bullet item');
  const handleHeading = () => insertSyntax('\n### ', '', 'Heading');

  // Support standard keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleBold();
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleItalic();
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        handleUnderline();
      }
    }
  };

  const previewHtml = renderMarkdown(value);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141e] overflow-hidden shadow-sm">
      
      {/* GitHub-Style Toolbar & Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-100/80 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
        
        {/* Write / Preview Tab Switcher */}
        <div className="flex items-center gap-1 bg-zinc-200/90 dark:bg-zinc-800/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              tab === 'write'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              tab === 'preview'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Formatting Buttons */}
        {tab === 'write' && (
          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleBold}
              className="px-2.5 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 font-black text-xs transition-colors flex items-center gap-1"
              title="Bold (Ctrl+B) -> **text**"
            >
              <Bold className="w-3.5 h-3.5 stroke-[3]" />
              <span>Bold</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleItalic}
              className="px-2.5 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 font-bold text-xs italic transition-colors flex items-center gap-1"
              title="Italic (Ctrl+I) -> *text*"
            >
              <Italic className="w-3.5 h-3.5" />
              <span>Italic</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUnderline}
              className="px-2.5 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 font-bold text-xs underline transition-colors flex items-center gap-1"
              title="Underline (Ctrl+U) -> <u>text</u>"
            >
              <Underline className="w-3.5 h-3.5" />
              <span>Underline</span>
            </button>

            <span className="text-zinc-300 dark:text-zinc-700 mx-0.5">|</span>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleHeading}
              className="p-1.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
              title="Heading (### Heading)"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleQuote}
              className="p-1.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
              title="Quote (> quote)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleList}
              className="p-1.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
              title="Bullet list (- item)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Editor Body */}
      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-4 text-sm bg-transparent border-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-0 leading-relaxed font-sans resize-y"
        />
      ) : (
        <div
          className="p-5 min-h-[180px] text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed markdown-preview bg-zinc-50/80 dark:bg-zinc-900/40"
          dangerouslySetInnerHTML={{
            __html: previewHtml || '<p style="color: #71717a; font-style: italic;">Nothing to preview yet. Switch to Write tab to type.</p>',
          }}
        />
      )}

    </div>
  );
}
