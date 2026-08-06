begin;

update public.gifts
set
  name = 'Espelho panorâmico traseiro Jané',
  description = 'Espelho panorâmico para instalar no apoio de cabeça traseiro e vigiar o bebé durante as viagens, com visão ampla, ajuste de ângulo e vidro antiestilhaço.',
  image_url = '/images/gifts/espelho-vigilancia-jane.jpg',
  product_url = 'https://www.amazon.es/-/pt/Jan%C3%A9-Espejos-vigilancia-autom%C3%B3vil/dp/B0CW6GYTW7?th=1'
where slug = 'espelho-frontal-vigilancia-jane';

commit;
