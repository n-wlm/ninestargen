'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Catches render errors in the SVG previews (e.g. a malformed config restored
// from history) so a single bad design can't take down the whole generator.
export default class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-center p-8">
          <p className="text-[13px] font-medium text-[#374151]">
            The preview failed to render.
          </p>
          <p className="text-[12px] text-[#6B7280] max-w-60">
            This design may be corrupted. Resetting the controls usually fixes it.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)] text-white transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
