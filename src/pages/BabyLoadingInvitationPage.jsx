import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {invitationConfig as config} from '../data/invitationConfig';

function BabyScene(){return <div className="loading-scene" aria-label="Portal de chegada com ursinho, lua, balões neutros e blocos BABY"><div className="loading-arch"><span className="loading-moon"/><span className="loading-star ls-one">✦</span><span className="loading-star ls-two">·</span><span className="loading-star ls-three">✧</span><span className="loading-bear" role="img" aria-label="Ursinho a completar a palavra BABY">🧸</span></div><span className="loading-balloon lb-one"/><span className="loading-balloon lb-two"/><div className="loading-blocks" aria-hidden="true"><i>B</i><i>A</i><i>B</i><i className="loading-last-block">Y</i></div></div>}

export default function BabyLoadingInvitationPage(){
  const [view,setView]=useState('interactive');const navigate=useNavigate();
  const openDetails=()=>{navigate('/');setTimeout(()=>document.getElementById(config.detailsSection)?.scrollIntoView({behavior:'smooth'}),100);};
  return <main className={`invitation-page loading-page ${view==='card'?'card-preview':''}`}>
    <div className="invitation-dev-switch" aria-label="Pré-visualização do convite"><button className={view==='interactive'?'active':''} onClick={()=>setView('interactive')}>Interativo</button><button className={view==='card'?'active':''} onClick={()=>setView('card')}>Cartão</button></div>
    <section className="loading-card">
      <div className="loading-brand"><span>B</span><small>JÉSSICA & DAVID</small></div><BabyScene/>
      <div className="loading-copy"><p className="eyebrow">UM NOVO CAPÍTULO ESTÁ A COMEÇAR</p><h1>{config.title}</h1><div className="loading-progress" aria-label={`Baby loading: ${config.babyLoadingPercentage}%`}><span style={{'--loading-progress':`${config.babyLoadingPercentage}%`}}/><b>{config.babyLoadingPercentage}%</b></div>
      <h2>{config.headline}</h2><strong>{config.invitation}</strong><p>{config.callToAction}</p>
      <button className="btn primary loading-cta" onClick={openDetails}>Ver todos os detalhes</button><small className="loading-hint">Abre o link para descobrires tudo.</small>
      </div>
    </section>
  </main>;
}
