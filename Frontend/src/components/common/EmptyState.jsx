import { Film } from 'lucide-react';
import { cn } from '../../utils/cn';

export const EmptyState = ({
  icon: Icon = Film,
  title = 'Nothing here yet',
  message = 'Try a different filter or check back soon.',
  action = null,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-14 text-center',
      className
    )}
  >
    <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-accent">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
    <h3 className="mt-4 text-base font-semibold text-mist">{title}</h3>
    <p className="mt-1.5 max-w-md text-xs leading-5 text-muted sm:text-sm">{message}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export default EmptyState;
