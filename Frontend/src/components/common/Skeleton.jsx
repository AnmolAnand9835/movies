import { cn } from '../../utils/cn';

const Skeleton = ({ className }) => (
  <div className={cn('skeleton rounded-xl', className)} aria-hidden="true" />
);

export const SkeletonCard = ({ className }) => (
  <div className={cn('overflow-hidden rounded-2xl border border-line bg-panel p-0', className)}>
    <Skeleton className="aspect-[2/3] w-full rounded-none" />
    <div className="space-y-2 p-3">
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 10, className }) => (
  <div
    className={cn(
      'grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5',
      className
    )}
    aria-hidden="true"
  >
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonRow = ({ count = 6 }) => (
  <div className="scroll-row flex gap-3 overflow-hidden" aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="w-[150px] shrink-0 sm:w-[170px] md:w-[185px]">
        <SkeletonCard />
      </div>
    ))}
  </div>
);

export const SkeletonHero = () => (
  <section
    className="relative flex min-h-[clamp(440px,72svh,720px)] items-end overflow-hidden border-b border-line"
    aria-busy="true"
    aria-label="Loading featured title"
  >
    <div className="absolute inset-0 skeleton opacity-60" />
    <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-16 pt-28 sm:px-8 xl:px-12">
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-14 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  </section>
);

export const SkeletonDetails = () => (
  <div className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 xl:px-12" aria-busy="true">
    <Skeleton className="mt-6 h-[340px] w-full rounded-3xl sm:h-[440px]" />
    <div className="relative z-10 -mt-28 grid gap-6 px-4 sm:px-8 md:grid-cols-[230px_1fr]">
      <Skeleton className="aspect-[2/3] w-40 rounded-2xl md:w-full" />
      <div className="space-y-4 pt-24 md:pt-32">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </div>
    </div>
    <div className="mt-12 space-y-4">
      <Skeleton className="h-6 w-44" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="w-24 shrink-0 space-y-2">
            <Skeleton className="aspect-square w-24 rounded-full" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Skeleton;
