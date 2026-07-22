import {describe,expect,it} from 'vitest';
import {gifts,guestSeed} from '../src/data/demoData';
import {siteConfig} from '../src/data/siteConfig';

describe('dados de produção',()=>{
  it('carrega a lista atual de convites',()=>{
    expect(guestSeed).toHaveLength(49);
    expect(guestSeed.find(g=>g.name==='Inês (tia babada)')).toBeTruthy();
    expect(new Set(guestSeed.map(g=>g.id)).size).toBe(49);
  });

  it('carrega os vinte presentes com imagens locais',()=>{
    expect(gifts).toHaveLength(20);
    expect(gifts.every(g=>g.image.startsWith('/images/gifts/'))).toBe(true);
    expect(gifts.every(g=>g.target>=1)).toBe(true);
  });

  it('mantém a data e o prazo coerentes',()=>{
    expect(new Date(siteConfig.rsvpDeadline)<new Date(siteConfig.eventDate)).toBe(true);
    expect(siteConfig.eventTime).toBe('14:30');
    expect(siteConfig.eventEndTime).toBe('19:30');
  });
});
