begin;

update public.gifts
set product_url='https://www.babycool.com/products/muda-fraldas-em-espuma-nattou-taupe-70x50cm'
where slug='trocador-nattou';

update public.gifts
set product_url='https://www.babycool.com/products/contentor-para-fraldas-dropy-taupe'
where slug='contentor-fraldas';

commit;
