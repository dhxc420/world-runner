'use client';

import { useCallback, useRef } from 'react';
import type { PlayerAction } from '@/game/types';

interface TouchGameControlsProps {
  onInput: (action: PlayerAction) => void;
  disabled?: boolean;
}

export function TouchGameControls({ onInput, disabled }: TouchGameControlsProps) {
  const jumpHeld = useRef(false);
  const duckHeld = useRef(false);

  const stop = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onJumpDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      stop(e);
      e.currentTarget.setPointerCapture(e.pointerId);
      if (!jumpHeld.current) {
        jumpHeld.current = true;
        onInput('jump');
      }
    },
    [disabled, onInput, stop],
  );

  const onJumpUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      stop(e);
      if (jumpHeld.current) {
        jumpHeld.current = false;
        onInput('jump_release');
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ok */
      }
    },
    [disabled, onInput, stop],
  );

  const onDuckDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      stop(e);
      e.currentTarget.setPointerCapture(e.pointerId);
      if (!duckHeld.current) {
        duckHeld.current = true;
        onInput('duck');
      }
    },
    [disabled, onInput, stop],
  );

  const onDuckUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      stop(e);
      if (duckHeld.current) {
        duckHeld.current = false;
        onInput('release');
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ok */
      }
    },
    [disabled, onInput, stop],
  );

  return (
    <div
      className="touch-controls pointer-events-none absolute inset-x-0 bottom-0 z-[15] flex items-end justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      aria-hidden={disabled}
    >
      <button
        type="button"
        disabled={disabled}
        className="touch-controls__btn touch-controls__btn--duck pointer-events-auto"
        aria-label="Agacharse"
        onPointerDown={onDuckDown}
        onPointerUp={onDuckUp}
        onPointerCancel={onDuckUp}
        onPointerLeave={onDuckUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="touch-controls__icon" aria-hidden="true">
          ↓
        </span>
        <span className="touch-controls__label">Agachar</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        className="touch-controls__btn touch-controls__btn--jump pointer-events-auto"
        aria-label="Saltar"
        onPointerDown={onJumpDown}
        onPointerUp={onJumpUp}
        onPointerCancel={onJumpUp}
        onPointerLeave={onJumpUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="touch-controls__icon touch-controls__icon--jump" aria-hidden="true">
          A
        </span>
        <span className="touch-controls__label">Saltar</span>
      </button>
    </div>
  );
}
