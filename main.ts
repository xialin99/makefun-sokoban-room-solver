import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const letters = 'udlr';
type State = {
  boxes: number[];
  player: number;
  key: number;
  pushes: number;
  parent?: State;
  stand: number;
  direction: number;
};

function solveRoom(cells: number[], board: string, offsets: number[]): string | undefined {
  const index = new Map(cells.map((cell, i) => [cell, i]));
  const neighbors = cells.map(cell => offsets.map(offset => index.get(cell + offset) ?? -1));
  const boxes: number[] = [];
  const goals: number[] = [];
  cells.forEach((cell, i) => {
    if ('$*'.includes(board[cell])) boxes.push(i);
    if ('.*'.includes(board[cell])) goals.push(i);
  });

  // Cell zero is the hall square. It is available to the player only.
  const distance = goals.map(goal => {
    const dist = Array<number>(cells.length).fill(Infinity);
    const queue = [goal];
    dist[goal] = 0;
    for (const to of queue) {
      for (let d = 0; d < 4; d++) {
        const from = neighbors[to][d ^ 1];
        if (from <= 0 || neighbors[from][d ^ 1] < 0 || dist[from] !== Infinity) continue;
        dist[from] = dist[to] + 1;
        queue.push(from);
      }
    }
    return dist;
  });
  const matching = new Map<number, number>();
  function estimate(layout: number, positions: number[]): number {
    const cached = matching.get(layout);
    if (cached !== undefined) return cached;
    function assign(i: number, used: number): number {
      if (i === positions.length) return 0;
      let best = Infinity;
      for (let g = 0; g < goals.length; g++) {
        const bit = 1 << g;
        const cost = distance[g][positions[i]];
        if (!(used & bit) && cost < best) best = Math.min(best, cost + assign(i + 1, used | bit));
      }
      return best;
    }
    const value = assign(0, 0);
    matching.set(layout, value);
    return value;
  }

  const queue = new Int8Array(cells.length);
  const previous = new Int8Array(cells.length);
  const walkDirection = new Int8Array(cells.length);
  function flood(start: number, occupied: number): number {
    previous.fill(-1);
    previous[start] = start;
    queue[0] = start;
    let size = 1;
    let first = start;
    for (let head = 0; head < size; head++) {
      const cell = queue[head];
      for (let d = 0; d < 4; d++) {
        const next = neighbors[cell][d];
        if (next < 0 || previous[next] >= 0 || (occupied & (1 << next))) continue;
        previous[next] = cell;
        walkDirection[next] = d;
        queue[size++] = next;
        first = Math.min(first, next);
      }
    }
    return first;
  }
  const mask = (positions: number[]): number => positions.reduce((bits, b) => bits | (1 << b), 0);

  // A* on (box layout, player component). Each room has at most 29
  // cells and four boxes, so the finite state space bounds the work.
  // Matching is consistent: a push changes one assigned distance by at
  // most one in the direction needed for consistency. Buckets never rewind.
  const best = new Map<number, State>();
  const open: State[][] = [];
  function enqueue(positions: number[], player: number, pushes: number, stand: number, direction: number, parent?: State) {
    const layout = mask(positions);
    const h = estimate(layout, positions);
    if (h === Infinity) return;
    const key = layout * 32 + flood(player, layout);
    const old = best.get(key);
    if (old && old.pushes <= pushes) return;
    const state = { boxes: positions, player, key, pushes, stand, direction, parent };
    best.set(key, state);
    (open[pushes + h] ??= []).push(state);
  }
  enqueue(boxes, 0, 0, -1, -1);
  for (let f = 0; f < open.length; f++) {
    const bucket = open[f];
    while (bucket?.length) {
      const state = bucket.pop()!;
      if (best.get(state.key) !== state) continue;
      const occupied = mask(state.boxes);
      if (occupied === mask(goals)) {
        const path: State[] = [];
        for (let s = state; s.parent; s = s.parent) path.push(s);
        function walk(from: number, to: number, layout: number): string {
          flood(from, layout);
          let moves = '';
          for (let cell = to; cell !== from; cell = previous[cell]) {
            moves = letters[walkDirection[cell]] + moves;
          }
          return moves;
        }
        let moves = '';
        for (const s of path.reverse()) {
          moves += walk(s.parent!.player, s.stand, mask(s.parent!.boxes));
          moves += letters[s.direction].toUpperCase();
        }
        // Generated goal layouts leave every free cell connected to the door.
        return moves + walk(state.player, 0, occupied);
      }

      flood(state.player, occupied);
      let reachable = 0;
      for (let i = 0; i < cells.length; i++) if (previous[i] >= 0) reachable |= 1 << i;
      for (const [i, box] of state.boxes.entries()) {
        for (let d = 0; d < 4; d++) {
          const stand = neighbors[box][d ^ 1];
          const dest = neighbors[box][d];
          if (stand < 0 || !(reachable & (1 << stand)) || dest <= 0 || (occupied & (1 << dest))) continue;
          const next = state.boxes.slice();
          next[i] = dest;
          enqueue(next, box, state.pushes + 1, stand, d, state);
        }
      }
    }
  }
}

function solve(level: string): string {
  const rows = level.trimEnd().split(/\r?\n/);
  const width = Math.max(...rows.map(row => row.length));
  const board = rows.map(row => row.padEnd(width, '#')).join('');
  const offsets = [-width, width, -1, 1];
  const player = board.indexOf('@');
  const hall = Math.floor(player / width) * width;
  const seen = new Set<number>();
  let moves = '';
  let at = player;
  for (let door = hall + 1; door < hall + width - 1; door++) {
    for (const offset of offsets.slice(0, 2)) {
      const entrance = door + offset;
      if (board[entrance] === '#' || seen.has(entrance)) continue;
      const cells = [door, entrance];
      seen.add(entrance);
      for (let i = 1; i < cells.length; i++) {
        for (const delta of offsets) {
          const cell = cells[i] + delta;
          if (cell >= hall && cell < hall + width) continue;
          if (board[cell] === '#' || seen.has(cell)) continue;
          seen.add(cell);
          cells.push(cell);
        }
      }
      const room = solveRoom(cells, board, offsets);
      if (room === undefined) return '';
      moves += (door < at ? 'l' : 'r').repeat(Math.abs(door - at)) + room;
      at = door;
    }
  }
  return moves;
}
for (const id of readdirSync(I).sort()) {
  const moves = solve(readFileSync(join(I, id, 'level.txt'), 'utf8'));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'solution.txt'), `${moves}\n`);
}
