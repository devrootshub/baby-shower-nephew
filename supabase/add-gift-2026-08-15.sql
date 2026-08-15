begin;

insert into public.gifts(category_id,name,slug,description,image_url,product_url,gift_type,target_quantity,sort_order)
select c.id,
  'Esterilizador e secador GROWNSY 5 em 1',
  'esterilizador-secador-grownsy',
  'Esterilizador elétrico a vapor com ciclo rápido de 8 minutos, secagem automática e design modular para biberões e acessórios.',
  '/images/gifts/esterilizador-secador-grownsy.jpg',
  'https://www.amazon.es/-/pt/GROWNSY-Esterilizador-Biberones-El%C3%A9ctrico-Sacaleches/dp/B0DNYK6V1B?th=1',
  'single',1,49
from public.gift_categories c
where c.name='Alimentação'
on conflict (slug) do update set
  category_id=excluded.category_id,
  name=excluded.name,
  description=excluded.description,
  image_url=excluded.image_url,
  product_url=excluded.product_url,
  gift_type=excluded.gift_type,
  target_quantity=excluded.target_quantity,
  sort_order=excluded.sort_order,
  is_visible=true,
  status='available';

commit;
