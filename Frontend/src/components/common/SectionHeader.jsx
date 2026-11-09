import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  actionTo,
  actionLabel = 'View all',
  actions = null,
  className,
  id,
}) => (
  <div
    className={cn(
      'mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
      className
    )}
  >
    <div>
      {eyebrow ? (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="text-[21px] font-semibold tracking-[-0.035em] text-mist sm:text-[25px]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-2xl text-xs leading-5 text-muted sm:text-sm">
          {description}
        </p>
      ) : null}
    </div>
    {actionTo || actions ? (
      <div className="flex items-center gap-2">
        {actions}
        {actionTo ? (
          <Link
            to={actionTo}
            className="group inline-flex w-fit items-center gap-1.5 pb-0.5 text-xs font-semibold text-[#C1CAD8] transition hover:text-white"
          >
            {actionLabel}
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    ) : null}
  </div>
);

export default SectionHeader;
