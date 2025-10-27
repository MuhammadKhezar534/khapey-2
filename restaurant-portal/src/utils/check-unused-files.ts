/**
 * This utility file helps identify if certain files are imported anywhere in the codebase.
 * Run this file manually to get a report on potential unused files.
 * Do NOT delete files automatically based on this script.
 */

// Files we suspect might be unused
const potentiallyUnusedFiles = [
  "app/(dashboard)/reporting/[discountId]/page-example.tsx",
  "app/(dashboard)/reporting/test/page.tsx",
  "app/(dashboard)/reporting/test-page/page.tsx",
  "components/discount/discount-cards.tsx",
  "components/style-guide/style-guide.tsx",
  "app/(dashboard)/style-guide/page.tsx",
]

/**
 * IMPORTANT: Before deleting any files, manually verify they are not:
 * 1. Accessed directly via URLs (like the style-guide pages)
 * 2. Dynamically imported (not detectable by static analysis)
 * 3. Used for reference or documentation purposes
 * 4. Part of a planned feature or future use
 */

/**
 * Manual verification steps:
 * 1. Search the entire codebase for any reference to these file names or paths
 * 2. Check for dynamic imports (import(), require()) that might reference these files
 * 3. Check routing configuration to see if pages are accessible via routes
 * 4. Verify with the team if any of these files are used for reference
 */

export {}
