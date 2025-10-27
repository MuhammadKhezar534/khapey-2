import type React from "react"
import { Suspense, lazy, type ComponentType } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function lazyImport<T extends ComponentType<any>, I extends { [K2 in K]: T }, K extends keyof I>(
  factory: () => Promise<I>,
  name: K,
  LoadingComponent: React.ReactNode = (
    <div className="w-full h-[200px] flex items-center justify-center">
      <Skeleton className="h-[200px] w-full" />
    </div>
  ),
): I {
  const LazyComponent = lazy(async () => {
    const module = await factory()
    return { default: module[name] }
  })

  return {
    [name]: (props: React.ComponentProps<T>) => (
      <Suspense fallback={LoadingComponent}>
        <LazyComponent {...props} />
      </Suspense>
    ),
  } as I
}
