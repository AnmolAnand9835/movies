import { cn } from '../../utils/cn';

export const Tabs = ({
  options = [],
  value,
  onChange,
  ariaLabel = 'Content filters',
  className,
}) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className={cn(
      'scroll-row inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-white/[0.09] bg-white/[0.025] p-1',
      className
    )}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-11 shrink-0 rounded-lg px-4 py-2 text-[11px] font-semibold transition',
            active
              ? 'bg-white/[0.11] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
              : 'text-muted hover:bg-white/[0.045] hover:text-white'
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default Tabs;
