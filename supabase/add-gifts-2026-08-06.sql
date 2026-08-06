begin;

insert into public.gifts(category_id,name,slug,description,image_url,product_url,gift_type,target_quantity,sort_order)
select c.id,v.name,v.slug,v.description,v.image_url,v.product_url,'single',1,v.sort_order
from public.gift_categories c
join (values
('Higiene e cuidados','Toalhitas Dodot Pure Aqua','toalhitas-dodot-pure-aqua','Pack de 144 toalhitas (3 × 48) com textura suave e loção composta por 99% de água.','/images/gifts/toalhitas-dodot-pure-aqua.png','https://www.continente.pt/produto/toalhitas-bebe-pure-aqua-dodot-dodot-7887535.html',28),
('Passeio e transporte','Mala muda-fraldas RAINSMORE','mala-muda-fraldas-rainsmore','Mala impermeável para bebé com muda-fraldas portátil, porta-chupetas e correias para o carrinho.','/images/gifts/mala-muda-fraldas-rainsmore.jpg','https://www.amazon.es/-/pt/RAINSMORE-cambiadora-impermeable-cambiador-port%C3%A1til/dp/B0DRSL7L6F?th=1',29),
('Higiene e cuidados','Aspirador nasal elétrico Baby Wells','aspirador-nasal-eletrico-baby-wells','Aspirador nasal desde o nascimento, com dois níveis de sucção, bocais reutilizáveis e carregamento USB-C.','/images/gifts/aspirador-nasal-eletrico-wells.jpg','https://wells.pt/aspirador-nasal-eletrico-0m-8631407.html',30)
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
