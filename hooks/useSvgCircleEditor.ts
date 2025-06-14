import { Circle } from '@/types/circle';
import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { EditState } from '@/types/editState';
import { getSvgRelativeCoords } from '@/utils/svg';

interface UseSvgCircleEditorProps {
  circles: Circle[];
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  edit: EditState;
  setEdit: React.Dispatch<React.SetStateAction<EditState>>;
  pushUndo: (circles: Circle[]) => void;
  pushUndoIfNeeded: (circles: Circle[]) => void;
  isPushingUndo: React.MutableRefObject<boolean>;
}

export function useSvgCircleEditor({
  circles,
  setCircles,
  edit,
  setEdit,
  pushUndo,
  pushUndoIfNeeded,
  isPushingUndo,
}: UseSvgCircleEditorProps) {
  // 新規円追加直後のクリックによる選択解除を防ぐフラグ
  const justAddedCircleRef = useRef(false);

  // 円追加
  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.drawing !== null) return;
      if (e.button !== 0) return;
      const { x, y } = getSvgRelativeCoords(e);
      pushUndo(circles);
      setEdit((prev: EditState) => ({
        ...prev,
        drawing: { startX: x, startY: y },
      }));
    },
    [edit, circles, pushUndo, setEdit]
  );

  // 描画中のマウス移動
  const handleSvgMouseMoveInner = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.drawing === null) return;
      const { x, y } = getSvgRelativeCoords(e);
      setEdit((prev: EditState) => ({ ...prev, lastMouse: { x, y } }));
    },
    [edit.drawing, setEdit]
  );

  // SVG上でのドラッグ移動
  const handleSvgDragMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.dragId === null) return;
      if (!isPushingUndo.current) {
        pushUndoIfNeeded(circles);
      }
      const { x, y } = getSvgRelativeCoords(e);
      setCircles((prev) =>
        prev.map((c) =>
          c.id === edit.dragId
            ? { ...c, x: x + edit.dragOffset.dx, y: y + edit.dragOffset.dy }
            : c
        )
      );
    },
    [
      edit.dragId,
      edit.dragOffset,
      circles,
      pushUndoIfNeeded,
      isPushingUndo,
      setCircles,
    ]
  );

  // 描画中のマウスアップ
  const handleSvgMouseUpInner = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.drawing === null) return;
      const { x, y } = getSvgRelativeCoords(e);
      const dx = x - edit.drawing.startX;
      const dy = y - edit.drawing.startY;
      const r = Math.sqrt(dx * dx + dy * dy) / 2;
      if (r > 1) {
        const centerX = (edit.drawing.startX + x) / 2;
        const centerY = (edit.drawing.startY + y) / 2;
        const newId = uuidv4();
        setCircles((prev) => {
          const maxIndex =
            prev.length > 0 ? Math.max(...prev.map((c) => c.index ?? 0)) : -1;
          return [
            ...prev,
            { id: newId, x: centerX, y: centerY, r, index: maxIndex + 1 },
          ];
        });

        setEdit((prev: EditState) => ({
          ...prev,
          drawing: null,
          lastMouse: null,
          selectedId: newId, // 新規円を選択状態に
        }));
        justAddedCircleRef.current = true;
        return;
      }
      setEdit((prev: EditState) => ({
        ...prev,
        drawing: null,
        lastMouse: null,
      }));
    },
    [edit.drawing, setCircles, setEdit]
  );

  // ドラッグ終了
  const handleSvgDragEnd = useCallback(() => {
    setEdit((prev: EditState) => ({
      ...prev,
      dragId: null,
      dragOffset: { dx: 0, dy: 0 },
    }));
    isPushingUndo.current = false;
  }, [isPushingUndo, setEdit]);

  // SVG全体のmousemove
  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.resizeId !== null && edit.resizeStart) {
        if (!isPushingUndo.current) {
          pushUndo(circles);
          isPushingUndo.current = true;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = circles.find((c) => c.id === edit.resizeId)?.x ?? 0;
        const cy = circles.find((c) => c.id === edit.resizeId)?.y ?? 0;
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        const dx = mx - cx;
        const dy = my - cy;
        const newR = Math.sqrt(dx * dx + dy * dy);
        setCircles((prev) =>
          prev.map((c) =>
            c.id === edit.resizeId ? { ...c, r: Math.max(newR, 1) } : c
          )
        );
      } else if (edit.dragId !== null) handleSvgDragMove(e);
      else if (edit.drawing) handleSvgMouseMoveInner(e);

      if (edit.hoverId !== null) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setEdit((prev: EditState) => ({
          ...prev,
          lastMouse: { x, y },
        }));
      }
    },
    [
      edit.resizeId,
      edit.resizeStart,
      edit.dragId,
      edit.drawing,
      edit.hoverId,
      circles,
      handleSvgDragMove,
      handleSvgMouseMoveInner,
      pushUndo,
      isPushingUndo,
      setCircles,
      setEdit,
    ]
  );

  // SVG全体のmouseup
  const handleSvgMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.resizeId !== null) {
        setEdit((prev: EditState) => ({
          ...prev,
          resizeId: null,
          resizeStart: null,
        }));
        isPushingUndo.current = false;
      } else if (edit.dragId !== null) handleSvgDragEnd();
      else if (edit.drawing) handleSvgMouseUpInner(e);
    },
    [
      edit.resizeId,
      edit.dragId,
      edit.drawing,
      handleSvgDragEnd,
      handleSvgMouseUpInner,
      isPushingUndo,
      setEdit,
    ]
  );

  // SVG全体mouseleave
  const handleSvgMouseLeave = useCallback(() => {
    setEdit((prev: EditState) => ({
      ...prev,
      dragId: null,
      dragOffset: { dx: 0, dy: 0 },
      drawing: null,
      resizeId: null,
      resizeStart: null,
      lastMouse: null,
      hoverId: null,
    }));
    setEdit((prev: EditState) => ({ ...prev, hoverId: null }));
  }, [setEdit]);

  // SVG全体click
  const handleSvgClick = useCallback(() => {
    if (justAddedCircleRef.current) {
      justAddedCircleRef.current = false;
      return;
    }
    setEdit((prev: EditState) => ({ ...prev, selectedId: null }));
  }, [setEdit]);

  // 円ドラッグ開始
  const handleCircleMouseDown = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const { x, y } = getSvgRelativeCoords(
        e as React.MouseEvent<SVGCircleElement, MouseEvent>
      );
      const circle = circles.find((c) => c.id === id)!;
      setEdit((prev: EditState) => ({
        ...prev,
        dragId: id,
        dragOffset: { dx: circle.x - x, dy: circle.y - y },
      }));
    },
    [circles, setEdit]
  );

  return {
    handleSvgMouseDown,
    handleSvgMouseMove,
    handleSvgMouseUp,
    handleSvgMouseLeave,
    handleSvgClick,
    handleCircleMouseDown,
  };
}
