'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Plus,
  Eye,
  EyeOff,
  Star,
  Globe,
  Edit,
  Trash2,
  ExternalLink,
  LogOut,
  Link as LinkIcon,
  KeyRound,
  Lock,
  X,
  CheckCircle2,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import type { MovieReview } from '@prisma/client';

export default function AdminDashboardView({
  movies: initialMovies,
  totalReviews = 0,
  publishedCount,
  avgRating,
  currentPage = 1,
  totalPages = 1,
}: {
  movies: MovieReview[];
  totalReviews?: number;
  publishedCount: number;
  avgRating: string;
  currentPage?: number;
  totalPages?: number;
}) {
  const [moviesList, setMoviesList] = useState(initialMovies);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Change Password Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleOpenPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Password changed successfully!');
        setTimeout(() => {
          setShowPasswordModal(false);
        }, 1500);
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch {
      setPasswordError('Network error. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete the review for "${title}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/movies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMoviesList((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert('Failed to delete movie review.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-[#090a0f]/90 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-amber-500/20">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  Animoto
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    Admin
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleOpenPasswordModal}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 border border-zinc-200 dark:border-zinc-700 transition-colors"
                title="Change Password"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Change Password</span>
              </button>

              <ThemeToggle />

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Reviews</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-1">{totalReviews || moviesList.length}</h3>
              <p className="text-[11px] text-zinc-500 mt-1">Target: 100 movies</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Film className="w-6 h-6" />
            </div>
          </div>

          {/* PUBLISHED METRIC */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141e] border border-emerald-500/30 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Published Reviews</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-1">
                {publishedCount}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">
                {Math.max(0, (totalReviews || moviesList.length) - publishedCount)} draft{(totalReviews || moviesList.length) - publishedCount === 1 ? '' : 's'} remaining
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Average Score</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-1">★ {avgRating}</h3>
              <p className="text-[11px] text-zinc-500 mt-1">Across all published films</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
          </div>

        </div>

        {/* Section Bar: Title + Add Movie Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Manage Movie Reviews
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Publish new reviews, edit learnings, or toggle homepage spotlight
            </p>
          </div>

          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add New Movie Review
          </Link>
        </div>

        {/* Reviews Table */}
        <div className="rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Movie</th>
                  <th className="py-3.5 px-4">Live URL (Click to View)</th>
                  <th className="py-3.5 px-4">Year &amp; Genre</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {moviesList.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    
                    {/* Movie Poster & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {m.posterUrl ? (
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="w-10 h-14 object-cover rounded-lg bg-zinc-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-14 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-500">
                            <Film className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/reviews/${m.slug}`}
                            target="_blank"
                            className="font-bold text-zinc-900 dark:text-white hover:text-amber-500 transition-colors line-clamp-1"
                          >
                            {m.title}
                          </Link>
                          <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                            Dir. {m.director}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Direct Clickable Live URL Column */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/reviews/${m.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all group"
                        title="Open review page in new tab"
                      >
                        <LinkIcon className="w-3 h-3 text-amber-500" />
                        <span>/reviews/{m.slug}</span>
                        <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      </Link>
                    </td>

                    {/* Year & Genre */}
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                      <p className="font-semibold">{m.year}</p>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[150px]">{m.genre}</p>
                    </td>

                    {/* Language */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <Globe className="w-3 h-3 text-amber-500" />
                        {m.language}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {m.rating.toFixed(1)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {m.featured && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                            Spotlight
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          m.published
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {m.published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/edit/${m.id}`}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Edit Review"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(m.id, m.title)}
                          disabled={deletingId === m.id}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing Page <span className="font-semibold text-zinc-900 dark:text-white">{currentPage}</span> of{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">{totalPages}</span> ({totalReviews} total reviews)
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={currentPage > 1 ? `/admin?page=${currentPage - 1}` : '#'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    currentPage > 1
                      ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-amber-500'
                      : 'opacity-40 pointer-events-none border-zinc-200 dark:border-zinc-800 text-zinc-400'
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={currentPage < totalPages ? `/admin?page=${currentPage + 1}` : '#'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    currentPage < totalPages
                      ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-amber-500'
                      : 'opacity-40 pointer-events-none border-zinc-200 dark:border-zinc-800 text-zinc-400'
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800 shadow-2xl relative">
            
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Change Password
                </h3>
                <p className="text-xs text-zinc-400">
                  Update your admin login password
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
