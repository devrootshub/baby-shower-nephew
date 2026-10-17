import {useEffect,useState} from 'react';
import {dataService,isDemo} from '../../services';

export default function PostEventSettings(){
  const [settings,setSettings]=useState({eventStatus:'open',galleryEnabled:false});
  const [items,setItems]=useState([]);
  const [files,setFiles]=useState([]);
  const [busy,setBusy]=useState('');
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');

  const load=async()=>{const [eventSettings,galleryItems]=await Promise.all([dataService.getEventSettings(),dataService.getAdminGalleryItems()]);setSettings(eventSettings||{eventStatus:'open',galleryEnabled:false});setItems(galleryItems)};
  useEffect(()=>{load().catch(()=>setError('Não foi possível carregar as configurações.'))},[]);
  const saveSettings=async changes=>{setBusy('settings');setError('');setNotice('');try{const next=await dataService.updateEventSettings(changes);setSettings(next);setNotice(changes.eventStatus?'Estado do evento atualizado.':'Galeria atualizada.')}catch{setError('Não foi possível guardar esta alteração.')}finally{setBusy('')}};
  const upload=async e=>{e.preventDefault();if(!files.length)return;setBusy('upload');setError('');setNotice('');try{await dataService.uploadGalleryFiles(files);setFiles([]);e.currentTarget.reset();await load();setNotice(`${files.length} ${files.length===1?'ficheiro carregado':'ficheiros carregados'} com sucesso.`)}catch{setError('O carregamento não terminou. Confirma o formato e o tamanho dos ficheiros.')}finally{setBusy('')}};
  const toggleItem=async item=>{setBusy(item.id);try{await dataService.setGalleryItemVisibility(item.id,!item.isVisible);await load()}catch{setError('Não foi possível alterar este ficheiro.')}finally{setBusy('')}};
  const removeItem=async item=>{if(!window.confirm(`Eliminar definitivamente “${item.title}”?`))return;setBusy(item.id);try{await dataService.deleteGalleryItem(item);await load()}catch{setError('Não foi possível eliminar este ficheiro.')}finally{setBusy('')}};

  return <div className="post-event-admin">
    <section className="panel event-control-panel"><div><p className="eyebrow">ESTADO DO WEBSITE</p><h2>{settings.eventStatus==='closed'?'Evento encerrado':'Evento ativo'}</h2><p>{settings.eventStatus==='closed'?'O site público apresenta agora a mensagem de agradecimento.':'As confirmações e a lista de presentes continuam visíveis.'}</p></div><button className={`btn ${settings.eventStatus==='closed'?'':'danger'}`} disabled={busy==='settings'||isDemo} onClick={()=>saveSettings({eventStatus:settings.eventStatus==='closed'?'open':'closed'})}>{settings.eventStatus==='closed'?'Reabrir evento':'Encerrar evento'}</button></section>
    <section className="panel gallery-admin-panel"><div className="gallery-admin-heading"><div><p className="eyebrow">MEMÓRIAS DA FESTA</p><h2>Galeria privada</h2><p>As fotografias e vídeos ficam num espaço privado e só são apresentados depois do login.</p></div><label className="gallery-switch"><input type="checkbox" checked={settings.galleryEnabled} disabled={busy==='settings'||isDemo} onChange={e=>saveSettings({galleryEnabled:e.target.checked})}/><span>{settings.galleryEnabled?'Visível':'Em preparação'}</span></label></div>
      <div className="gallery-security-note"><strong>Proteção real</strong><span>O bucket é privado e cada visualização utiliza um link temporário. A password dos convidados é gerida no Supabase Authentication.</span><a href="#/memorias" target="_blank" rel="noreferrer">Abrir galeria ↗</a></div>
      <form className="gallery-upload" onSubmit={upload}><div><label htmlFor="gallery-files">Adicionar fotografias e vídeos</label><input id="gallery-files" type="file" accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm" multiple onChange={e=>setFiles([...e.target.files])}/><small>Até 50 MB por ficheiro. Para vídeos maiores, comprime-os antes de carregar.</small></div><button className="btn primary" disabled={!files.length||busy==='upload'||isDemo}>{busy==='upload'?'A carregar…':`Carregar${files.length?` (${files.length})`:''}`}</button></form>
      <div className="gallery-admin-list">{items.length?items.map(item=><article key={item.id}><span className="gallery-file-type">{item.mediaType==='video'?'VÍDEO':'FOTO'}</span><div><strong>{item.title}</strong><small>{item.fileName}</small></div><span className={`gift-visibility-pill ${item.isVisible?'active':'inactive'}`}>{item.isVisible?'Visível':'Oculto'}</span><button disabled={busy===item.id} onClick={()=>toggleItem(item)}>{item.isVisible?'Ocultar':'Mostrar'}</button><button className="remove" disabled={busy===item.id} onClick={()=>removeItem(item)}>Eliminar</button></article>):<p className="gallery-admin-empty">Ainda não foram carregadas fotografias ou vídeos.</p>}</div>
    </section>
    {notice&&<p className="success">{notice}</p>}{error&&<p className="error">{error}</p>}
  </div>;
}
