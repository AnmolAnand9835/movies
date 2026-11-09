import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, Menu, Play, Search, X } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useToast } from '../../providers/ToastProvider';
import { useWatchlist } from '../../hooks/useWatchlist';
import MobileMenu from './MobileMenu';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/movies', label: 'Movies' },
  { to: '/tv', label: 'TV Shows' },
  { to: '/anime', label: 'Anime' },
];

const SearchField = ({ value, onChange, onSubmit, inputRef, className }) => (
  <form
    role="search"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
    className={cn(
      'flex h-10 items-center gap-2.5 rounded-full border border-white/[0.13] bg-white/[0.045] px-4 transition focus-within:border-white/30',
      className
    )}
  >
    <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
    <input
      ref={inputRef}
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search movies, TV..."
      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#77808b]"
      aria-label="Search movies, TV shows and people"
    />
    <kbd className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-muted xl:block">
      Ctrl / ⌘ K
    </kbd>
  </form>
);

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [focusMobileSearch, setFocusMobileSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const desktopSearchRef = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { count } = useWatchlist();

  useEffect(() => {
    if (pathname !== '/search') return;
    const params = new URLSearchParams(search);
    setSearchValue(params.get('q') || '');
  }, [pathname, search]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();

      if (isDesktop) {
        desktopSearchRef.current?.focus();
      } else {
        setFocusMobileSearch(true);
        setMobileOpen(true);
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [isDesktop]);

  const submitSearch = () => {
    const query = searchValue.trim();

    if (query.length < 2) {
      notify('Enter at least 2 characters to search.', 'default');
      return;
    }

    setMobileOpen(false);
    setFocusMobileSearch(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const openMobileMenu = (focusSearch = false) => {
    setFocusMobileSearch(focusSearch);
    setMobileOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setFocusMobileSearch(false);
  };

  const navLinkClass = ({ isActive }) =>
    cn(
      'relative rounded-xl px-4 py-2.5 text-sm font-semibold transition',
      isActive
        ? 'bg-white/[0.07] text-white'
        : 'text-muted hover:bg-white/[0.04] hover:text-white'
    );

  const underline = ({ isActive }) =>
    isActive ? (
      <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent" />
    ) : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgba(10,16,27,0.88)] shadow-[0_1px_0_rgba(190,207,232,0.035)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-12">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg"
            aria-label="CineAtlas home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-accent shadow-soft-accent">
              <Play className="ml-0.5 h-4 w-4 fill-[#111B2A] text-[#111B2A]" aria-hidden="true" />
            </span>
            <span className="text-[17px] font-extrabold tracking-[0.12em] text-white">
              CINEATLAS
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {underline({ isActive })}
                  </>
                )}
              </NavLink>
            ))}
            <NavLink to="/my-list" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <Bookmark className="mr-1.5 inline h-4 w-4 align-[-3px]" aria-hidden="true" />
                  My List
                  {count > 0 ? (
                    <span className="ml-1.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                      {count}
                    </span>
                  ) : null}
                  {underline({ isActive })}
                </>
              )}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <SearchField
              value={searchValue}
              onChange={setSearchValue}
              onSubmit={submitSearch}
              inputRef={desktopSearchRef}
              className="hidden w-[250px] lg:flex xl:w-[300px]"
            />

            <button
              type="button"
              onClick={() => openMobileMenu(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-[#c5c9ce] transition hover:bg-white/[0.08] lg:hidden"
              aria-label="Open search"
            >
              <Search className="h-[19px] w-[19px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => (mobileOpen ? closeMobileMenu() : openMobileMenu(false))}
              className="grid h-10 w-10 place-items-center rounded-full text-[#c5c9ce] transition hover:bg-white/[0.08] md:hidden"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={closeMobileMenu}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={submitSearch}
        autoFocusSearch={focusMobileSearch}
      />
    </>
  );
};

export default Navbar;
