begin;

insert into public.gifts(category_id,name,slug,description,image_url,product_url,gift_type,target_quantity,sort_order)
select c.id,v.name,v.slug,v.description,v.image_url,v.product_url,'single',1,v.sort_order
from public.gift_categories c
join (values
('Higiene e cuidados','Fraldas Dodot Sensitive T0','fraldas-dodot-sensitive-t0','Embalagem de 24 fraldas para recém-nascido, tamanho T0, indicada para menos de 3 kg.','/images/gifts/fraldas-dodot-t0.jpg','https://www.continente.pt/produto/fraldas-sensitive-%3C-3kg-t0-dodot-dodot-6900182.html',21),
('Higiene e cuidados','Fraldas Dodot Sensitive T1','fraldas-dodot-sensitive-t1','Embalagem de 58 fraldas Sensitive, tamanho T1, indicada para bebés dos 2 aos 5 kg.','/images/gifts/fraldas-dodot-t1.jpg','https://www.worten.pt/produtos/fraldas-sensitive-2-5kg-t1-dodot-emb-58-un-8191523',22),
('Higiene e cuidados','Fraldas Dodot Sensitive T2','fraldas-dodot-sensitive-t2','Embalagem de 58 fraldas Sensitive, tamanho T2, indicada para bebés dos 4 aos 8 kg.','/images/gifts/fraldas-dodot-t2.jpg','https://www.worten.pt/produtos/fraldas-sensitive-4-8kg-t2-dodot-emb-58-un-5739754',23),
('Higiene e cuidados','Fraldas Dodot Sensitive T3','fraldas-dodot-sensitive-t3','Embalagem de 78 fraldas Sensitive, tamanho T3, indicada para bebés dos 6 aos 10 kg.','/images/gifts/fraldas-dodot-t3.jpg','https://www.continente.pt/produto/fraldas-sensitive-6-10kg-t3-dodot-dodot-8602081.html',24),
('Higiene e cuidados','Conjunto de toalhas de banho com capuz','toalhas-bebe-capuz','Conjunto de três toalhas macias e absorventes com capuz e padrões de animais.','/images/gifts/toalhas-bebe-capuz.jpg','https://www.amazon.es/-/pt/UieaMsio-Peque%C3%B1os-Patrones-Animales-Absorbente/dp/B0DF7D757Q',25),
('Higiene e cuidados','Conjunto de higiene Jané com nécessaire','kit-higiene-jane','Conjunto de higiene com pente, escova, tesoura, corta-unhas, limas, escova de dentes e termómetro.','/images/gifts/kit-higiene-jane.jpg','https://www.amazon.es/-/pt/Jan%C3%A9-Set-de-Higiene/dp/B08VKWCGPR?th=1',26)
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
