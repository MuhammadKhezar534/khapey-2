"use client"

import { useEffect } from "react"

export function HideScrollbar() {
  useEffect(() => {
    // Create a style element
    const style = document.createElement("style")

    // Add CSS to hide scrollbars - more aggressive approach
    style.textContent = `
    * {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }

    html, body {
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Force no scrollbars even for textarea and select elements */
    textarea::-webkit-scrollbar,
    select::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
  `

    // Append the style to the document head
    document.head.appendChild(style)

    // Clean up
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}
