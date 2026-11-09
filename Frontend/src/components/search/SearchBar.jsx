import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  onClear,
  autoFocus = false,
  className = '',
}) => (
  <form
    role="search"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
    className={`flex h-14 items-center gap-3 rounded-2xl border border-white/[0.13] bg-white/[0.045] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus-within:border-accent/50 focus-within:bg-white/[0.06] sm:h-16 sm:px-5 ${className}`}
  >
    <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
    <label htmlFor="search-page-input" className="sr-only">
      Search CineAtlas
    </label>
    <input
      id="search-page-input"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoFocus={autoFocus}
      enterKeyHint="search"
      placeholder="Search movies, TV, people..."
      className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-[#77808b] sm:text-lg"
    />
    {value ? (
      <button
        type="button"
        onClick={onClear}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white/10 hover:text-white"
        aria-label="Clear search"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    ) : null}
    <button
      type="submit"
      className="hidden h-10 shrink-0 items-center rounded-xl bg-accent px-5 text-xs font-bold text-[#111B2A] transition hover:bg-accent-strong sm:inline-flex"
    >
      Search
    </button>
  </form>
);

export default SearchBar;
