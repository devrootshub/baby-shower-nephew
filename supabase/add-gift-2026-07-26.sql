begin;

insert into public.gifts(category_id,name,slug,description,image_url,product_url,gift_type,target_quantity,sort_order)
select
  c.id,
  'Espelho frontal de vigilância Jané',
  'espelho-frontal-vigilancia-jane',
  'Espelho frontal para vigiar o bebé no automóvel, com rotação de 360°, ventosa de alta fixação e vidro antiestilhaço.',
  '/images/gifts/espelho-vigilancia-jane.jpg',
  'https://www.amazon.es/-/pt/Jan%C3%A9-Espejos-vigilancia-autom%C3%B3vil/dp/B0CW6FMYN7?th=1',
  'single',
  1,
  27
from public.gift_categories c
where c.name='Segurança e monitorização'
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
