import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { Bookmark, Film, Home, Play, Search, Sparkles, Tv, X, ArrowRight } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import { useWatchlist } from '../../hooks/useWatchlist';
import { cn } from '../../utils/cn';

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/movies', label: 'Movies', icon: Film },
  { to: '/tv', label: 'TV Shows', icon: Tv },
  { to: '/anime', label: 'Anime', icon: Sparkles },
  { to: '/my-list', label: 'My List', icon: Bookmark },
];

const MobileMenu = ({
  open,
  onClose,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  autoFocusSearch,
}) => {
  const containerRef = useDialog(open, onClose);
  const searchRef = useRef(null);
  const { count } = useWatchlist();

  useEffect(() => {
    if (!open || !autoFocusSearch) return undefined;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open, autoFocusSearch]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 xl:hidden">
      <div className="absolute inset-0 bg-[#03070e]/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={containerRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="animate-fade-up relative flex h-full flex-col overflow-y-auto border-t border-white/[0.06] bg-[rgba(10,16,27,0.97)] px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] backdrop-blur-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
            Navigate CineAtlas
          </p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white"
            aria-label="Close navigation menu"
            data-autofocus
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
          className="mb-6 flex h-14 items-center gap-3 rounded-xl border border-white/[0.13] bg-white/[0.05] px-4 focus-within:border-white/30"
        >
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search titles, people..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted"
            aria-label="Search movies, TV shows and people"
          />
          <button
            type="submit"
            className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-[#111B2A]"
            aria-label="Submit search"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <nav className="space-y-1.5" aria-label="Mobile navigation links">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition',
                    isActive
                      ? 'border-accent/25 bg-accent/10 text-white'
                      : 'border-transparent text-muted hover:bg-white/[0.04] hover:text-white'
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="flex-1">{link.label}</span>
                {link.to === '/my-list' && count > 0 ? (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    {count}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-8">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              <Play className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
              Discovery, not playback
            </div>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              CineAtlas surfaces TMDB metadata and trailer references. It does not stream full
              titles.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileMenu;
