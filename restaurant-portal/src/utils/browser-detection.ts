/**
 * Browser detection utility to apply specific fixes for different browsers
 */

export function detectBrowser() {
  if (typeof window === "undefined") return null

  const userAgent = window.navigator.userAgent.toLowerCase()

  // iOS detection
  const isIOS = /iphone|ipad|ipod/.test(userAgent)

  // Safari detection
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)

  // Chrome detection
  const isChrome = userAgent.indexOf("chrome") > -1

  // Firefox detection
  const isFirefox = userAgent.indexOf("firefox") > -1

  // Edge detection
  const isEdge = userAgent.indexOf("edg") > -1

  return {
    isIOS,
    isSafari,
    isChrome: isChrome && !isEdge,
    isFirefox,
    isEdge,
  }
}

export function applyBrowserFixes() {
  const browser = detectBrowser()
  if (!browser) return

  // Apply iOS specific fixes
  if (browser.isIOS) {
    document.documentElement.classList.add("ios-device")

    // Fix for 100vh issue on iOS
    const setVhVariable = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    setVhVariable()
    window.addEventListener("resize", setVhVariable)

    // Detect keyboard open/close
    const originalHeight = window.innerHeight
    window.addEventListener("resize", () => {
      if (window.innerHeight < originalHeight * 0.75) {
        document.body.classList.add("keyboard-open")
      } else {
        document.body.classList.remove("keyboard-open")
      }
    })
  }

  // Apply Safari specific fixes
  if (browser.isSafari) {
    document.documentElement.classList.add("safari-browser")

    // Fix for Safari's elastic scrolling
    document.body.style.overscrollBehavior = "none"
  }
}
