import { lazyImport } from "@/utils/lazy-import"

export const { EditDiscountDrawer } = lazyImport(() => import("./edit-discount-drawer"), "EditDiscountDrawer")
