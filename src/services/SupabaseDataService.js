import {supabase} from '../lib/supabase';

const throwIfError=error=>{if(error)throw error};
const mapGuest=g=>({id:g.id,name:g.name,type:g.invitation_type,status:g.response_status,createdAt:g.created_at,updatedAt:g.updated_at});
const mapRsvp=r=>({id:r.id,guestListId:r.invitation_id,fullName:r.full_name,adults:r.adults_count,children:r.children_count,guests:r.guests_count,status:r.attendance_status,message:r.message,source:r.source,createdAt:r.created_at,updatedAt:r.updated_at});
const mapGift=g=>({id:g.id,name:g.name,category:g.category_name,type:g.gift_type,target:g.target_quantity,reserved:g.reserved_quantity,description:g.description,emoji:g.emoji,image:g.image_url,url:g.product_url,status:g.status,isVisible:g.is_visible??g.status!=='hidden',sortOrder:g.sort_order});
const mapReservation=r=>({id:r.id,giftId:r.gift_id,guestName:r.guest_name,quantity:r.quantity,status:r.status,token:r.token,createdAt:r.created_at,updatedAt:r.updated_at});

const service={
  async getGifts(){const {data,error}=await supabase.rpc('get_public_gifts');throwIfError(error);return (data||[]).map(mapGift)},
  async getAdminGifts(){const {data,error}=await supabase.from('gifts').select('*, gift_categories(name), gift_reservations(quantity,status)').order('sort_order');throwIfError(error);return (data||[]).map(g=>mapGift({...g,category_name:g.gift_categories?.name,reserved_quantity:(g.gift_reservations||[]).filter(r=>r.status==='active').reduce((sum,r)=>sum+Number(r.quantity||0),0)}))},
  async getGuests(){const {data:{session}}=await supabase.auth.getSession();if(session){const {data,error}=await supabase.from('guest_invitations').select('*').order('name');throwIfError(error);return (data||[]).map(mapGuest)}const {data,error}=await supabase.rpc('get_public_invitations');throwIfError(error);return (data||[]).map(g=>mapGuest({...g,response_status:'pending'}))},
  async getRsvps(){const {data,error}=await supabase.from('rsvps').select('*').order('created_at',{ascending:false});throwIfError(error);return (data||[]).map(mapRsvp)},
  async getReservations(){const {data,error}=await supabase.from('gift_reservations').select('*').order('created_at',{ascending:false});throwIfError(error);return (data||[]).map(mapReservation)},
  async addRsvp(v){const {data,error}=await supabase.rpc('create_rsvp',{p_invitation_id:v.guestListId||null,p_full_name:v.fullName,p_adults_count:Number(v.adults),p_children_count:Number(v.children),p_attendance_status:v.status,p_message:v.message||null,p_source:v.source||'site'});throwIfError(error);return data},
  async addGuest(v){const {data,error}=await supabase.from('guest_invitations').insert({name:v.name.trim(),invitation_type:v.type||'individual',response_status:v.status||'pending'}).select().single();throwIfError(error);return mapGuest(data)},
  async updateGuest(id,v){const values={};if(v.name!==undefined)values.name=v.name.trim();if(v.type!==undefined)values.invitation_type=v.type;if(v.status!==undefined)values.response_status=v.status;const {data,error}=await supabase.from('guest_invitations').update(values).eq('id',id).select().single();throwIfError(error);return mapGuest(data)},
  async updateGuests(ids,v){if(!ids.length)return[];const values={};if(v.status!==undefined)values.response_status=v.status;if(v.type!==undefined)values.invitation_type=v.type;const {data,error}=await supabase.from('guest_invitations').update(values).in('id',ids).select();throwIfError(error);return (data||[]).map(mapGuest)},
  async deleteGuest(id){const {error}=await supabase.from('guest_invitations').delete().eq('id',id);throwIfError(error)},
  async updateGiftTarget(id,target){const {data,error}=await supabase.rpc('admin_update_gift_target',{p_gift_id:id,p_target_quantity:Number(target)});throwIfError(error);return data},
  async setGiftVisibility(id,isVisible){const {data,error}=await supabase.from('gifts').update({is_visible:Boolean(isVisible),status:isVisible?'available':'hidden'}).eq('id',id).select().single();throwIfError(error);return mapGift(data)},
  async reserve(giftId,v){const {data,error}=await supabase.rpc('create_gift_reservation',{p_gift_id:giftId,p_guest_name:v.guestName,p_quantity:v.quantity||1});throwIfError(error);return data},
  async getReservation(token){const {data,error}=await supabase.rpc('get_reservation_by_token',{p_token:token});throwIfError(error);const row=data?.[0];return row?mapReservation(row):null},
  async updateReservation(token,v){const {error}=await supabase.rpc('update_reservation_by_token',{p_token:token,p_guest_name:v.guestName,p_quantity:Number(v.quantity)});throwIfError(error);return service.getReservation(token)},
  async cancelReservation(token){const {error}=await supabase.rpc('cancel_reservation_by_token',{p_token:token});throwIfError(error)},
  subscribe(callback){const channel=supabase.channel('admin-live-updates').on('postgres_changes',{event:'*',schema:'public',table:'rsvps'},callback).on('postgres_changes',{event:'*',schema:'public',table:'guest_invitations'},callback).on('postgres_changes',{event:'*',schema:'public',table:'gifts'},callback).on('postgres_changes',{event:'*',schema:'public',table:'gift_reservations'},callback).subscribe();return()=>supabase.removeChannel(channel)}
};

export default service;
