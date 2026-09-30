// DUSHOOD — indices progressifs par puzzle (phase 16), cohérents avec la progression.
export const HINTS = {
  fireflies: {
    fr: [
      'Observe bien la ronde des lucioles avant de toucher quoi que ce soit.',
      'Chaque manche ajoute une lueur. Si tu te trompes, la ronde recommence : respire, et regarde encore.',
      'Tu peux relancer la démonstration en touchant Nayo au centre du kiosque.',
    ],
    en: [
      'Watch the fireflies\u2019 dance carefully before touching anything.',
      'Each round adds one light. If you make a mistake, the dance restarts: breathe and watch again.',
      'You can replay the demonstration by touching Nayo at the center of the pavilion.',
    ],
  },
  constellation: {
    fr: [
      'Commence par l\u2019étoile la plus basse dans le ciel.',
      'Les étoiles scintillent brièvement dans le bon ordre quand le tracé se dissipe.',
      'L\u2019ordre est : l\u2019étoile la plus basse, puis la plus à gauche, puis remonte en zigzag vers la droite.',
    ],
    en: [
      'Start with the lowest star in the sky.',
      'The stars briefly twinkle in the right order when the tracing fades.',
      'The order is: the lowest star, then the leftmost one, then zigzag up towards the right.',
    ],
  },
  reflection: {
    fr: [
      'Seules les tuiles voisines de la case vide peuvent glisser.',
      'Reconstitue d\u2019abord la rangée du haut, puis la colonne de gauche.',
      'Garde la case vide en bas à droite pour finir : les trois dernières tuiles tournent ensemble.',
    ],
    en: [
      'Only tiles next to the empty space can slide.',
      'Rebuild the top row first, then the left column.',
      'Keep the empty space at the bottom right to finish: the last three tiles rotate together.',
    ],
  },
  lanterns: {
    fr: [
      'Quatre indices sont cachés dans la ville : un mur, une affiche, la fontaine et une lanterne éteinte.',
      'Chaque indice donne un chiffre et sa position dans le code.',
      'Le jour de la rencontre, les deux cafés, les lettres de LOHEN, le mois de septembre : 7 2 5 9.',
    ],
    en: [
      'Four clues are hidden in the city: a wall, a poster, the fountain and a dark lantern.',
      'Each clue gives one digit and its position in the code.',
      'The day you met, the two coffees, the letters of LOHEN, the month of September: 7 2 5 9.',
    ],
  },
  letterjigsaw: {
    fr: [
      'Approche chaque fragment de la silhouette lumineuse au centre.',
      'Les fragments se rangent du haut vers le bas, dans l\u2019ordre où tu les as trouvés.',
      'Relâche un fragment tout près de son emplacement : il s\u2019aimante s\u2019il est au bon endroit.',
    ],
    en: [
      'Bring each fragment close to the glowing outline in the center.',
      'Fragments go from top to bottom, in the order you found them.',
      'Release a fragment very close to its slot: it snaps if it is the right place.',
    ],
  },
};

// Indices d'exploration (hors puzzle) par chapitre
Object.assign(HINTS, {
  garden_explore: {
    fr: [
      'Quelque chose brille près des fleurs, sur la droite du jardin.',
      'Le kiosque au centre est fermé : il lui faut une clé.',
      'Prends la clé près des fleurs, puis touche le kiosque au centre.',
    ],
    en: [
      'Something glows near the flowers, on the right side of the garden.',
      'The pavilion in the center is locked: it needs a key.',
      'Take the key near the flowers, then touch the pavilion in the center.',
    ],
  },
  forest_explore: {
    fr: [
      'Une souche, à gauche, porte quelque chose d\u2019oublié.',
      'Le grand arbre attend une mélodie.',
      'Prends la flûte sur la souche, puis joue-la près du grand arbre.',
    ],
    en: [
      'A stump, on the left, holds something forgotten.',
      'The great tree awaits a melody.',
      'Take the flute on the stump, then play it near the great tree.',
    ],
  },
  lake_explore: {
    fr: [
      'La rive, en bas à gauche, cache une pierre singulière.',
      'L\u2019autel attend une offrande qui brille comme la lune.',
      'Pose la pierre de lune sur l\u2019autel, au bord de l\u2019eau.',
    ],
    en: [
      'The shore, bottom left, hides a singular stone.',
      'The altar awaits an offering that shines like the moon.',
      'Place the moonstone on the altar, by the water.',
    ],
  },
  city_explore: {
    fr: [
      'Quatre endroits de la ville murmurent des chiffres : un mur, une affiche, la fontaine, une lanterne.',
      'Chaque indice donne un chiffre du code de la grande porte.',
      'Trouve les quatre indices puis règle les lanternes de la porte : 7, 2, 5, 9.',
    ],
    en: [
      'Four places in the city whisper digits: a wall, a poster, the fountain, a lantern.',
      'Each clue gives one digit of the great gate\u2019s code.',
      'Find the four clues then set the gate lanterns: 7, 2, 5, 9.',
    ],
  },
  tower_explore: {
    fr: [
      'Un carnet est resté ouvert, en bas de la tour.',
      'La porte du sommet demande une clé d\u2019argent.',
      'Prends la clé dans le carnet, puis ouvre la porte du sommet.',
    ],
    en: [
      'A notebook was left open, at the bottom of the tower.',
      'The summit door requires a silver key.',
      'Take the key in the notebook, then open the summit door.',
    ],
  },
});

export function hintsForLang(lang) {
  const out = {};
  for (const [k, v] of Object.entries(HINTS)) out[k] = v[lang] || v.fr;
  return out;
}
