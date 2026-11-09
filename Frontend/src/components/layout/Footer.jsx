import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const footerLinks = [
  { to: '/movies', label: 'Movies' },
  { to: '/tv', label: 'TV Shows' },
  { to: '/anime', label: 'Anime' },
  { to: '/my-list', label: 'My List' },
];

export const Footer = () => (
  <footer className="border-t border-white/[0.07]">
    <div className="mx-auto max-w-[1500px] px-5 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:px-8 xl:px-12">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="CineAtlas home">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent">
              <Play className="ml-0.5 h-3.5 w-3.5 fill-[#111B2A] text-[#111B2A]" aria-hidden="true" />
            </span>
            <span className="text-sm font-extrabold tracking-[0.16em] text-white">CINEATLAS</span>
          </Link>
          <p className="mt-3 text-xs leading-5 text-muted">
            A cinematic discovery experience for movies, TV shows and anime. Save titles to a
            device-local list and go straight to the details that matter.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs sm:justify-end">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-muted transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 border-t border-white/[0.07] pt-6 text-[10px] leading-5 text-muted/75 sm:flex-row sm:items-center sm:justify-between">
        <p>
          This product uses the TMDB API but is not endorsed or certified by TMDB. Metadata and
          artwork are provided by TMDB.
        </p>
        <p className="shrink-0">© {new Date().getFullYear()} CineAtlas · Discovery only</p>
      </div>
      <p className="mt-2 text-[10px] leading-5 text-muted/55">
        My List is stored in this browser only. It is not synced to an account or across devices.
        No complete film or TV playback is offered.
      </p>
    </div>
  </footer>
);

export default Footer;
