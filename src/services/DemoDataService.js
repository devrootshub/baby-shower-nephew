import {gifts as seedGifts,demoRsvps,guestSeed} from '../data/demoData';
const KEY='baby-shower-demo-v7';
const clone=v=>JSON.parse(JSON.stringify(v));
class DemoDataService{
  constructor(){this.listeners=new Set();this.load()}
  load(){const raw=localStorage.getItem(KEY);this.data=raw?JSON.parse(raw):{gifts:clone(seedGifts),rsvps:clone(demoRsvps),guests:clone(guestSeed),reservations:[],activities:[]};this.data.guests||=clone(guestSeed)}
  save(){localStorage.setItem(KEY,JSON.stringify(this.data));this.listeners.forEach(f=>f())}
  subscribe(f){this.listeners.add(f);return()=>this.listeners.delete(f)}
  async getGifts(){return clone(this.data.gifts)} async getRsvps(){return clone(this.data.rsvps)} async getGuests(){return clone(this.data.guests)} async getReservations(){return clone(this.data.reservations)}
  async updateGiftTarget(id,target){const gift=this.data.gifts.find(g=>g.id===id);if(!gift)throw new Error('not-found');const next=Number(target);if(next<Number(gift.reserved||0))throw new Error('below-reserved');gift.target=next;this.log(`A quantidade de ${gift.name} foi atualizada`);this.save();return clone(gift)}
  async addGuest(v){const row={id:crypto.randomUUID(),name:v.name.trim(),type:v.type||'adult',status:v.status||'pending',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};this.data.guests.push(row);this.log(`${row.name} foi adicionado à lista`);this.save();return clone(row)}
  async updateGuest(id,v){const guest=this.data.guests.find(g=>g.id===id);if(!guest)throw new Error('not-found');Object.assign(guest,v,{name:(v.name??guest.name).trim(),updatedAt:new Date().toISOString()});this.log(`${guest.name} foi atualizado`);this.save();return clone(guest)}
  async deleteGuest(id){const guest=this.data.guests.find(g=>g.id===id);if(!guest)return;this.data.guests=this.data.guests.filter(g=>g.id!==id);this.log(`${guest.name} foi removido da lista`);this.save()}
  async updateGuests(ids,values){this.data.guests.forEach(g=>{if(ids.includes(g.id))Object.assign(g,values,{updatedAt:new Date().toISOString()})});this.save();return clone(this.data.guests)}
  async addRsvp(v){const adults=Number(v.adults||0),children=Number(v.children||0);const row={id:crypto.randomUUID(),...v,adults,children,guests:adults+children,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};this.data.rsvps.unshift(row);const clean=s=>s.trim().toLocaleLowerCase('pt-PT');const listed=v.guestListId?this.data.guests.find(g=>g.id===v.guestListId):this.data.guests.find(g=>clean(g.name)===clean(v.fullName||''));if(listed)Object.assign(listed,{status:v.status,updatedAt:new Date().toISOString()});this.log(`${v.fullName} enviou uma confirmação`);this.save();return row}
  async reserve(giftId,v){const gift=this.data.gifts.find(g=>g.id===giftId);if(!gift||gift.reserved+(v.quantity||1)>gift.target)throw new Error('unavailable');const token=crypto.randomUUID()+'-'+crypto.randomUUID();gift.reserved+=(v.quantity||1);const row={id:crypto.randomUUID(),giftId,guestName:v.guestName,quantity:v.quantity||1,status:'active',token,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};this.data.reservations.unshift(row);this.log(`${v.guestName} reservou ${gift.name}`);this.save();localStorage.setItem('baby-reservation-ref',token);return clone(row)}
  async getReservation(token){return clone(this.data.reservations.find(r=>r.token===token)||null)}
  async updateReservation(token,v){const r=this.data.reservations.find(x=>x.token===token);if(!r)throw new Error('not-found');const gift=this.data.gifts.find(g=>g.id===r.giftId);const next=Number(v.quantity||r.quantity);if(gift.reserved-r.quantity+next>gift.target)throw new Error('unavailable');gift.reserved=gift.reserved-r.quantity+next;Object.assign(r,v,{quantity:next,updatedAt:new Date().toISOString()});this.log('Uma reserva foi alterada');this.save();return clone(r)}
  async cancelReservation(token){const r=this.data.reservations.find(x=>x.token===token);if(!r)return;const gift=this.data.gifts.find(g=>g.id===r.giftId);gift.reserved-=r.quantity;r.status='cancelled';this.log('Uma reserva foi cancelada');this.save()}
  log(description){this.data.activities.unshift({id:crypto.randomUUID(),description,createdAt:new Date().toISOString()})}
}
export default new DemoDataService();
