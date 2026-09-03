// Populates the database with sample characters and scenario templates.
// Safe to re-run: it clears the two tables first, then inserts fresh rows.
import db from './db.js';

const characters = [
  {
    name: 'Urso',
    species: 'urso',
    personality: 'caloroso, um pouco desastrado, adora uma sesta',
    description: 'Um urso peludo e enorme que vive numa cabana na floresta. Anda sempre com um frasco de mel debaixo do braço e fica com fome a meio de qualquer aventura.',
    color: '#B5794A',
    emoji: '🐻'
  },
  {
    name: 'Unicórnio',
    species: 'unicornio',
    personality: 'sonhador, elegante, um pouco vaidoso',
    description: 'Um unicórnio de crina cor de arco-íris que acredita que toda a gente merece brilhar. Tropeça muitas vezes no próprio chifre quando está entusiasmado.',
    color: '#C9A6E8',
    emoji: '🦄'
  },
  {
    name: 'Raposa',
    species: 'raposa',
    personality: 'esperta, curiosa, gosta de resolver problemas',
    description: 'Uma raposa laranja-vivo que sabe sempre o caminho mais curto para casa, mesmo quando finge que se perdeu só para viver mais uma aventura.',
    color: '#E8804A',
    emoji: '🦊'
  },
  {
    name: 'Coruja',
    species: 'coruja',
    personality: 'sábia, calma, fala devagar e com cuidado',
    description: 'Uma coruja idosa que vive no topo da árvore mais alta da floresta e conhece uma história para cada estrela do céu.',
    color: '#6B5B95',
    emoji: '🦉'
  },
  {
    name: 'Pinguim',
    species: 'pinguim',
    personality: 'atrapalhado, leal, sempre pronto para ajudar',
    description: 'Um pinguim que sonha em voar e tenta, com muito boa vontade e pouco sucesso, sempre que ninguém está a olhar.',
    color: '#3C6E71',
    emoji: '🐧'
  },
  {
    name: 'Dragãozinho',
    species: 'dragao',
    personality: 'brincalhão, impaciente, tem um coração enorme',
    description: 'Um dragão pequenino que ainda está a aprender a soltar fogo e, por engano, costuma soltar apenas nuvens de fumo com cheiro a pipocas.',
    color: '#C0392B',
    emoji: '🐉'
  }
];

// {char1}, {char2}, {char3} are replaced at story time with the names of
// the characters the child picked, in the order they were picked.
const scenarios = [
  {
    title: 'Um dia chuvoso na praia',
    template:
      '{char1} e {char2} decidiram fazer um piquenique na praia, mas esqueceram-se de olhar para o céu. ' +
      'A meio da tarde começou a chover e a sanduíche favorita de {char1} ficou toda molhada! ' +
      'Em vez de ficarem tristes, os dois construíram um abrigo com uma toalha grande e passaram a tarde a contar histórias engraçadas, ' +
      'a rir do trovão que parecia um tambor gigante, até o sol voltar a espreitar entre as nuvens.',
    mood: 'engracada',
    num_characters: 2
  },
  {
    title: 'A estrela perdida',
    template:
      'Uma noite, {char1} reparou que faltava uma estrela no céu. Sem pensar duas vezes, foi bater à porta de {char2} para pedir ajuda. ' +
      'Juntos, seguiram um rasto de brilho pela floresta até encontrarem a estrela presa entre os ramos de uma árvore muito alta. ' +
      'Com muito cuidado, e um bocadinho de trabalho de equipa, devolveram a estrela ao seu lugar, e o céu voltou a ficar completo.',
    mood: 'aventura',
    num_characters: 2
  },
  {
    title: 'A receita secreta',
    template:
      '{char1} decidiu surpreender {char2} com um bolo especial, mas na cozinha as coisas não correram como planeado: farinha para todo o lado e um forno que fazia barulhos estranhos! ' +
      'Quando {char2} chegou para ajudar, descobriram juntos que o segredo não estava na receita, mas em cozinhar em boa companhia. ' +
      'O bolo saiu tortinho, mas foi o mais saboroso que os dois já tinham provado.',
    mood: 'amizade',
    num_characters: 2
  },
  {
    title: 'A grande corrida de folhas',
    template:
      'No outono, {char1}, {char2} e {char3} inventaram um jogo novo: uma corrida de barquinhos feitos de folhas no riacho da floresta. ' +
      '{char1} escolheu a folha mais colorida, {char2} a mais rápida, e {char3} a que parecia ter mais sorte. ' +
      'A corrida foi cheia de curvas, redemoinhos e muitas gargalhadas, e no final ninguém se lembrava sequer de quem tinha ganho, só de como se tinham divertido.',
    mood: 'aventura',
    num_characters: 3
  },
  {
    title: 'A noite sem lua',
    template:
      'Numa noite muito escura, sem uma única lua no céu, {char1} teve medo de ir dormir sozinho. ' +
      'Foi então que {char2} apareceu com uma ideia brilhante: encher frascos de vaga-lumes para fazer a sua própria constelação dentro de casa. ' +
      'Deitados lado a lado a olhar para as luzinhas a piscar, os dois adormeceram a sorrir, sem medo nenhum da escuridão.',
    mood: 'calma',
    num_characters: 2
  },
  {
    title: 'O concurso de talentos da floresta',
    template:
      'A floresta inteira estava a preparar o concurso de talentos anual, e {char1}, {char2} e {char3} decidiram formar uma equipa. ' +
      'Ensaiaram um número muito estranho, cheio de saltos, cambalhotas e uma canção que ninguém conseguia cantar sem se rir a meio. ' +
      'No dia do espetáculo esqueceram-se completamente da coreografia, mas fizeram rir tanta gente que ganharam o prémio de "Mais Divertido do Ano".',
    mood: 'engracada',
    num_characters: 3
  },
  {
    title: 'O mapa rasgado',
    template:
      '{char1} encontrou um velho mapa do tesouro debaixo de uma pedra, mas estava rasgado ao meio. ' +
      'Só {char2} tinha a outra metade, guardada há anos numa gaveta secreta. ' +
      'Ao juntarem as duas partes, descobriram que o verdadeiro tesouro não era ouro nem joias, mas sim um lugar tranquilo à beira do lago, perfeito para observar o pôr do sol juntos.',
    mood: 'aventura',
    num_characters: 2
  },
  {
    title: 'O soluço que não parava',
    template:
      '{char1} apanhou um soluço tão teimoso que não havia forma de o fazer parar. ' +
      '{char2} tentou de tudo: contar até dez, beber água de cabeça para baixo, e até fazer caretas engraçadas. ' +
      'No final, foi um susto muito carinhoso de {char2} que fez o soluço desaparecer, e os dois riram-se disso durante o resto da noite.',
    mood: 'engracada',
    num_characters: 2
  }
];

const clearAll = db.transaction(() => {
  db.exec('DELETE FROM scenarios');
  db.exec('DELETE FROM characters');
});

const insertCharacter = db.prepare(`
  INSERT INTO characters (name, species, personality, description, color, emoji)
  VALUES (@name, @species, @personality, @description, @color, @emoji)
`);

const insertScenario = db.prepare(`
  INSERT INTO scenarios (title, template, mood, num_characters)
  VALUES (@title, @template, @mood, @num_characters)
`);

const seed = db.transaction(() => {
  clearAll();
  for (const c of characters) insertCharacter.run(c);
  for (const s of scenarios) insertScenario.run(s);
});

seed();

console.log(`Semeados ${characters.length} personagens e ${scenarios.length} cenários.`);
db.close();
