// DUSHOOD — fabrique de puzzles : instancie la logique et restaure l'état sauvegardé.
import { SequencePuzzle } from './puzzles/sequence.js';
import { ConstellationPuzzle } from './puzzles/constellation.js';
import { SlidingPuzzle } from './puzzles/sliding.js';
import { CodePuzzle } from './puzzles/code.js';
import { JigsawPuzzle } from './puzzles/jigsaw.js';

export function createPuzzle(id, state) {
  let logic;
  switch (id) {
    case 'fireflies':     logic = new SequencePuzzle({ id }); break;
    case 'constellation': logic = new ConstellationPuzzle({ id }); break;
    case 'reflection':    logic = new SlidingPuzzle({ id }); break;
    case 'lanterns':      logic = new CodePuzzle({ id }); break;
    case 'letterjigsaw':  logic = new JigsawPuzzle({ id }); break;
    default: throw new Error('Puzzle inconnu: ' + id);
  }
  const saved = state.loadPuzzle(id);
  if (saved) logic.restore(saved);
  return logic;
}
