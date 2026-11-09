import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkX, ShieldCheck, Trash2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import MediaGrid from '../components/movies/MediaGrid';
import EmptyState from '../components/common/EmptyState';
import { useWatchlist } from '../hooks/useWatchlist';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MyList = () => {
  useDocumentTitle('My List');
  const { items, count, clear } = useWatchlist();
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleClear = () => {
    clear();
    setConfirmingClear(false);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-7 px-5 pb-20 pt-6 sm:px-8 xl:px-12">
      <PageHeader
        eyebrow="Your private shelf"
        title="My List"
        description="Everything you have bookmarked, kept together on this device. Add or remove titles from any poster, detail page or featured slide."
        icon={Bookmark}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-muted">
          <p className="font-semibold text-white">
            {count} {count === 1 ? 'title saved' : 'titles saved'}
          </p>
          <p className="mt-0.5">Local to this browser</p>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.022] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-mist">Saved only in this browser</p>
            <p className="mt-0.5 text-[10px] leading-5 text-muted">
              My List is not synced to an account or across devices. Clearing browser storage
              removes it.
            </p>
          </div>
        </div>

        {count > 0 && !confirmingClear ? (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.12] px-3 text-[11px] font-semibold text-muted transition hover:border-rose-300/30 hover:text-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear list
          </button>
        ) : null}
      </div>

      {confirmingClear && count > 0 ? (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-rose-200/15 bg-rose-950/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          role="alert"
        >
          <div>
            <p className="text-xs font-semibold text-rose-50">
              Remove all {count} saved {count === 1 ? 'title' : 'titles'}?
            </p>
            <p className="mt-0.5 text-[10px] text-rose-100/60">This cannot be undone.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="inline-flex h-9 items-center rounded-lg border border-white/[0.12] px-3 text-[11px] font-semibold text-muted transition hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-rose-200 px-3 text-[11px] font-bold text-[#251018] transition hover:bg-rose-100"
            >
              <BookmarkX className="h-3.5 w-3.5" aria-hidden="true" />
              Yes, clear list
            </button>
          </div>
        </div>
      ) : null}

      <section aria-label="Saved titles">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
              Watch later
            </p>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.035em] text-mist sm:text-[25px]">
              Saved titles
            </h2>
          </div>
          {count > 0 ? (
            <p className="hidden text-right text-[11px] leading-5 text-muted sm:block">
              Newest saves first
            </p>
          ) : null}
        </div>

        {items.length ? (
          <MediaGrid items={items} skeletonCount={0} />
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Your list is waiting"
            message="Bookmark a film, series or anime title and it will appear here. Your list stays on this device."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  to="/movies"
                  className="inline-flex h-10 items-center rounded-xl bg-accent px-4 text-xs font-bold text-[#111B2A] transition hover:bg-accent-strong"
                >
                  Browse movies
                </Link>
                <Link
                  to="/tv"
                  className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white/[0.05] px-4 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Browse TV
                </Link>
                <Link
                  to="/anime"
                  className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white/[0.05] px-4 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Browse anime
                </Link>
              </div>
            }
          />
        )}
      </section>
    </div>
  );
};

export default MyList;
