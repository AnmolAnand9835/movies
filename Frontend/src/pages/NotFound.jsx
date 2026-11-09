import { Link } from 'react-router-dom';
import { Compass, Film, Home } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const NotFound = () => {
  useDocumentTitle('Page not found');

  return (
    <div className="mx-auto flex max-w-[1500px] items-center justify-center px-5 py-16 sm:px-8 sm:py-24 xl:px-12">
      <section className="noise relative w-full max-w-3xl overflow-hidden rounded-3xl border border-line bg-[linear-gradient(135deg,#172438,#0d1624)] px-6 py-14 text-center sm:px-10">
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-8 select-none text-[120px] font-black leading-none tracking-[-0.08em] text-white/[0.025] sm:text-[180px]">
          404
        </div>

        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-accent">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
            Off the map
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
            This page slipped out of frame
          </h1>
          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-muted sm:text-sm">
            The address may be mistyped, or the page may have moved. Head back to the atlas and
            keep exploring.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <Link
              to="/"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-[#111B2A] transition hover:bg-accent-strong"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Back home
            </Link>
            <Link
              to="/movies"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.045] px-5 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
            >
              <Film className="h-4 w-4" aria-hidden="true" />
              Browse movies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
