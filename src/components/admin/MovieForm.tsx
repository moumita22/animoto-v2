'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Star,
  Film,
  Lightbulb,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Edit3,
} from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import { renderMarkdown } from '@/lib/markdown';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

interface MovieFormProps {
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    year: number;
    genre: string;
    language: string;
    director: string;
    rating: number;
    posterUrl: string;
    backdropUrl: string;
    trailerUrl?: string | null;
    synopsis: string;
    lifeLessons: string;
    featured: boolean;
    published: boolean;
  };
  isEdit?: boolean;
}

export default function MovieForm({ initialData, isEdit = false }: MovieFormProps) {
  // Form states
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [genre, setGenre] = useState(initialData?.genre || 'Drama');
  const [language, setLanguage] = useState(initialData?.language || 'English');
  const [director, setDirector] = useState(initialData?.director || '');
  const [rating, setRating] = useState(initialData?.rating || 8.5);
  const [posterUrl, setPosterUrl] = useState(initialData?.posterUrl || '');
  const [backdropUrl, setBackdropUrl] = useState(initialData?.backdropUrl || '');
  const [trailerUrl, setTrailerUrl] = useState(initialData?.trailerUrl || '');
  const [synopsis, setSynopsis] = useState(initialData?.synopsis || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [published, setPublished] = useState(initialData?.published ?? true);

  // Lessons array
  let parsedLessons: string[] = [''];
  if (initialData?.lifeLessons) {
    try {
      parsedLessons = JSON.parse(initialData.lifeLessons);
    } catch {
      parsedLessons = [initialData.lifeLessons];
    }
  }
  const [lessons, setLessons] = useState<string[]>(parsedLessons.length > 0 ? parsedLessons : ['']);
  const [lessonsTab, setLessonsTab] = useState<'write' | 'preview'>('write');

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);
  const [error, setError] = useState('');

  // Handle title change and auto slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Upload file helper
  const handleFileUpload = async (file: File, target: 'poster' | 'backdrop') => {
    const formData = new FormData();
    formData.append('file', file);

    if (target === 'poster') setUploadingPoster(true);
    else setUploadingBackdrop(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === 'poster') setPosterUrl(data.url);
        else setBackdropUrl(data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload error');
    } finally {
      if (target === 'poster') setUploadingPoster(false);
      else setUploadingBackdrop(false);
    }
  };

  // Lesson helpers
  const handleLessonChange = (index: number, value: string) => {
    const updated = [...lessons];
    updated[index] = value;
    setLessons(updated);
  };

  const addLesson = () => {
    setLessons([...lessons, '']);
  };

  const removeLesson = (index: number) => {
    if (lessons.length === 1) return;
    setLessons(lessons.filter((_, idx) => idx !== index));
  };

  // Selection-aware formatting for individual learnings
  const formatLessonSelection = (index: number, before: string, after: string = before) => {
    const el = document.getElementById(`lesson-textarea-${index}`) as HTMLTextAreaElement | null;
    const val = lessons[index] || '';

    if (!el) {
      handleLessonChange(index, `${val} ${before}highlighted text${after}`.trim());
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const hasSelection = start !== end;
    
    const rawSelected = hasSelection ? val.substring(start, end) : 'highlighted text';
    const leadingSpaces = rawSelected.match(/^\s*/)?.[0] || '';
    const trailingSpaces = rawSelected.match(/\s*$/)?.[0] || '';
    const trimmed = rawSelected.trim() || 'highlighted text';

    const replacement = `${leadingSpaces}${before}${trimmed}${after}${trailingSpaces}`;
    const nextVal = val.substring(0, start) + replacement + val.substring(end);
    handleLessonChange(index, nextVal);

    requestAnimationFrame(() => {
      el.focus();
      const newCursorStart = start + leadingSpaces.length + before.length;
      const newCursorEnd = newCursorStart + trimmed.length;
      el.setSelectionRange(newCursorStart, newCursorEnd);
    });
  };

  // Handle hotkeys on learning textareas
  const handleLessonKeyDown = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        formatLessonSelection(index, '**');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        formatLessonSelection(index, '*');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        formatLessonSelection(index, '<u>', '</u>');
      }
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanLessons = lessons.map((l) => l.trim()).filter((l) => l.length > 0);

    const payload = {
      title,
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      year: Number(year),
      genre,
      language,
      director,
      rating: Number(rating),
      posterUrl,
      backdropUrl: backdropUrl || posterUrl,
      trailerUrl: trailerUrl.trim() || null,
      synopsis,
      lifeLessons: JSON.stringify(cleanLessons),
      featured,
      published,
    };

    try {
      const url = isEdit ? `/api/admin/movies/${initialData?.id}` : '/api/admin/movies';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save review');
      }
    } catch {
      setError('Connection error. Could not save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3">
            {isEdit && initialData?.slug && (
              <Link
                href={`/reviews/${initialData.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400"
              >
                <span>View Live Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <span className="text-xs text-zinc-400">
              {isEdit ? 'Editing Movie Review' : 'Create New Movie Review'}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Card 1: Basic Information */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-500" />
              1. Film Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Movie Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Pursuit of Happyness"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Slug (URL) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    URL Slug (For SEO &amp; Direct Link) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[11px] text-amber-500 hover:underline"
                  >
                    {autoSlug ? 'Auto-generating from title (Click to edit)' : 'Manual editing (Click to auto)'}
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-400">
                  <span>/reviews/</span>
                  <input
                    type="text"
                    required
                    disabled={autoSlug}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="the-pursuit-of-happyness"
                    className="flex-1 bg-transparent text-zinc-900 dark:text-white focus:outline-none font-mono disabled:opacity-75"
                  />
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Release Year *
                </label>
                <input
                  type="number"
                  required
                  min={1900}
                  max={2099}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Director */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Director Name *
                </label>
                <input
                  type="text"
                  required
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="e.g. Christopher Nolan"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Genre *
                </label>
                <input
                  type="text"
                  required
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Sci-Fi, Adventure, Drama"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Language *
                </label>
                <input
                  type="text"
                  required
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. English, Hindi, Korean, Japanese"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Rating Slider & Number */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Your Score (1.0 to 10.0)
                  </label>
                  <span className="text-sm font-black text-amber-500 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500" />
                    {Number(rating).toFixed(1)} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

            </div>
          </section>

          {/* Card 2: 2 Images (Poster + Backdrop) */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              2. Movie Images (Poster &amp; Backdrop)
            </h2>
            <p className="text-xs text-zinc-400">
              Paste an external image URL OR upload directly from your computer (saved to your server for ₹0 cloud cost).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Poster Image */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Poster Image (Vertical 2:3) *
                </label>
                <input
                  type="text"
                  required
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://... or upload below"
                  className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
                <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 text-xs cursor-pointer text-zinc-500 hover:text-amber-500 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPoster ? 'Uploading...' : 'Upload Poster File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'poster');
                    }}
                  />
                </label>
                {posterUrl && (
                  <div className="w-20 h-28 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
                    <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Backdrop Image */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Backdrop Banner (Horizontal 16:9 or 21:9)
                </label>
                <input
                  type="text"
                  value={backdropUrl}
                  onChange={(e) => setBackdropUrl(e.target.value)}
                  placeholder="Leave empty to use poster"
                  className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
                <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 text-xs cursor-pointer text-zinc-500 hover:text-amber-500 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBackdrop ? 'Uploading...' : 'Upload Backdrop File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'backdrop');
                    }}
                  />
                </label>
                {backdropUrl && (
                  <div className="w-36 h-20 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
                    <img src={backdropUrl} alt="Backdrop preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Card 3: Official Trailer (YouTube Embed) */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-500" />
                3. Official Trailer (YouTube URL)
              </h2>
              <span className="text-xs text-zinc-400">Optional</span>
            </div>
            <p className="text-xs text-zinc-400">
              Paste any YouTube video link (e.g. <code className="text-amber-500">https://www.youtube.com/watch?v=...</code> or <code className="text-amber-500">https://youtu.be/...</code>). It will cleanly embed on the review page.
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                YouTube URL
              </label>
              <input
                type="url"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Live Trailer Preview */}
            {getYouTubeEmbedUrl(trailerUrl) ? (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                <p className="text-xs font-semibold text-zinc-500 mb-2">Live Trailer Preview:</p>
                <div className="relative aspect-video max-w-md rounded-2xl overflow-hidden bg-black shadow-md border border-zinc-200 dark:border-zinc-800">
                  <iframe
                    src={getYouTubeEmbedUrl(trailerUrl)!}
                    title="Trailer Preview"
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            ) : trailerUrl.trim() ? (
              <p className="text-xs text-amber-500">
                ⚠️ Please enter a valid YouTube video link (e.g. https://www.youtube.com/watch?v=...)
              </p>
            ) : null}
          </section>

          {/* Card 4: Synopsis & Review (WITH GITHUB-STYLE MARKDOWN EDITOR & PREVIEW) */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                4. Plot &amp; Review Write-up *
              </h2>
              <span className="text-xs text-zinc-400">
                Supports **Bold**, *Italic*, &lt;u&gt;Underline&lt;/u&gt;, Quotes, Lists
              </span>
            </div>

            <MarkdownEditor
              value={synopsis}
              onChange={setSynopsis}
              placeholder="Write your review and critical analysis here... (Highlight any text and click Bold, Italic, or Underline, or press Ctrl+B)"
              rows={8}
              required
            />
          </section>

          {/* Card 5: Key Learnings & Takeaways Manager (WITH FORMATTING & PREVIEW) */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-amber-500/30 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  5. Key Learnings &amp; Takeaways *
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Wisdom and insights from this movie (Highlight text &amp; click Bold / Italic / Underline, or press Ctrl+B)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Write / Preview Tab Switcher for Learnings */}
                <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-800/80 p-0.5 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setLessonsTab('write')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                      lessonsTab === 'write'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Write</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonsTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                      lessonsTab === 'preview'
                        ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>

                {lessonsTab === 'write' && (
                  <button
                    type="button"
                    onClick={addLesson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Learning
                  </button>
                )}
              </div>
            </div>

            {lessonsTab === 'write' ? (
              <div className="space-y-4">
                {lessons.map((lesson, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      {/* Mini Toolbar for each learning */}
                      <div className="flex items-center gap-1 text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="text-[11px] font-semibold text-zinc-400 mr-1">Highlight &amp; Format:</span>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => formatLessonSelection(idx, '**')}
                          className="px-2.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 font-black text-xs transition-colors"
                          title="Bold (Ctrl+B) -> **text**"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => formatLessonSelection(idx, '*')}
                          className="px-2.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 italic font-bold text-xs transition-colors"
                          title="Italic (Ctrl+I) -> *text*"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => formatLessonSelection(idx, '<u>', '</u>')}
                          className="px-2.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 underline font-bold text-xs transition-colors"
                          title="Underline (Ctrl+U) -> <u>text</u>"
                        >
                          U
                        </button>
                      </div>

                      {lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLesson(idx)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                          title="Remove learning"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <textarea
                      id={`lesson-textarea-${idx}`}
                      rows={2}
                      required
                      value={lesson}
                      onChange={(e) => handleLessonChange(idx, e.target.value)}
                      onKeyDown={(e) => handleLessonKeyDown(idx, e)}
                      placeholder="e.g. **Protect your dream:** Never let anyone tell you what you can't do."
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y font-sans leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Preview Mode for Learnings */
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                {lessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed markdown-preview"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(lesson || '*Empty learning*'),
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Card 6: Publishing Toggles & Action */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                />
                <span>Feature in Hero Spotlight Banner</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                />
                <span>Published (Visible on site)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Review' : 'Publish Review'}</span>
            </button>

          </section>

        </form>

      </div>
    </div>
  );
}
