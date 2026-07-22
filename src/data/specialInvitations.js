const sharedResponsibilities=[
  'Oferecer muitos mimos e colo sempre que for preciso.',
  'Estar presente nas pequenas e grandes aventuras.',
  'Guardar segredos importantes com absoluta discrição.',
  'Contar histórias embaraçosas sobre os meus pais.',
  'Ensinar algumas travessuras cuidadosamente selecionadas.',
  'Celebrar todas as minhas conquistas, mesmo as mais pequeninas.',
  'Gostar de mim até nos dias de birra.',
  'Cumprir este cargo por tempo indeterminado.'
];

export const specialInvitations=[
  {
    slug:'padrinho',personName:'Gonçalo',role:'padrinho',treatment:'Olá',missionNumber:'BS-001',
    title:'Missão confidencial',agentName:'Baby J&D',missionName:'Operação Padrinho',
    introduction:'Ainda nem sequer cheguei ao mundo, mas já ouvi falar muito de ti.',
    missionText:'Disseram-me que és alguém especial, em quem posso confiar para uma das missões mais importantes da minha vida.',
    responsibilities:sharedResponsibilities,
    finalQuestion:'Aceitas ser o meu padrinho?',acceptLabel:'Aceito a missão',alternativeLabel:'Preciso de analisar os termos',
    acceptedMessage:'Bem-vindo ao cargo de padrinho. Ainda não cheguei ao mundo e já fiz uma excelente escolha.',
    signature:'Com carinho, Baby J&D',note:'P.S. O cargo inclui muitos mimos e não tem data de validade.',image:null,responseStatus:'pending'
  },
  {
    slug:'madrinha',personName:'Lili',role:'madrinha',treatment:'Olá',missionNumber:'BS-002',
    title:'Missão confidencial',agentName:'Baby J&D',missionName:'Operação Madrinha',
    introduction:'Ainda nem sequer cheguei ao mundo, mas já ouvi falar muito de ti.',
    missionText:'Disseram-me que és alguém especial, em quem posso confiar para uma das missões mais importantes da minha vida.',
    responsibilities:sharedResponsibilities,
    finalQuestion:'Aceitas ser a minha madrinha?',acceptLabel:'Aceito a missão',alternativeLabel:'Solicitar mais informações',
    acceptedMessage:'Bem-vinda ao cargo de madrinha. Ainda não cheguei ao mundo e já fiz uma excelente escolha.',
    signature:'Com carinho, Baby J&D',note:'P.S. A missão começa já e inclui uma quantidade ilimitada de abraços.',image:null,responseStatus:'pending'
  }
];

export const getSpecialInvitation=slug=>specialInvitations.find(invitation=>invitation.slug===slug);
