import { lazyImport } from "@/utils/lazy-import"

export const { MediaViewerModal } = lazyImport(() => import("./media-viewer-modal"), "MediaViewerModal")
