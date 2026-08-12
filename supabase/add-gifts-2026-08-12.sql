begin;

insert into public.gift_categories(name,sort_order) values
('Roupa e têxteis',7),('Brincar e descobrir',8)
on conflict (name) do update set sort_order=excluded.sort_order;

insert into public.gifts(category_id,name,slug,description,image_url,product_url,gift_type,target_quantity,sort_order)
select c.id,v.name,v.slug,v.description,v.image_url,v.product_url,'single',1,v.sort_order
from public.gift_categories c
join (values
('Higiene e cuidados','Bepanthen Baby 50 g','bepanthen-baby-50g','Pomada para a muda da fralda que protege da vermelhidão e ajuda a regenerar a pele do bebé.','/images/gifts/bepanthen-baby-50g.png','https://wells.pt/bepanthen-baby-50g-7463388.html',31),
('Higiene e cuidados','Uriage Bebé Primeiro Leite Hidratante 500 ml','uriage-leite-hidratante-500ml','Leite corporal hidratante e calmante com Água Termal de Uriage, glicerina e aloé vera.','/images/gifts/uriage-leite-hidratante.jpg','https://wells.pt/primeiro-leite-hidratante-6290044.html',32),
('Roupa e têxteis','Pack de 3 calças com pés MO','pack-3-calcas-pes-mo','Três calças com pés para bebé, em 100% algodão, na seleção multicor indicada.','/images/gifts/calcas-pes-mo.jpg','https://mo-online.com/pt/pack-3-calcas-com-pes-bebe-multicor/000041144231035.html',33),
('Higiene e cuidados','Uriage Bebé Primeira Água Lavante 1 L','uriage-agua-lavante-1l','Água de limpeza sem enxaguamento para o rosto, corpo e zona da fralda do bebé.','/images/gifts/uriage-agua-lavante.jpg','https://wells.pt/primeira-agua-lavante-3587918.html',34),
('Higiene e cuidados','Uriage Bebé Primeiro Creme Lavante 1 L','uriage-creme-lavante-1l','Creme lavante sem sabão para rosto, corpo e couro cabeludo, adequado desde o nascimento.','/images/gifts/uriage-creme-lavante.jpg','https://wells.pt/primeiro-creme-lavante-bebe-4469389.html',35),
('Brincar e descobrir','Tapete de estimulação Celeste','tapete-estimulacao-celeste','Tapete de atividades redondo de 90 cm, em linho, branco e taupe, com arcos e brinquedos suspensos.','/images/gifts/tapete-celeste.jpg','https://www.maisonsdumonde.com/PT/pt/p/tapete-de-estimulacao-redondo-cor-linho-branco-e-cor-taupe-diametro-90-celeste-240142.htm',36),
('Roupa e têxteis','Pack de 5 babetes estampados Kiabi','pack-5-babetes-kiabi','Cinco babetes rosa com estampados divertidos e fecho por molas de pressão.',null,'https://www.kiabi.pt/5-babetes-com-estampados-divertidos-com-fecho-de-pressao-rosa_P979276C1072595',37),
('Higiene e cuidados','Uriage Bebé Primeiro Champô 200 ml','uriage-champo-200ml','Champô extra suave para recém-nascidos e bebés, sem sabão e com fórmula que não causa lágrimas.','/images/gifts/uriage-champo.jpg','https://wells.pt/primeiro-champo-bebe-4963658.html',38),
('Alimentação','Chupeta Chicco PhysioForma MiniSoft 0–2m','chupeta-chicco-minisoft-0-2m','Chupeta neutra em silicone extra macio, pequena e leve, concebida para recém-nascidos dos 0 aos 2 meses.','/images/gifts/chupeta-chicco-minisoft.jpg','https://www.chicco.pt/produtos/amamentacao-e-chupetas/chupetas/chupetas-physio-soft/chupeta-physioforma%C2%AE-mini-soft-0-2m--8058664172665-00073211130000.html',39),
('Alimentação','Pack de 2 chupetas Chicco Physio Air 2–6m','chupetas-chicco-physio-air-2-6m','Duas chupetas de silicone rosa Panda Huff, com escudo ventilado e formato ergonómico.','/images/gifts/chupetas-chicco-physio-air.jpg','https://www.chicco.pt/produtos/amamentacao-e-chupetas/chupetas/chupetas-com-escudo-rigido/chupetas-physio-air-2-6m-8058664171538-00075031330000.html',40),
('Roupa e têxteis','Pack de 3 panos de musselina H&M','pack-3-musselinas-hm','Três panos de musselina de algodão em bege, branco e castanho claro.','/images/gifts/musselinas-hm-3.jpg','https://www2.hm.com/pt_pt/productpage.1091311017.html',41),
('Roupa e têxteis','Pack de 2 panos de musselina H&M floral','pack-2-musselinas-hm-floral','Dois panos de musselina em algodão orgânico, na variante bege claro com padrão floral.','/images/gifts/musselinas-hm-2-floral.jpg','https://www2.hm.com/pt_pt/productpage.1233100001.html',42),
('Roupa e têxteis','Pack de 5 bodies traçados H&M','pack-5-bodies-hm-girafas','Cinco bodies traçados de manga comprida, em tons neutros e com motivos de girafas.','/images/gifts/bodies-hm-girafas.jpg','https://www2.hm.com/pt_pt/productpage.0814306065.html',43),
('Roupa e têxteis','Pack de 2 pijamas com fecho H&M','pack-2-pijamas-hm-girafas','Dois pijamas inteiros em algodão, na variante bege claro e creme com girafas.','/images/gifts/pijamas-hm-girafas.jpg','https://www2.hm.com/pt_pt/productpage.1346276001.html',44),
('Roupa e têxteis','Manta dupla face Kiabi','manta-dupla-face-kiabi','Manta bege para bebé com uma face em jersey e outra em malha macia.','/images/gifts/manta-kiabi-bege.jpg','https://www.kiabi.pt/manta-com-uma-face-em-jersei-e-uma-face-em-malha-macia-bege_P1088417C1088418',45),
('Roupa e têxteis','Conjunto de 2 peças H&M com girafa','conjunto-2-pecas-hm-girafa','Conjunto bege claro e branco com peto e body de manga comprida em algodão.','/images/gifts/conjunto-hm-girafa.jpg','https://www2.hm.com/pt_pt/productpage.1296864002.html',46),
('Alimentação','Chupeta Suavinex Smoothie SX Pro 0–6m','chupeta-suavinex-smoothie-0-6m','Chupeta fisiológica em silicone, supermacia e flexível, na cor bege suave.','/images/gifts/chupeta-suavinex-smoothie.jpg','https://wells.pt/smoothie-0-6m-sx-pro-8492183.html',47),
('Alimentação','Pack de porta-chupetas em silicone','pack-porta-chupetas-silicone','Conjunto com dois estojos de silicone e três chupetas transparentes, na variante A.','/images/gifts/porta-chupetas-silicone.jpg','https://www.amazon.es/dp/B0DSW1P5PD?th=1',48)
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
