import {useState} from 'react';

export default function InvitationShareButton({title,text,label='Partilhar convite'}){
  const [feedback,setFeedback]=useState('');
  async function share(){
    const payload={title,text,url:window.location.href};
    try{
      if(navigator.share)await navigator.share(payload);
      else{await navigator.clipboard.writeText(`${text} ${window.location.href}`);setFeedback('Link copiado');setTimeout(()=>setFeedback(''),2200);}
    }catch(error){if(error?.name!=='AbortError')setFeedback('Não foi possível partilhar');}
  }
  return <span className="invitation-share-wrap"><button type="button" className="invitation-link-button" onClick={share}>{label}</button>{feedback&&<small role="status">{feedback}</small>}</span>;
}
