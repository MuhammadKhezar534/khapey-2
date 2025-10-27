import { lazyImport } from "@/utils/lazy-import"

export const { CreateDiscountDrawer } = lazyImport(() => import("./create-discount-drawer"), "CreateDiscountDrawer")
