/**
 * ErrorBoundary — catches unhandled React errors and shows a
 * Minecraft-styled recovery screen instead of a blank white page.
 *
 * Usage: wrap the root App component in main.tsx.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev — in prod, wire to Sentry here
    console.error('[CraftAgent Error]', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          height: '100vh',
          background: 'linear-gradient(180deg,#7ec8e3 0%,#b8e4f5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Press Start 2P", monospace',
          imageRendering: 'pixelated',
        }}
      >
        {/* Dirt ground */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
          <div style={{ height: 16, background: '#5d9e32', borderTop: '4px solid #6abf38' }} />
          <div style={{ height: 32, background: '#866043' }} />
        </div>

        {/* Error panel */}
        <div
          style={{
            background: 'rgba(0,0,0,0.85)',
            border: '3px solid',
            borderColor: '#fff3 #0008 #0008 #fff3',
            padding: '32px 40px',
            textAlign: 'center',
            maxWidth: 420,
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Creeper face */}
          <div style={{ fontSize: 48, marginBottom: 20 }}>💥</div>

          <div
            style={{
              fontSize: 10,
              color: '#e02020',
              marginBottom: 16,
              lineHeight: 2,
              textShadow: '2px 2px 0 #000',
            }}
          >
            GAME CRASHED
          </div>

          <div
            style={{
              fontSize: 7,
              color: '#aaa',
              marginBottom: 24,
              lineHeight: 2.2,
              textShadow: '1px 1px 0 #000',
            }}
          >
            An unexpected error occurred.
            <br />
            Your session may be recoverable.
          </div>

          {/* Error detail — dev only */}
          {import.meta.env.DEV && this.state.error && (
            <div
              style={{
                background: '#111',
                border: '2px solid #333',
                padding: '8px 10px',
                marginBottom: 20,
                textAlign: 'left',
                fontSize: 6,
                color: '#e02020',
                fontFamily: 'monospace',
                lineHeight: 1.8,
                wordBreak: 'break-all',
              }}
            >
              {this.state.error.message}
            </div>
          )}

          <button
            onClick={this.handleReload}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 8,
              color: '#fff',
              background: '#5d9e32',
              border: '3px solid',
              borderColor: '#aef060 #2a5a08 #2a5a08 #aef060',
              padding: '10px 24px',
              cursor: 'pointer',
              textShadow: '1px 1px 0 #000',
              width: '100%',
            }}
          >
            ▶ RESPAWN
          </button>

          <div
            style={{
              fontSize: 5,
              color: '#555',
              marginTop: 12,
              textShadow: '1px 1px 0 #000',
            }}
          >
            Press F12 to view error details
          </div>
        </div>
      </div>
    )
  }
}
