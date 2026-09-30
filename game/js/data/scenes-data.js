// DUSHOOD — définition data-driven des chapitres (phases 11, 12, 13, 65, 68).
// Chaque hotspot est une zone tactile contextuelle (pas de joystick).
// Types : dialogue | item | clue | gate (verrou + puzzle) .
export const CHAPTERS = {
  garden: {
    id: 'garden',
    nameKey: 'map.garden',
    bg: 'bg_garden',
    music: 'garden',
    ambient: 'fireflies',
    puzzle: 'fireflies',
    fragment: 0,
    hotspots: [
      {
        id: 'bench', type: 'dialogue', x: 250, y: 520, r: 56,
        dialogue: 'garden_bench', oneShot: false,
      },
      {
        id: 'flowers', type: 'item', x: 1010, y: 560, r: 56,
        item: 'lantern_key', dialogue: 'garden_key',
      },
      {
        id: 'pavilion', type: 'gate', x: 640, y: 350, r: 70,
        requiresItem: 'lantern_key', consumesItem: true,
        lockedDialogue: 'garden_gate_locked',
        puzzle: 'fireflies', puzzleIntro: 'garden_puzzle_intro',
      },
    ],
    enterDialogue: 'garden_enter',
    fragmentDialogue: 'garden_fragment',
  },
  forest: {
    id: 'forest',
    nameKey: 'map.forest',
    bg: 'bg_forest',
    music: 'forest',
    ambient: 'fireflies',
    puzzle: 'constellation',
    fragment: 1,
    hotspots: [
      {
        id: 'stump', type: 'item', x: 300, y: 580, r: 56,
        item: 'flute', dialogue: 'forest_flute',
      },
      {
        id: 'greattree', type: 'gate', x: 900, y: 330, r: 80,
        requiresItem: 'flute', consumesItem: true,
        lockedDialogue: 'forest_tree_locked',
        puzzle: 'constellation', puzzleIntro: 'forest_puzzle_intro',
      },
    ],
    enterDialogue: 'forest_enter',
    fragmentDialogue: 'forest_fragment',
  },
  lake: {
    id: 'lake',
    nameKey: 'map.lake',
    bg: 'bg_lake',
    music: 'lake',
    ambient: 'petals',
    puzzle: 'reflection',
    fragment: 2,
    hotspots: [
      {
        id: 'shore', type: 'item', x: 220, y: 600, r: 56,
        item: 'moonstone', dialogue: 'lake_stone',
      },
      {
        id: 'altar', type: 'gate', x: 820, y: 430, r: 70,
        requiresItem: 'moonstone', consumesItem: true,
        lockedDialogue: 'lake_altar_locked',
        puzzle: 'reflection', puzzleIntro: 'lake_puzzle_intro',
      },
    ],
    enterDialogue: 'lake_enter',
    fragmentDialogue: 'lake_fragment',
  },
  city: {
    id: 'city',
    nameKey: 'map.city',
    bg: 'bg_city',
    music: 'city',
    ambient: 'fireflies',
    puzzle: 'lanterns',
    fragment: 3,
    hotspots: [
      { id: 'wall',     type: 'clue', x: 180, y: 430, r: 52, dialogue: 'city_clue1', clue: 'clue1' },
      { id: 'poster',   type: 'clue', x: 450, y: 560, r: 52, dialogue: 'city_clue2', clue: 'clue2' },
      { id: 'fountain', type: 'clue', x: 760, y: 590, r: 52, dialogue: 'city_clue3', clue: 'clue3' },
      { id: 'lantern',  type: 'clue', x: 1090, y: 450, r: 52, dialogue: 'city_clue4', clue: 'clue4' },
      {
        id: 'gate', type: 'gate', x: 640, y: 300, r: 74,
        puzzle: 'lanterns', puzzleIntro: 'city_gate_locked',
      },
    ],
    enterDialogue: 'city_enter',
    fragmentDialogue: 'city_fragment',
  },
  tower: {
    id: 'tower',
    nameKey: 'map.tower',
    bg: 'bg_tower',
    music: 'tower',
    ambient: 'fireflies',
    puzzle: 'letterjigsaw',
    fragment: 4,
    hotspots: [
      {
        id: 'notebook', type: 'item', x: 350, y: 560, r: 56,
        item: 'tower_key', dialogue: 'tower_key',
      },
      {
        id: 'summitdoor', type: 'gate', x: 660, y: 300, r: 76,
        requiresItem: 'tower_key', consumesItem: true,
        lockedDialogue: 'tower_door_locked',
        puzzle: 'letterjigsaw', puzzleIntro: 'tower_puzzle_intro',
      },
    ],
    enterDialogue: 'tower_enter',
    fragmentDialogue: 'tower_solved',
  },
};

export const ITEMS = {
  lantern_key: { icon: 'key',   nameKey: 'item.lantern_key', descKey: 'item.lantern_key.desc' },
  moonstone:   { icon: 'stone', nameKey: 'item.moonstone',   descKey: 'item.moonstone.desc' },
  flute:       { icon: 'flute', nameKey: 'item.flute',       descKey: 'item.flute.desc' },
  tower_key:   { icon: 'key',   nameKey: 'item.tower_key',   descKey: 'item.tower_key.desc' },
};
