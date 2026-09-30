// DUSHOOD — dialogues (phase 10). Nayo = luciole-esprit guide, voix du monde.
// Chaque dialogue est une liste de répliques { who: 'nayo'|'world'|'esteban', fr, en }.
export const DIALOGUES = {
  intro: [
    { who: 'world', fr: 'Lohen ouvre les yeux.\nLe monde autour de lui ne ressemble à rien de connu.', en: 'Lohen opens his eyes.\nThe world around him looks like nothing he knows.' },
    { who: 'world', fr: 'Une lueur dorée s\u2019approche en dansant.', en: 'A golden light approaches, dancing.' },
    { who: 'nayo', fr: 'Bienvenue à Dushood, Lohen. Je m\u2019appelle Nayo.', en: 'Welcome to Dushood, Lohen. My name is Nayo.' },
    { who: 'nayo', fr: 'Quelqu\u2019un a construit ce monde pour toi. Pierre par pierre, lueur par lueur.', en: 'Someone built this world for you. Stone by stone, light by light.' },
    { who: 'nayo', fr: 'Il a laissé une lettre au sommet de la Tour des Souvenirs… mais elle s\u2019est brisée en cinq fragments.', en: 'He left a letter at the top of the Tower of Memories… but it broke into five fragments.' },
    { who: 'nayo', fr: 'Suis-moi. Chaque lieu de Dushood en garde un. Touche ce qui brille, et le monde te répondra.', en: 'Follow me. Each place in Dushood keeps one. Touch what glows, and the world will answer you.' },
  ],
  garden_enter: [
    { who: 'nayo', fr: 'Le Jardin des Lucioles. C\u2019est ici que tout a commencé.', en: 'The Firefly Garden. This is where everything began.' },
    { who: 'nayo', fr: 'Regarde autour de toi. Touche ce qui attire ton regard.', en: 'Look around. Touch whatever catches your eye.' },
  ],
  garden_bench: [
    { who: 'world', fr: 'Un banc de pierre, tiède comme si quelqu\u2019un venait de le quitter.\nDes initiales y sont gravées\u00a0: E + L.', en: 'A stone bench, warm as if someone had just left.\nInitials are carved on it: E + L.' },
  ],
  garden_key: [
    { who: 'world', fr: 'Sous les pétales, une petite clé de cuivre brille doucement.', en: 'Under the petals, a small copper key glows softly.' },
    { who: 'nayo', fr: 'La clé du kiosque aux lucioles\u00a0! Garde-la précieusement.', en: 'The key to the firefly pavilion! Keep it safe.' },
  ],
  garden_gate_locked: [
    { who: 'nayo', fr: 'Le kiosque est fermé. La clé doit être quelque part dans le jardin…', en: 'The pavilion is locked. The key must be somewhere in the garden…' },
  ],
  garden_puzzle_intro: [
    { who: 'nayo', fr: 'Les lucioles veulent jouer. Observe leur ronde, puis répète-la en les touchant.', en: 'The fireflies want to play. Watch their dance, then repeat it by touching them.' },
  ],
  garden_fragment: [
    { who: 'nayo', fr: 'Un fragment de la lettre\u00a0! Il vibre encore de ce qu\u2019il veut te dire.', en: 'A fragment of the letter! It still hums with what it wants to tell you.' },
    { who: 'nayo', fr: 'La Forêt des Échos s\u2019est ouverte. En route\u00a0!', en: 'The Echo Forest has opened. Let\u2019s go!' },
  ],
  forest_enter: [
    { who: 'nayo', fr: 'La Forêt des Échos. Ici, chaque son revient transformé.', en: 'The Echo Forest. Here, every sound returns transformed.' },
    { who: 'nayo', fr: 'Esteban venait y écouter le silence, quand il pensait à toi.', en: 'Esteban used to come here to listen to the silence, when he thought of you.' },
  ],
  forest_flute: [
    { who: 'world', fr: 'Une flûte de bois est posée sur une souche, comme oubliée exprès.', en: 'A wooden flute rests on a stump, as if forgotten on purpose.' },
    { who: 'nayo', fr: 'Joue-la près du grand arbre. Les échos te montreront le chemin des étoiles.', en: 'Play it near the great tree. The echoes will show you the way of the stars.' },
  ],
  forest_tree_locked: [
    { who: 'nayo', fr: 'Le grand arbre dort. Il faudrait une mélodie pour le réveiller…', en: 'The great tree sleeps. A melody would be needed to wake it…' },
  ],
  forest_puzzle_intro: [
    { who: 'nayo', fr: 'Le ciel s\u2019est ouvert entre les branches. Relie les étoiles dans l\u2019ordre où elles s\u2019illuminent, en partant de la plus basse.', en: 'The sky opened between the branches. Connect the stars in the order they light up, starting from the lowest one.' },
  ],
  forest_fragment: [
    { who: 'nayo', fr: 'Deuxième fragment\u00a0! La constellation… c\u2019était la première soirée qu\u2019Esteban a passée avec toi.', en: 'Second fragment! The constellation… it was the first evening Esteban spent with you.' },
  ],
  lake_enter: [
    { who: 'nayo', fr: 'Le Lac des Reflets. L\u2019eau y garde la mémoire de ce qu\u2019on lui montre.', en: 'The Mirror Lake. The water keeps the memory of what it is shown.' },
  ],
  lake_stone: [
    { who: 'world', fr: 'Au bord de l\u2019eau, une pierre de lune attend, froide et lumineuse.', en: 'At the water\u2019s edge, a moonstone waits, cold and luminous.' },
  ],
  lake_altar_locked: [
    { who: 'nayo', fr: 'L\u2019autel est vide. Il manque quelque chose qui brille comme la lune…', en: 'The altar is empty. Something that shines like the moon is missing…' },
  ],
  lake_puzzle_intro: [
    { who: 'nayo', fr: 'Le reflet s\u2019est brisé. Fais glisser les morceaux pour recomposer le souvenir.', en: 'The reflection shattered. Slide the pieces to restore the memory.' },
  ],
  lake_fragment: [
    { who: 'nayo', fr: 'Troisième fragment\u00a0! Le reflet montrait le sourire de quelqu\u2019un… je crois que c\u2019est le tien.', en: 'Third fragment! The reflection showed someone\u2019s smile… I think it is yours.' },
  ],
  city_enter: [
    { who: 'nayo', fr: 'La Ville des Lanternes. Chaque lanterne est un message qu\u2019Esteban n\u2019a pas osé envoyer.', en: 'The Lantern City. Each lantern is a message Esteban never dared to send.' },
    { who: 'nayo', fr: 'La grande porte a un code. Les indices sont cachés dans la ville — cherche bien.', en: 'The great gate has a code. The clues are hidden in the city — look carefully.' },
  ],
  city_clue1: [
    { who: 'world', fr: 'Sur le mur, une craie a écrit\u00a0:\n«\u00a0Le premier chiffre est le jour de notre rencontre\u00a0: un 7.\u00a0»', en: 'On the wall, chalk has written:\n"The first digit is the day we met: a 7."' },
  ],
  city_clue2: [
    { who: 'world', fr: 'Une affiche délavée\u00a0:\n«\u00a0Deux cafés, toujours. Le deuxième chiffre est 2.\u00a0»', en: 'A faded poster:\n"Two coffees, always. The second digit is 2."' },
  ],
  city_clue3: [
    { who: 'world', fr: 'Gravé sur la fontaine\u00a0:\n«\u00a0Troisième chiffre\u00a0: le nombre de lettres de D-U-S-H-O… non, de L-O-H-E-N. 5.\u00a0»', en: 'Engraved on the fountain:\n"Third digit: the number of letters in L-O-H-E-N. 5."' },
  ],
  city_clue4: [
    { who: 'world', fr: 'Au dos d\u2019une lanterne éteinte\u00a0:\n«\u00a0Le dernier chiffre\u00a0: 9. Comme le mois de septembre, celui du premier message.\u00a0»', en: 'On the back of a dark lantern:\n"The last digit: 9. Like September, the month of the first message."' },
  ],
  city_gate_locked: [
    { who: 'nayo', fr: 'Quatre chiffres… Les indices sont dans la ville. Reviens quand tu les auras trouvés.', en: 'Four digits… The clues are in the city. Come back when you have found them.' },
  ],
  city_fragment: [
    { who: 'nayo', fr: 'Quatrième fragment\u00a0! Plus qu\u2019un seul. La Tour nous attend, Lohen.', en: 'Fourth fragment! Only one left. The Tower awaits us, Lohen.' },
  ],
  tower_enter: [
    { who: 'nayo', fr: 'La Tour des Souvenirs. C\u2019est ici qu\u2019Esteban a déposé ce qu\u2019il avait de plus fragile.', en: 'The Tower of Memories. This is where Esteban laid down his most fragile things.' },
  ],
  tower_door_locked: [
    { who: 'nayo', fr: 'La porte du sommet est scellée. Sa clé doit être dans la tour…', en: 'The door to the summit is sealed. Its key must be in the tower…' },
  ],
  tower_key: [
    { who: 'world', fr: 'Entre deux pages d\u2019un carnet, une clé d\u2019argent. Sur le carnet, une écriture pressée\u00a0:\n«\u00a0Pour L. Presque fini. Pourvu que ça lui plaise.\u00a0»', en: 'Between two pages of a notebook, a silver key. On the notebook, hurried handwriting:\n"For L. Almost done. I hope he likes it."' },
  ],
  tower_puzzle_intro: [
    { who: 'nayo', fr: 'Les cinq fragments flottent dans la lumière. Assemble-les, Lohen. Ils n\u2019attendent que toi.', en: 'The five fragments float in the light. Put them together, Lohen. They are waiting for you.' },
  ],
  tower_solved: [
    { who: 'nayo', fr: 'La lettre est entière. …Je crois que mon rôle s\u2019arrête ici.', en: 'The letter is whole. …I believe my part ends here.' },
    { who: 'nayo', fr: 'Lis-la, Lohen. Elle t\u2019attend depuis le début.', en: 'Read it, Lohen. It has been waiting for you since the beginning.' },
  ],
  epilogue: [
    { who: 'world', fr: 'Au sommet de la tour, l\u2019aube se lève sur Dushood.', en: 'At the top of the tower, dawn rises over Dushood.' },
    { who: 'nayo', fr: 'Tout ce monde tenait dans une seule phrase, au fond.', en: 'All this world fit in a single sentence, really.' },
    { who: 'world', fr: 'Les lucioles montent vers le ciel comme des lanternes minuscules.\nQuelque part, Esteban sourit.', en: 'The fireflies rise to the sky like tiny lanterns.\nSomewhere, Esteban smiles.' },
    { who: 'world', fr: 'FIN', en: 'THE END' },
  ],
};
