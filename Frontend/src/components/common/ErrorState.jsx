import { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, RefreshCw, WifiOff } from 'lucide-react';
import { getApiErrorMessage } from '../../api/client';
import { cn } from '../../utils/cn';

export const ErrorState = ({ error, onRetry, compact = false, className }) => {
  const [remaining, setRemaining] = useState(error?.retryAfter || 0);

  useEffect(() => {
    setRemaining(error?.retryAfter || 0);
  }, [error]);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  const isNetworkError =
    error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT';
  const isRateLimited = error?.status === 429;
  const Icon = isRateLimited ? Clock3 : isNetworkError ? WifiOff : AlertTriangle;
  const title = isRateLimited
    ? 'Slow down for a moment'
    : isNetworkError
      ? 'Backend connection problem'
      : 'Something went wrong';

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-rose-200/10 bg-rose-950/10 px-6 text-center',
        compact ? 'py-8' : 'py-14',
        className
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-200/15 bg-rose-400/10 text-rose-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-mist">{title}</h3>
      <p className="mt-1.5 max-w-lg text-xs leading-5 text-muted">
        {getApiErrorMessage(error)}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={remaining > 0}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {remaining > 0
            ? `Retry in ${remaining >= 60 ? `${Math.ceil(remaining / 60)} min` : `${remaining}s`}`
            : 'Try again'}
        </button>
      ) : null}
    </div>
  );
};

export default ErrorState;
