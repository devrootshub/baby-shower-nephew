begin;

insert into public.gifts(category_id,name,slug,description,image_url,product_url,gift_type,target_quantity,sort_order)
select c.id,v.name,v.slug,v.description,v.image_url,v.product_url,'single',1,v.sort_order
from public.gift_categories c
join (values
('Alimentação','Aquecedor portátil de biberões','aquecedor-biberoes-portatil','Aquecedor portátil STELASPLEN com aquecimento rápido e retenção de calor até 5 horas.','/images/gifts/aquecedor-biberoes-portatil.jpg','https://www.worten.pt/produtos/aquecedor-portatil-de-biberoes-aquecimento-rapido-com-ate-5-horas-de-retencao-continua-do-calor-ideal-para-viagens-criancas-ed-perfe-stelasplen-mrkean-9785805678722',14),
('Alimentação','Conjunto de biberões Philips Avent AirFree','kit-biberoes-avent','Conjunto para recém-nascido com quatro biberões, chupeta, escovilhão e sistema AirFree.','/images/gifts/kit-biberoes-avent.jpg','https://www.amazon.es/dp/B0BWFLY8HV',15),
('Higiene e cuidados','Banheira de bebé com suporte','banheira-bebe-suporte','Banheira dobrável com suporte, termómetro digital, almofada ergonómica e pés antiderrapantes.','/images/gifts/banheira-bebe.jpg','https://www.amazon.es/-/pt/Ba%C3%B1era-Bebe-Patas-Antideslizantes-Instrucciones/dp/B0GWY8CJYT',16),
('Quarto e descanso','Cadeira de balanço elétrica JFOVMCYG','balanco-eletrico-jfovmcyg','Cadeira de balanço elétrica com controlo remoto, cinco velocidades, temporizador e arnês de cinco pontos.','/images/gifts/balanco-eletrico.jpg','https://www.amazon.es/-/pt/JFOVMCYG-el%C3%A9ctrico-velocidades-temporizador-estructura/dp/B0DCSH3ML6?th=1',17),
('Amamentação','Discos absorventes antibacterianos Chicco','discos-amamentacao-chicco','Discos de amamentação finos, respiráveis e superabsorventes com proteção antibacteriana.','/images/gifts/discos-amamentacao-chicco.jpg','https://wells.pt/discos-absorventes-antibacterianos-4079503.html',18),
('Amamentação','Bolsas de armazenamento de leite Momcozy','bolsas-leite-momcozy','Pack de 50 bolsas de 180 ml com fecho seguro e indicador de temperatura.','/images/gifts/bolsas-leite-momcozy.jpg','https://www.amazon.es/-/pt/momcozy-Momcozy-Bolsas-almacenamiento-leche/dp/B0CFTPV74K?th=1',19),
('Higiene e cuidados','Lima elétrica de unhas RIGHTWELL','lima-unhas-bebe','Kit 6 em 1 silencioso com luz LED, adequado para recém-nascidos, bebés e crianças.','/images/gifts/lima-unhas-bebe.jpg','https://www.amazon.es/-/pt/Lima-U%C3%B1as-Bebe-para-Beb%C3%A9s/dp/B08BL634GV',20)
) as v(category_name,name,slug,description,image_url,product_url,sort_order) on v.category_name=c.name
on conflict (slug) do update set
  category_id=excluded.category_id,
  name=excluded.name,
  description=excluded.description,
  image_url=excluded.image_url,
  product_url=excluded.product_url,
  sort_order=excluded.sort_order,
  is_visible=true,
  status='available';

commit;
