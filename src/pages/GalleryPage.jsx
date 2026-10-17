import {useEffect,useState} from 'react';
import {dataService,isDemo} from '../services';
import {supabase} from '../lib/supabase';

export default function GalleryPage(){
  const [access,setAccess]=useState('checking');
  const [galleryEnabled,setGalleryEnabled]=useState(false);
  const [password,setPassword]=useState('');
  const [items,setItems]=useState([]);
  const [filter,setFilter]=useState('all');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  const loadGallery=async()=>{const rows=await dataService.getGalleryItems();setItems(rows);setAccess('granted')};
  useEffect(()=>{let active=true;(async()=>{try{const settings=await dataService.getEventSettings();if(active)setGalleryEnabled(Boolean(settings?.galleryEnabled));if(isDemo){if(active)setAccess('locked');return}const {data}=await supabase.auth.getSession();if(!data.session){if(active)setAccess('locked');return}const profile=await dataService.getProfile();if(profile&&['admin','gallery_guest'].includes(profile.role))await loadGallery();else if(active)setAccess('locked')}catch{if(active){setError('Não foi possível abrir a galeria. Tenta novamente.');setAccess('locked')}}})();return()=>{active=false}},[]);

  const login=async e=>{e.preventDefault();setBusy(true);setError('');try{await dataService.galleryLogin(password);await loadGallery();setPassword('')}catch{setError('A password não está correta. Confirma e tenta novamente.')}finally{setBusy(false)}};
  const logout=async()=>{await dataService.galleryLogout();setItems([]);setAccess('locked')};
  const visibleItems=filter==='all'?items:items.filter(item=>item.mediaType===filter);
  const filters=[['all','Todos',items.length],['image','Fotos',items.filter(item=>item.mediaType==='image').length],['video','Vídeos',items.filter(item=>item.mediaType==='video').length]];

  if(access==='checking')return <main className="gallery-shell"><div className="gallery-loading">A preparar as memórias…</div></main>;
  if(!galleryEnabled&&access!=='granted')return <main className="gallery-shell"><section className="gallery-gate"><a className="gallery-brand" href="#/">B <span>Baby Shower</span></a><p className="eyebrow">MEMÓRIAS DO NOSSO DIA</p><h1>Estamos a preparar<br/><em>algo muito especial</em></h1><p>As fotografias e os vídeos estarão disponíveis aqui muito em breve.</p><a className="btn primary" href="#/">Voltar ao site</a></section></main>;
  if(access!=='granted')return <main className="gallery-shell"><section className="gallery-gate"><a className="gallery-brand" href="#/">B <span>Baby Shower</span></a><p className="eyebrow">ÁREA PRIVADA</p><h1>As memórias<br/><em>do nosso dia</em></h1><p>Introduz a password partilhada com os convidados para veres e descarregares as fotografias e os vídeos.</p><form onSubmit={login}><label htmlFor="gallery-password">Password</label><input id="gallery-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/>{error&&<p className="error">{error}</p>}<button className="btn primary full" disabled={busy}>{busy?'A entrar…':'Entrar na galeria'}</button></form><a className="gallery-back" href="#/">← Voltar ao site</a></section></main>;
  return <main className="gallery-page"><header className="gallery-header"><a className="gallery-brand" href="#/">B <span>Baby Shower</span></a><div><a href="#/">Site principal</a><button onClick={logout}>Sair</button></div></header><section className="gallery-intro"><p className="eyebrow">16 · 10 · 2026</p><h1>Um dia para<br/><em>recordar sempre</em></h1><div className="gallery-intro-copy"><p>Obrigado por terem celebrado connosco.</p><p>Podem guardar as vossas fotografias e vídeos preferidos.</p></div>{items.length>0&&<nav className="gallery-filters" aria-label="Filtrar memórias">{filters.map(([value,label,count])=><button key={value} className={filter===value?'active':''} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}<span>{count}</span></button>)}</nav>}</section>{visibleItems.length?<section className="memory-grid">{visibleItems.map(item=><article className={`memory-card ${item.mediaType}`} key={item.id}>{item.mediaType==='video'?<video src={item.url} controls preload="metadata"/>:<img src={item.url} alt={item.title} loading="lazy"/>}<div><strong>{item.title}</strong>{item.caption&&<p>{item.caption}</p>}<a className="memory-download" href={item.url} download={item.fileName} target="_blank" rel="noreferrer">Descarregar ↓</a></div></article>)}</section>:<section className="gallery-empty"><p>{items.length?'Ainda não existem memórias deste tipo.':'Ainda estamos a escolher as primeiras memórias para partilhar.'}</p></section>}</main>;
}
