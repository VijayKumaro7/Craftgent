/**
 * AccessibilityBar — Skip links and accessibility helpers
 * Provides keyboard navigation and screen reader support
 */
import { useState } from 'react'

export function AccessibilityBar() {
  const [showSkipLinks, setShowSkipLinks] = useState(false)

  return (
    <>
      {/* Skip to main content link - visible on focus */}
      {showSkipLinks && (
        <nav className="fixed top-0 left-0 z-[9999] bg-black/90 border-b border-white/20 p-2">
          <ul className="space-y-1">
            <li>
              <a
                href="#main-content"
                className="font-terminal text-[12px] text-blue-300 hover:text-blue-100 outline-none focus:underline"
              >
                Skip to main content
              </a>
            </li>
            <li>
              <a
                href="#sidebar"
                className="font-terminal text-[12px] text-blue-300 hover:text-blue-100 outline-none focus:underline"
              >
                Skip to sidebar
              </a>
            </li>
            <li>
              <a
                href="#chat-input"
                className="font-terminal text-[12px] text-blue-300 hover:text-blue-100 outline-none focus:underline"
              >
                Skip to chat input
              </a>
            </li>
          </ul>
        </nav>
      )}

      {/* Keyboard shortcut to show skip links */}
      <button
        onFocus={() => setShowSkipLinks(true)}
        onBlur={() => setShowSkipLinks(false)}
        className="absolute -left-full top-0 w-1 h-1 focus:left-0 focus:top-0 focus:w-auto focus:h-auto focus:p-2 focus:bg-black/90 focus:text-blue-300 focus:outline-none font-terminal text-[12px]"
        aria-label="Press Tab to show skip links"
      >
        Tab to show navigation
      </button>

      {/* ARIA live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="accessibility-announcements"
      >
        {/* Screen reader announcements go here */}
      </div>

      {/* ARIA labels helper - define main sections */}
      <main id="main-content" role="main">
        {/* Main content */}
      </main>

      {/* Sidebar accessibility */}
      <aside id="sidebar" role="complementary" aria-label="Agent sidebar">
        {/* Sidebar content */}
      </aside>

      {/* Chat input accessibility */}
      <div id="chat-input" role="region" aria-label="Chat input area">
        {/* Input content */}
      </div>
    </>
  )
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string) {
  const announcer = document.getElementById('accessibility-announcements')
  if (announcer) {
    announcer.textContent = message
  }
}

/**
 * Provide focus management
 */
export function useFocusManagement() {
  return {
    focusMainContent: () => {
      const main = document.getElementById('main-content')
      if (main) {
        main.focus()
      }
    },
    focusChatInput: () => {
      const input = document.querySelector<HTMLInputElement>('[data-focus="chat-input"]')
      if (input) {
        input.focus()
      }
    },
    focusSidebar: () => {
      const sidebar = document.getElementById('sidebar')
      if (sidebar) {
        sidebar.focus()
      }
    },
  }
}

/**
 * Announce loading states
 */
export function announceLoading(what: string) {
  announceToScreenReader(`Loading ${what}...`)
}

/**
 * Announce completion
 */
export function announceComplete(what: string) {
  announceToScreenReader(`${what} loaded`)
}

/**
 * Announce errors
 */
export function announceError(message: string) {
  announceToScreenReader(`Error: ${message}`)
}
