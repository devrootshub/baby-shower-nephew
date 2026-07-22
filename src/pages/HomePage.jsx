import Header from '../components/public/Header';
import Countdown from '../components/public/Countdown';
import RSVPForm from '../components/public/RSVPForm';
import GiftRegistry from '../components/public/GiftRegistry';
import {siteConfig as c} from '../data/siteConfig';

const formatDate=d=>new Intl.DateTimeFormat('pt-PT',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${d}T12:00:00`));
const goTo=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});

export default function HomePage(){
  const dateLabel=c.eventDate==='EVENT_DATE'?'Data a anunciar':formatDate(c.eventDate);
  if(c.eventStatus==='closed')return <><Header/><main className="closed"><div className="bear">🧸</div><p className="eyebrow">O NOSSO CORAÇÃO ESTÁ CHEIO</p><h1>{c.closedTitle}</h1><p>{c.closedMessage}</p><em>{c.closedSignature}</em></main></>;
  return <><Header/><main>
    <section className="hero" id="inicio">
      <div className="hero-copy"><p className="eyebrow">UM DIA ESPECIAL • UMA NOVA AVENTURA</p><h1>Um bebé<br/><em>está a chegar</em></h1><p className="hero-sub">{c.subtitle}</p><div className="hero-meta"><span>✦ {dateLabel}</span><span>⌖ {c.venueName}, Setúbal</span></div><div className="hero-buttons"><button className="btn primary" onClick={()=>goTo('confirmar')}>Confirmar presença</button><button className="btn ghost" onClick={()=>goTo('presentes')}>Ver presentes</button></div></div>
      <div className="hero-scene" aria-label="Cenário elegante de baby shower com balões neutros, ursinho e blocos BABY"><img src={`${import.meta.env.BASE_URL}images/hero-baby-shower.png`} alt="Decoração elegante e neutra com balões creme, painéis arredondados, ursinho e blocos BABY"/></div>
      <div className="scroll-hint">DESCOBRIR <span>↓</span></div>
    </section>
    <section className="section event" id="evento"><div className="section-head"><p className="eyebrow">GUARDA ESTE DIA</p><h2>Todos os detalhes,<br/><em>num só lugar</em></h2></div><div className="details-grid"><article><span>01</span><small>DATA</small><h3>{dateLabel}</h3><p>Uma sexta-feira para celebrarmos juntos.</p></article><article><span>02</span><small>HORA</small><h3>{c.eventTime} — {c.eventEndTime}</h3><p>Chega com tempo para aproveitarmos toda a tarde.</p></article><article><span>03</span><small>LOCAL</small><h3>{c.venueName}</h3><p>{c.address}</p><a href={c.mapsUrl} target="_blank" rel="noreferrer">Abrir no Google Maps ↗</a></article></div><Countdown date={c.eventDate} time={c.eventTime}/></section>
    <section className="message-section"><div className="message-card"><span className="quote">“</span><p>{c.parentsMessage}</p><em>{c.parentsSignature}</em></div></section>
    <section className="section rsvp" id="confirmar"><div className="section-head"><p className="eyebrow">VENS CELEBRAR CONNOSCO?</p><h2>Confirma a tua<br/><em>presença</em></h2><p>Confirma até 1 de outubro. Demora menos de um minuto.</p></div><RSVPForm/></section>
    <section className="section gifts" id="presentes"><div className="section-head centered"><p className="eyebrow">UM MIMINHO PARA O BEBÉ</p><h2>Lista de <em>presentes</em></h2><p>O link indicado para cada artigo é apenas uma sugestão de compra. Podes comprar o artigo na loja indicada ou noutro local da tua preferência.</p></div><GiftRegistry/></section>
  </main><footer><div className="brand"><span>B</span> baby shower</div><div className="footer-copy"><p>Feito com muito carinho pela <strong><em>tia babada</em></strong><br className="footer-break"/> para um dia muito especial.</p><small>© {new Date().getFullYear()} DevRoots. Todos os direitos reservados.</small></div><button className="footer-top" onClick={()=>goTo('inicio')}>Voltar ao topo ↑</button></footer></>;
}
