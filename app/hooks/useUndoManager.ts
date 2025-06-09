import { useCallback, useEffect, useRef, useState } from 'react';
import type { Circle, EditState } from '../types';

interface UseUndoManagerProps {
  circles: Circle[];
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  edit: EditState;
  setEdit: React.Dispatch<React.SetStateAction<EditState>>;
}

export function useUndoManager({ setCircles, edit }: UseUndoManagerProps) {
  const [undoStack, setUndoStack] = useState<Circle[][]>([]);
  const isPushingUndo = useRef(false);

  // Undo履歴に現在の円リストを追加（最大10件）
  const pushUndo = useCallback((prevCircles: Circle[]) => {
    setUndoStack((prev) => {
      const next = [...prev, prevCircles];
      return next.length > 10 ? next.slice(-10) : next;
    });
  }, []);

  // Undo pushの共通関数
  const pushUndoIfNeeded = useCallback(
    (prevCircles: Circle[]) => {
      pushUndo(prevCircles);
      isPushingUndo.current = true;
    },
    [pushUndo]
  );

  // --- Undo（ESCキー） ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (edit.drawing === null && e.key === 'Escape' && undoStack.length > 0) {
        setCircles(undoStack[undoStack.length - 1]);
        setUndoStack((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, edit.drawing, setCircles]);

  return {
    undoStack,
    setUndoStack,
    isPushingUndo,
    pushUndo,
    pushUndoIfNeeded,
  };
}
