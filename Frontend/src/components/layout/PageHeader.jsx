import { cn } from '../../utils/cn';

export const PageHeader = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  className,
}) => (
  <section
    className={cn(
      'noise relative overflow-hidden rounded-3xl border border-line bg-[linear-gradient(120deg,rgba(27,42,64,0.92),rgba(13,21,34,0.96))] px-6 py-10 sm:px-9 sm:py-12',
      className
    )}
  >
    <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#5b78b8]/10 blur-3xl" />
    {Icon ? (
      <Icon
        className="pointer-events-none absolute -right-4 bottom-[-28px] h-48 w-48 text-white/[0.025]"
        aria-hidden="true"
      />
    ) : null}

    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-accent/85">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-xl text-xs leading-5 text-muted sm:text-sm sm:leading-6">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="relative shrink-0">{children}</div> : null}
    </div>
  </section>
);

export default PageHeader;
