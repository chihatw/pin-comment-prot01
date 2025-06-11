import { Circle } from '@/types/circle';

// Undoスタック管理ユーティリティ
export function pushUndo(
  prevStack: Array<Circle[]>,
  prevCircles: Circle[],
  maxStack: number = 10
) {
  const newStack = [...prevStack, prevCircles.map((c) => ({ ...c }))];
  if (newStack.length > maxStack) newStack.shift();
  return newStack;
}
