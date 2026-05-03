import { TILE, W, H } from "./constants";

export function isWalkable(
  grid: Uint8Array,
  tunnelRows: number[],
  x: number, y: number,
  allowDoor: boolean,
): boolean {
  if (y < 0 || y >= H) return false;
  if (x < 0 || x >= W) return tunnelRows.indexOf(y) !== -1;
  const v = grid[y * W + x];
  if (v === TILE.WALL) return false;
  if (v === TILE.DOOR) return allowDoor;
  return true;
}
