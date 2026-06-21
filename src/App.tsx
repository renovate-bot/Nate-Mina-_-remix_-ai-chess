/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ChessGame from './components/ChessGame';
import ErrorBoundary from './ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950">
        <ChessGame />
      </div>
    </ErrorBoundary>
  );
}
