import {describe,expect,it} from 'vitest';
import {gifts,guestSeed} from '../src/data/demoData';
import {siteConfig} from '../src/data/siteConfig';
import {invitationConfig,pregnancyProgress} from '../src/data/invitationConfig';

describe('dados de produção',()=>{
  it('carrega a lista atual de convites',()=>{
    expect(guestSeed).toHaveLength(49);
    expect(guestSeed.find(g=>g.name==='Inês (tia babada)')).toBeTruthy();
    expect(new Set(guestSeed.map(g=>g.id)).size).toBe(49);
  });

  it('carrega os presentes com imagens locais e fraldas ordenadas por tamanho',()=>{
    expect(gifts).toHaveLength(49);
    expect(gifts.filter(g=>g.image).every(g=>g.image.startsWith('/images/gifts/'))).toBe(true);
    expect(gifts.every(g=>g.target>=1)).toBe(true);
    expect(gifts.filter(g=>g.name.startsWith('Fraldas Dodot')).map(g=>g.name)).toEqual([
      'Fraldas Dodot Sensitive T0',
      'Fraldas Dodot Sensitive T1',
      'Fraldas Dodot Sensitive T2',
      'Fraldas Dodot Sensitive T3'
    ]);
    expect(gifts.filter(g=>g.category==='Roupa e têxteis')).toHaveLength(8);
    expect(gifts.find(g=>g.id==='chat-48').url).toBe('https://www.amazon.es/dp/B0DSW1P5PD?th=1');
    expect(gifts.find(g=>g.id==='chat-37')).toMatchObject({
      name:'Pack de 5 babetes Kiabi — castanho',
      image:'/images/gifts/babetes-kiabi-castanho.png',
      url:'https://www.kiabi.pt/5-babetes-com-estampados-de-fantasia-que-fecham-com-molas-de-pressao-castanho_P979276C979277'
    });
    expect(gifts.find(g=>g.id==='chat-49')).toMatchObject({
      category:'Alimentação',
      url:'https://www.amazon.es/-/pt/GROWNSY-Esterilizador-Biberones-El%C3%A9ctrico-Sacaleches/dp/B0DNYK6V1B?th=1'
    });
  });

  it('mantém a data e o prazo coerentes',()=>{
    expect(new Date(siteConfig.rsvpDeadline)<new Date(siteConfig.eventDate)).toBe(true);
    expect(siteConfig.eventTime).toBe('14:30');
    expect(siteConfig.eventEndTime).toBe('19:30');
  });

  it('calcula o progresso real da gravidez até à data prevista',()=>{
    expect(invitationConfig.estimatedDueDate).toBe('2027-02-08');
    expect(pregnancyProgress(invitationConfig.estimatedDueDate,new Date('2026-05-04T12:00:00Z'))).toBe(0);
    expect(pregnancyProgress(invitationConfig.estimatedDueDate,new Date('2026-08-15T12:00:00Z'))).toBe(37);
    expect(pregnancyProgress(invitationConfig.estimatedDueDate,new Date('2027-02-08T12:00:00Z'))).toBe(100);
  });
});
