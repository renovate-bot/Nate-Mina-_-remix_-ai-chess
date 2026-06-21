/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function fetchAiMove(history: string, difficulty: string): Promise<string> {
  const response = await fetch('/api/ai/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, difficulty }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch AI move');
  }
  
  const data = await response.json();
  return data.move;
}
