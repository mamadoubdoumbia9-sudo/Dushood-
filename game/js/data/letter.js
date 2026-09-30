// DUSHOOD — La lettre d'Esteban (phase 59). CONTENU PROTÉGÉ :
// les phrases « Je t'aime ❤️ » et « J'espère que tu as apprécié mon cadeau. »
// doivent rester EXACTEMENT telles quelles (exigence non négociable).
// La lettre reste en français dans toutes les langues (décision D-008).

export const LETTER_FRAGMENTS = [
  'Lohen,\n\nSi tu lis ces mots, c\u2019est que tu as traversé Dushood tout entier.\nChaque lueur que tu as suivie, c\u2019était moi qui pensais à toi.',
  'J\u2019ai construit ce monde morceau par morceau,\ncomme on rassemble son courage avant de dire quelque chose d\u2019important.\nLe jardin, la forêt, le lac\u2026 chacun garde un souvenir de nous.',
  'Les énigmes n\u2019étaient pas là pour te perdre.\nElles étaient là pour te faire ralentir,\npour que tu regardes ce monde comme moi je te regarde\u00a0:\navec attention, avec patience, avec émerveillement.',
  'Nayo t\u2019a guidé jusqu\u2019ici, mais c\u2019est toi qui as fait tout le chemin.\nComme toujours. Tu avances, et la lumière te suit.\nJe voulais que tu le voies de tes propres yeux.',
  'Alors voilà, je te le dis simplement, sans énigme cette fois\u00a0:\n\nJe t\u2019aime ❤️\n\nJ\u2019espère que tu as apprécié mon cadeau.\n\n— Esteban',
];

export const LETTER_FULL = LETTER_FRAGMENTS.join('\n\n');

// Garde-fous vérifiés par les tests automatisés (tests/letter.test.mjs)
export const REQUIRED_PHRASES = ['Je t\u2019aime ❤️', 'J\u2019espère que tu as apprécié mon cadeau.'];
