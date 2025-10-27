import { lazyImport } from "@/utils/lazy-import"

export const { ReviewDetailsDrawer } = lazyImport(() => import("./review-details-drawer"), "ReviewDetailsDrawer")
