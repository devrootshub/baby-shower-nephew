import {useEffect,useMemo,useState} from 'react';
import {useNavigate,useParams} from 'react-router-dom';
import {Fingerprint,FolderOpen,Heart,Search,ShieldCheck,Sparkles} from 'lucide-react';
import InvitationShareButton from '../components/invitations/InvitationShareButton';
import {getSpecialInvitation} from '../data/specialInvitations';
import {clearSpecialInvitationResponse,getSpecialInvitationResponse,saveSpecialInvitationResponse} from '../services/specialInvitationResponse';

const stages=['entrada','missao','responsabilidades','pergunta','aceite'];

export default function SpecialInvitationPage(){
  const {slug}=useParams();const navigate=useNavigate();
  const invitation=useMemo(()=>getSpecialInvitation(slug),[slug]);
  const [stage,setStage]=useState('entrada');const [terms,setTerms]=useState(0);
  useEffect(()=>{if(getSpecialInvitationResponse(slug)?.accepted)setStage('aceite');},[slug]);
  if(!invitation)return <main className="invitation-page invitation-not-found"><div className="mission-folder"><span className="mission-seal">404</span><p className="eyebrow">ARQUIVO RESERVADO</p><h1>Convite não encontrado</h1><p>Este dossier não existe ou o respetivo link já não está disponível.</p><button className="btn primary" onClick={()=>navigate('/')}>Voltar ao website</button></div></main>;
  const next=()=>setStage(stages[Math.min(stages.indexOf(stage)+1,stages.length-1)]);
  const accept=async()=>{await saveSpecialInvitationResponse(slug,'accepted');setStage('aceite');};
  const restart=()=>{clearSpecialInvitationResponse(slug);setStage('entrada');setTerms(0);};
  return <main className="invitation-page mission-page">
    <div className="mission-orb mission-orb-one"/><div className="mission-orb mission-orb-two"/>
    <section className={`mission-folder stage-${stage}`} aria-live="polite">
      <div className="mission-folder-tab">DOSSIER {invitation.missionNumber}</div>
      <header className="mission-topline"><span><ShieldCheck size={15}/> Nível máximo</span><span>{invitation.agentName}</span></header>
      {stage==='entrada'&&<div className="mission-stage mission-entry">
        <span className="mission-seal">CONFIDENCIAL</span><Fingerprint className="mission-watermark" aria-hidden="true"/>
        <p className="eyebrow">TRANSMISSÃO SEGURA</p><h1>{invitation.title}</h1><p className="mission-destination">Destinatário: <strong>{invitation.personName}</strong></p><p>Foi selecionado/a para uma missão muito especial.</p>
        <button className="btn primary mission-cta" onClick={next}><FolderOpen size={17}/> Abrir missão</button>
      </div>}
      {stage==='missao'&&<div className="mission-stage">
        <p className="eyebrow">DOCUMENTO {invitation.missionNumber}</p><h1>{invitation.treatment}, <em>{invitation.personName}.</em></h1><p>{invitation.introduction}</p><p>{invitation.missionText}</p>
        <article className="mission-name-card"><small>NOME DA MISSÃO</small><strong>{invitation.missionName}</strong><span>Nomeação vitalícia • início imediato</span></article>
        <button className="btn primary mission-cta" onClick={next}>Ver responsabilidades</button>
      </div>}
      {stage==='responsabilidades'&&<div className="mission-stage responsibilities-stage">
        <p className="eyebrow">TERMOS DA MISSÃO</p><h1>Responsabilidades <em>essenciais</em></h1><div className="responsibility-grid">{invitation.responsibilities.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,'0')}</span><p>{item}</p></article>)}</div>
        <button className="btn primary mission-cta" onClick={next}>Continuar a missão</button>
      </div>}
      {stage==='pergunta'&&<div className="mission-stage mission-question">
        <span className="mission-icon"><Search size={29}/></span><p className="eyebrow">DECISÃO FINAL</p><h1>{invitation.personName},<br/><em>{invitation.finalQuestion}</em></h1><p>Esta é uma missão para a vida inteira.</p>
        <div className="mission-actions"><button className="btn primary" onClick={accept}><Heart size={17}/> {invitation.acceptLabel}</button><button className="btn" onClick={()=>setTerms(value=>Math.min(value+1,2))}>{terms===0?invitation.alternativeLabel:terms===1?'Os termos incluem mimos ilimitados':'Está bem… aceito analisar!'}</button></div>
        {terms>0&&<p className="terms-note" role="status">Cláusula adicional: o bebé reserva o direito de pedir colo a qualquer hora.</p>}
      </div>}
      {stage==='aceite'&&<div className="mission-stage mission-accepted">
        <div className="celebration-stars" aria-hidden="true">✦　·　✧　·　✦</div><span className="mission-complete"><Sparkles size={25}/> MISSÃO ACEITE</span><p className="eyebrow">NOMEAÇÃO OFICIALMENTE CONFIRMADA</p><h1>Excelente <em>escolha.</em></h1><p>{invitation.acceptedMessage}</p><p className="mission-signature">{invitation.signature}</p><small>{invitation.note}</small>
        <div className="mission-actions"><InvitationShareButton label="Partilhar a boa notícia" title="Missão aceite" text={`Missão aceite! Fui oficialmente nomeado/a ${invitation.role}.`}/><button className="invitation-link-button" onClick={restart}>Rever a missão</button><button className="invitation-link-button" onClick={()=>navigate('/')}>Website principal</button></div>
      </div>}
    </section>
  </main>;
}
