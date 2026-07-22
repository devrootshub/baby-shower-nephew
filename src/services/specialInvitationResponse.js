const STORAGE_PREFIX='baby-shower-special-invitation:';

export function getSpecialInvitationResponse(slug){
  try{return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${slug}`));}catch{return null;}
}

export async function saveSpecialInvitationResponse(slug,response){
  const record={slug,response,accepted:response==='accepted',respondedAt:new Date().toISOString()};
  localStorage.setItem(`${STORAGE_PREFIX}${slug}`,JSON.stringify(record));
  // Ponto único de integração futura com o Supabase.
  return record;
}

export function clearSpecialInvitationResponse(slug){localStorage.removeItem(`${STORAGE_PREFIX}${slug}`);}
