/**
 * Backtest del primer nivel (Grove Run: runway → jump_lesson).
 * Ejecutar: npx tsx src/game/maps/backtest-level1.ts
 */

import { MAP_CHUNKS, MAP_PLAYLISTS } from './chunks';

const BASE_SPEED = 340;
const SCREEN_W = 390;
const PLAYER_X = SCREEN_W * 0.2;
const SPAWN_X = SCREEN_W + 55;
const REACT_DIST = SPAWN_X - PLAYER_X;
const MIN_REACT_S = 0.85;

interface SpawnReport {
  chunk: string;
  type: string;
  lane: string;
  offsetX: number;
  scrollAtSpawn: number;
  reactTimeS: number;
  ok: boolean;
  note?: string;
}

function reactTimeAtSpeed(speed: number) {
  return REACT_DIST / speed;
}

function backtestLevel1() {
  const playlist = MAP_PLAYLISTS.find((p) => p.id === 'grove_run')!;
  const level1Chunks = playlist.chunks.slice(0, 2); // runway + jump_lesson

  let scroll = 0;
  const reports: SpawnReport[] = [];

  for (const chunkId of level1Chunks) {
    const chunk = MAP_CHUNKS[chunkId];
    for (const spawn of chunk.spawns) {
      const scrollAtSpawn = scroll + spawn.offsetX;
      const speed = BASE_SPEED + Math.min(scrollAtSpawn * 0.02, 80);
      const react = reactTimeAtSpeed(speed);
      let note: string | undefined;

      if (chunkId === 'runway' && spawn.type === 'orb_real') {
        note = spawn.lane === 'air_mid' ? 'Requiere salto — OK para tutorial' : 'Orbe accesible';
      }
      if (chunkId === 'jump_lesson' && spawn.type === 'bot' && spawn.offsetX < 200) {
        note = 'Bot muy pronto tras cambio de chunk — revisar offset';
      }

      reports.push({
        chunk: chunk.name,
        type: spawn.type,
        lane: spawn.lane,
        offsetX: spawn.offsetX,
        scrollAtSpawn,
        reactTimeS: Math.round(react * 100) / 100,
        ok: react >= MIN_REACT_S,
        note,
      });
    }
    scroll += chunk.width;
  }

  return { playlist: playlist.name, chunks: level1Chunks, reports };
}

const result = backtestLevel1();
console.log('\n=== BACKTEST NIVEL 1 ===');
console.log(`Mapa: ${result.playlist}`);
console.log(`Chunks: ${result.chunks.join(' → ')}\n`);

let fails = 0;
for (const r of result.reports) {
  const status = r.ok ? '✓' : '✗ FAIL';
  if (!r.ok) fails += 1;
  console.log(
    `${status} [${r.chunk}] ${r.type} @${r.offsetX}px lane=${r.lane} | react=${r.reactTimeS}s${r.note ? ` | ${r.note}` : ''}`,
  );
}

console.log(`\nTiempo mínimo requerido: ${MIN_REACT_S}s`);
console.log(fails === 0 ? 'Resultado: PASS' : `Resultado: FAIL (${fails} spawns)`);
process.exit(fails > 0 ? 1 : 0);
