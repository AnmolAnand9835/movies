import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const toneStyles = {
  success: 'border-emerald-300/20 text-emerald-100',
  error: 'border-rose-300/20 text-rose-100',
  default: 'border-white/15 text-white',
};

const toneIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  default: Info,
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const notify = useCallback((message, tone = 'default') => {
    window.clearTimeout(timerRef.current);
    setToast({ message, tone, id: Date.now() });
    timerRef.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    []
  );

  const value = useMemo(() => ({ notify }), [notify]);
  const Icon = toast ? toneIcons[toast.tone] || Info : Info;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[120] flex justify-center px-4"
      >
        {toast ? (
          <div
            key={toast.id}
            role="status"
            className={`animate-fade-up pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full border bg-[#1B2940] px-4 py-2.5 text-xs font-semibold shadow-2xl ${toneStyles[toast.tone] || toneStyles.default}`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="leading-5">{toast.message}</span>
            <button
              type="button"
              onClick={dismiss}
              className="ml-1 rounded-full p-0.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
