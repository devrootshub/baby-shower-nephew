import {useEffect,useState} from 'react';
import {isDemo,dataService} from '../services';
import {supabase} from '../lib/supabase';

export default function AdminPage(){
  const [session,setSession]=useState(isDemo&&import.meta.env.DEV?sessionStorage.getItem('demo-admin'):'');
  const [form,setForm]=useState({user:'',password:''});
  const [error,setError]=useState('');
  useEffect(()=>{supabase?.auth.getSession().then(({data})=>setSession(data.session));const {data}=supabase?.auth.onAuthStateChange((_,s)=>setSession(s))||{};return()=>data?.subscription?.unsubscribe()},[]);
  const login=async e=>{e.preventDefault();setError('');if(form.user.trim().toLowerCase()!==(import.meta.env.VITE_ADMIN_USERNAME||'babyadmin').toLowerCase()){setError('Não foi possível iniciar sessão. Verifica os dados e tenta novamente.');return}if(isDemo&&import.meta.env.DEV){sessionStorage.setItem('demo-admin','1');setSession('demo');return}const email=import.meta.env.VITE_ADMIN_AUTH_EMAIL;if(!email){setError('A autenticação administrativa ainda não está configurada.');return}const {error}=await supabase.auth.signInWithPassword({email,password:form.password});if(error)setError('Não foi possível iniciar sessão. Verifica os dados e tenta novamente.')};
  if(session)return <AdminDashboard logout={async()=>{sessionStorage.removeItem('demo-admin');await supabase?.auth.signOut();setSession('')}}/>;
  return <main className="admin-login"><div className="login-card"><div className="brand"><span>B</span> baby shower</div><p className="eyebrow">ÁREA RESERVADA</p><h1>Bem-vinda</h1><p>Inicia sessão para gerir o evento.</p>{isDemo&&import.meta.env.DEV&&<p className="demo-note">Modo demo: utiliza “babyadmin” e qualquer password não vazia.</p>}<form onSubmit={login}><div className="field"><label>Utilizador</label><input value={form.user} onChange={e=>setForm({...form,user:e.target.value})} required/></div><div className="field"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>{error&&<p className="error">{error}</p>}<button className="btn primary full">Entrar</button></form><a href="#/">← Voltar ao site</a></div></main>
}

function AdminDashboard({logout}){
  const [tab,setTab]=useState('Resumo');
  const [data,setData]=useState({rsvps:[],guests:[],gifts:[],reservations:[]});
  const load=()=>Promise.all([dataService.getRsvps?.()||[],dataService.getGuests?.()||[],dataService.getGifts(),dataService.getReservations?.()||[]]).then(([rsvps,guests,gifts,reservations])=>setData({rsvps,guests,gifts,reservations}));
  useEffect(()=>{load();return dataService.subscribe?.(load)},[]);
  const reservationRows=data.reservations.map(r=>{const gift=data.gifts.find(g=>g.id===r.giftId);return {...r,giftName:gift?.name||'Presente',giftDescription:gift?.description||'—'}});
  return <div className="admin-shell">
    <aside><div className="brand"><span>B</span> baby shower</div>{['Resumo','Confirmações','Presentes','Reservas','Configurações','Exportações'].map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>)}<button onClick={logout}>Terminar sessão</button></aside>
    <main className="admin-main"><div className="admin-top"><div><p className="eyebrow">BABY SHOWER</p><h1>{tab}</h1></div>{isDemo&&<span className="badge">Modo demo</span>}</div>
      {tab==='Resumo'&&<AdminSummary data={data}/>} 
      {tab==='Confirmações'&&<ConfirmationsPage data={data} reload={load}/>} 
      {tab==='Presentes'&&<GiftsAdminPage gifts={data.gifts} reload={load}/>} 
      {tab==='Reservas'&&<ReservationsAdminPage rows={reservationRows}/>} 
      {tab==='Configurações'&&<section className="panel"><h2>Configurações do evento</h2><p>Os dados principais encontram-se centralizados em <code>src/data/siteConfig.js</code>. Depois de ligares o Supabase, esta área passa a guardar as alterações na base de dados.</p><button className="btn danger" onClick={()=>alert('No modo demo esta ação é apenas ilustrativa.')}>Encerrar evento</button></section>}
      {tab==='Exportações'&&<ExportPanel data={data}/>} 
    </main>
  </div>
}

function AdminSummary({data}){
  const attending=data.rsvps.filter(r=>r.status==='yes');
  const declined=data.rsvps.filter(r=>r.status==='no').length;
  const adults=attending.reduce((sum,r)=>sum+Number(r.adults??r.guests??0),0);
  const children=attending.reduce((sum,r)=>sum+Number(r.children??0),0);
  const activeReservations=data.reservations.filter(r=>r.status==='active').length;
  const target=data.gifts.reduce((sum,g)=>sum+Number(g.target||0),0);
  const reserved=data.gifts.reduce((sum,g)=>sum+Number(g.reserved||0),0);
  const percentage=target?Math.round(reserved/target*100):0;
  const byNewest=(a,b)=>new Date(b.createdAt||b.updatedAt||0)-new Date(a.createdAt||a.updatedAt||0);
  const latestRsvps=[...data.rsvps].sort(byNewest).slice(0,3);
  const latestReservations=[...data.reservations].filter(r=>r.status==='active').sort(byNewest).slice(0,3).map(r=>({...r,gift:data.gifts.find(g=>g.id===r.giftId)}));
  return <div className="summary-sections">
    <section className="summary-block" aria-labelledby="summary-guests"><div className="summary-heading"><div><p className="eyebrow">PRESENÇAS</p><h2 id="summary-guests">Convidados</h2></div><span>{adults+children} confirmados</span></div><div className="summary-grid guests"><Stat n={data.rsvps.length} label="Respostas" icon="✦"/><Stat n={adults+children} label="Convidados confirmados" icon="◉" featured/><Stat n={adults} label="Adultos" icon="♙"/><Stat n={children} label="Crianças" icon="☆"/><Stat n={declined} label="Não vão estar presentes" icon="—"/></div></section>
    <section className="summary-block" aria-labelledby="summary-gifts"><div className="summary-heading"><div><p className="eyebrow">LISTA COLABORATIVA</p><h2 id="summary-gifts">Presentes</h2></div><span>{percentage}% assegurada</span></div><div className="summary-grid gifts-summary"><Stat n={activeReservations} label="Reservas" icon="◇"/><Stat n={`${percentage}%`} label="Lista assegurada" icon="✓" featured/></div><div className="summary-progress"><span style={{width:`${percentage}%`}}/><small>{reserved} de {target} artigos assegurados</small></div></section>
    <div className="recent-grid">
      <RecentBlock eyebrow="ATIVIDADE RECENTE" title="Últimas confirmações" empty="Ainda não existem confirmações.">
        {latestRsvps.map(r=><RecentRow key={r.id} title={r.fullName||r.name||'Convidado'} meta={r.status==='yes'?`${Number(r.adults??r.guests??0)+Number(r.children??0)} convidado(s)`:'Não vai estar presente'} date={r.createdAt} tone={r.status==='yes'?'positive':'muted'}/>) }
      </RecentBlock>
      <RecentBlock eyebrow="LISTA DE PRESENTES" title="Últimas reservas" empty="Ainda não existem reservas.">
        {latestReservations.map(r=><RecentRow key={r.id} title={r.gift?.name||'Presente'} meta={`${r.guestName||'Convidado'} · ${r.quantity||1} un.`} date={r.createdAt} tone="gold"/>) }
      </RecentBlock>
    </div>
    <div className="summary-notice"><span>ℹ</span><p>Estás no modo de demonstração. Os dados ficam guardados apenas neste dispositivo.</p></div>
  </div>
}

const Stat=({n,label,icon,featured=false})=><article className={`stat ${featured?'featured':''}`}><span className="stat-icon" aria-hidden="true">{icon}</span><strong>{n}</strong><span>{label}</span></article>;

const RecentBlock=({eyebrow,title,empty,children})=><section className="recent-block"><div className="recent-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><span>Últimos 3</span></div><div className="recent-list">{children?.length?children:<p className="recent-empty">{empty}</p>}</div></section>;

const RecentRow=({title,meta,date,tone})=><article className="recent-row"><span className={`recent-dot ${tone}`} aria-hidden="true"/><div><strong>{title}</strong><small>{meta}</small></div><time>{date?new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'short'}).format(new Date(date)):'—'}</time></article>;

function ConfirmationsPage({data,reload}){
  const [query,setQuery]=useState('');
  const [modal,setModal]=useState(null);
  const [selectedGuest,setSelectedGuest]=useState(null);
  const [guestForm,setGuestForm]=useState({name:'',type:'individual'});
  const [manual,setManual]=useState({fullName:'',adults:1,children:0,status:'yes',message:'Confirmação registada manualmente pelos pais.',guestIds:[]});
  const pinnedName='Inês (tia babada)';
  const orderedGuests=[...data.guests].sort((a,b)=>a.name===pinnedName?-1:b.name===pinnedName?1:a.name.localeCompare(b.name,'pt-PT',{sensitivity:'base'}));
  const filtered=orderedGuests.filter(g=>g.name.toLocaleLowerCase('pt-PT').includes(query.toLocaleLowerCase('pt-PT')));
  const counts={all:data.guests.length,yes:data.guests.filter(g=>g.status==='yes').length,no:data.guests.filter(g=>g.status==='no').length,pending:data.guests.filter(g=>g.status==='pending').length};
  const addGuest=async e=>{e.preventDefault();await dataService.addGuest(guestForm);setGuestForm({name:'',type:'individual'});setModal(null);await reload()};
  const openEdit=guest=>{setSelectedGuest(guest);setGuestForm({name:guest.name,type:guest.type});setModal('edit')};
  const editGuest=async e=>{e.preventDefault();await dataService.updateGuest(selectedGuest.id,guestForm);setSelectedGuest(null);setModal(null);await reload()};
  const removeGuest=async()=>{await dataService.deleteGuest(selectedGuest.id);setSelectedGuest(null);setModal(null);await reload()};
  const toggleGuest=id=>setManual(v=>({...v,guestIds:v.guestIds.includes(id)?v.guestIds.filter(x=>x!==id):[...v.guestIds,id]}));
  const saveManual=async e=>{e.preventDefault();await dataService.addRsvp({...manual,source:'manual'});if(manual.guestIds.length)await dataService.updateGuests(manual.guestIds,{status:manual.status});setManual({fullName:'',adults:1,children:0,status:'yes',message:'Confirmação registada manualmente pelos pais.',guestIds:[]});setModal(null);await reload()};
  return <>
    <section className="confirmations-panel">
      <div className="confirmations-toolbar"><div><p className="eyebrow">LISTA DE CONVITES</p><h2>Gerir confirmações</h2><p>{counts.all} convites · {counts.yes} confirmados · {counts.pending} pendentes · {counts.no} recusados</p></div><div className="confirmation-actions"><button className="btn" onClick={()=>setModal('guest')}>+ Adicionar convite</button><button className="btn primary" onClick={()=>setModal('manual')}>Registar confirmação manual</button></div></div>
      <div className="guest-search"><input aria-label="Pesquisar convidados" placeholder="Pesquisar convidado…" value={query} onChange={e=>setQuery(e.target.value)}/><span>{filtered.length} resultados</span></div>
      <div className="guest-table"><div className="guest-table-head"><span>Convite</span><span>Tipo</span><span>Estado</span><span>Ações</span></div>{filtered.map(g=><article className="guest-table-row" key={g.id}><strong><FormattedName name={g.name}/></strong><span>{g.type==='group'?'Casal / Família':g.type==='child'?'Criança':'Adulto'}</span><StatusPill status={g.status}/><div className="guest-row-actions"><button onClick={()=>openEdit(g)} aria-label={`Editar ${g.name}`}>Editar</button><button className="remove" onClick={()=>{setSelectedGuest(g);setModal('delete')}} aria-label={`Eliminar ${g.name}`}>Eliminar</button></div></article>)}</div>
    </section>
    {modal==='guest'&&<AdminModal title="Adicionar convite" close={()=>setModal(null)}><form onSubmit={addGuest}><div className="field"><label>Nome ou identificação do convite</label><input autoFocus value={guestForm.name} onChange={e=>setGuestForm({...guestForm,name:e.target.value})} required/></div><InvitationTypeField form={guestForm} setForm={setGuestForm}/><div className="modal-actions"><button className="btn primary">Adicionar</button><button type="button" className="btn" onClick={()=>setModal(null)}>Cancelar</button></div></form></AdminModal>}
    {modal==='edit'&&selectedGuest&&<AdminModal title="Editar convite" close={()=>setModal(null)}><form onSubmit={editGuest}><div className="field"><label>Nome ou identificação do convite</label><input autoFocus value={guestForm.name} onChange={e=>setGuestForm({...guestForm,name:e.target.value})} required/></div><InvitationTypeField form={guestForm} setForm={setGuestForm}/><div className="modal-actions"><button className="btn primary">Guardar alterações</button><button type="button" className="btn" onClick={()=>setModal(null)}>Cancelar</button></div></form></AdminModal>}
    {modal==='delete'&&selectedGuest&&<AdminModal title="Eliminar convidado?" close={()=>setModal(null)}><p className="delete-copy">Estás prestes a remover <strong><FormattedName name={selectedGuest.name}/></strong> da lista. Esta ação não elimina confirmações já registadas.</p><div className="modal-actions"><button type="button" className="btn danger" onClick={removeGuest}>Sim, eliminar</button><button type="button" className="btn" onClick={()=>setModal(null)}>Cancelar</button></div></AdminModal>}
    {modal==='manual'&&<AdminModal title="Confirmação manual" close={()=>setModal(null)} wide><form onSubmit={saveManual}><p className="manual-intro">Regista uma resposta recebida por telefone ou mensagem e associa os convites abrangidos.</p><div className="field"><label>Nome de quem confirmou</label><input value={manual.fullName} onChange={e=>setManual({...manual,fullName:e.target.value})} required/></div><div className="form-row"><div className="field"><label>Adultos</label><input type="number" min="0" value={manual.adults} onChange={e=>setManual({...manual,adults:e.target.value})}/></div><div className="field"><label>Crianças</label><input type="number" min="0" value={manual.children} onChange={e=>setManual({...manual,children:e.target.value})}/></div></div><div className="field"><label>Resposta</label><select value={manual.status} onChange={e=>setManual({...manual,status:e.target.value})}><option value="yes">Sim</option><option value="no">Não</option></select></div><fieldset className="manual-guests"><legend>Convites abrangidos por esta confirmação <span>(opcional)</span></legend><div>{orderedGuests.map(g=><label className="manual-guest" key={g.id}><input type="checkbox" checked={manual.guestIds.includes(g.id)} onChange={()=>toggleGuest(g.id)}/><span><FormattedName name={g.name}/></span><StatusPill status={g.status}/></label>)}</div></fieldset><div className="field"><label>Nota</label><textarea rows="2" value={manual.message} onChange={e=>setManual({...manual,message:e.target.value})}/></div><div className="modal-actions"><button className="btn primary">Guardar confirmação</button><button type="button" className="btn" onClick={()=>setModal(null)}>Cancelar</button></div></form></AdminModal>}
  </>
}

const StatusPill=({status})=><span className={`status-pill ${status}`}>{status==='yes'?'Sim':status==='no'?'Não':'Pendente'}</span>;
const InvitationTypeField=({form,setForm})=><div className="field"><label>Tipo de convite</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="individual">Adulto</option><option value="group">Casal / Família</option><option value="child">Criança</option></select><small className="field-help">O número real de adultos e crianças é indicado na confirmação.</small></div>;
const FormattedName=({name})=>{const match=name.match(/^(.*?)(\s*\([^)]*\))$/);return match?<>{match[1]} <em>{match[2].trim()}</em></>:name};
const AdminModal=({title,close,wide=false,children})=><div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section className={`modal admin-modal ${wide?'wide':''}`} role="dialog" aria-modal="true" aria-label={title}><button className="modal-close" onClick={close} aria-label="Fechar">×</button><p className="eyebrow">CONFIRMAÇÕES</p><h2>{title}</h2>{children}</section></div>;

function GiftsAdminPage({gifts,reload}){
  const [editing,setEditing]=useState(null);
  const [target,setTarget]=useState(1);
  const [error,setError]=useState('');
  const openEdit=gift=>{setEditing(gift);setTarget(gift.target);setError('')};
  const save=async e=>{e.preventDefault();if(Number(target)<Number(editing.reserved||0)){setError(`A quantidade não pode ser inferior às ${editing.reserved} unidades já reservadas.`);return}try{await dataService.updateGiftTarget(editing.id,target);setEditing(null);await reload()}catch{setError('Não foi possível atualizar a quantidade.')}};
  return <>
    <section className="gifts-admin-panel"><div className="gifts-admin-heading"><div><p className="eyebrow">LISTA COLABORATIVA</p><h2>Gerir presentes</h2></div><span>{gifts.filter(g=>Number(g.reserved)>=Number(g.target)).length} de {gifts.length} completos</span></div>
      <div className="gifts-admin-table"><div className="gifts-admin-head"><span>Presente</span><span>Categoria</span><span>Reservado</span><span>Quantidade pedida</span><span>Estado</span></div>{gifts.map(g=>{const complete=Number(g.reserved)>=Number(g.target);return <article className="gifts-admin-row" key={g.id}><strong>{g.name}</strong><span>{g.category}</span><span>{g.reserved}</span><div className="gift-target-cell"><b>{g.target}</b><button onClick={()=>openEdit(g)} aria-label={`Alterar quantidade de ${g.name}`}>Alterar</button></div><span className={`gift-status-pill ${complete?'complete':'open'}`}>{complete?'Completo':'Em aberto'}</span></article>})}</div>
    </section>
    {editing&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}><section className="modal admin-modal" role="dialog" aria-modal="true" aria-label="Alterar quantidade pedida"><button className="modal-close" onClick={()=>setEditing(null)} aria-label="Fechar">×</button><p className="eyebrow">LISTA DE PRESENTES</p><h2>Alterar quantidade</h2><p className="gift-edit-name">{editing.name}</p><form onSubmit={save}><div className="field"><label htmlFor="gift-target">Quantidade pedida</label><input id="gift-target" type="number" min={editing.reserved||1} max="99" value={target} onChange={e=>setTarget(e.target.value)} required/><small className="field-help">Já existem {editing.reserved} unidades reservadas.</small></div>{error&&<p className="error">{error}</p>}<div className="modal-actions"><button className="btn primary">Guardar alterações</button><button type="button" className="btn" onClick={()=>setEditing(null)}>Cancelar</button></div></form></section></div>}
  </>
}

function ReservationsAdminPage({rows}){
  const active=rows.filter(r=>r.status==='active').length;
  return <section className="reservations-admin-panel"><div className="reservations-admin-heading"><div><p className="eyebrow">GESTÃO DA LISTA</p><h2>Reservas efetuadas</h2></div><span>{active} {active===1?'reserva ativa':'reservas ativas'}</span></div>
    <div className="reservations-admin-table"><div className="reservations-admin-head"><span>Nome</span><span>Presente</span><span>Descrição</span><span>Qtd.</span><span>Estado</span></div>{rows.length?rows.map(r=><article className="reservations-admin-row" key={r.id}><strong title={r.guestName}>{r.guestName}</strong><span className="reservation-gift" title={r.giftName}>{r.giftName}</span><span className="reservation-description" title={r.giftDescription}>{r.giftDescription}</span><b>{r.quantity}</b><span className={`reservation-status-pill ${r.status==='active'?'active':'cancelled'}`}>{r.status==='active'?'Ativa':'Cancelada'}</span></article>):<p className="reservations-empty">Ainda não existem reservas.</p>}</div>
  </section>
}

const List=({rows,fields})=><section className="panel"><div className="list">{rows.length?rows.map((r,i)=><article className="list-card" key={r.id||i}>{fields.map(f=><p key={f}><small>{f}</small><span>{String(r[f]??'—')}</span></p>)}</article>):<p>Ainda não existem dados.</p>}</div></section>;

function ExportPanel({data}){const csv=(name,rows)=>{if(!rows.length)return;const keys=Object.keys(rows[0]).filter(k=>k!=='token');const body='\uFEFF'+[keys.join(';'),...rows.map(r=>keys.map(k=>`"${String(r[k]??'').replaceAll('"','""')}"`).join(';'))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'text/csv;charset=utf-8'}));a.download=name;a.click()};return <section className="panel"><h2>Exportar dados</h2><div className="export-buttons"><button className="btn" onClick={()=>csv('confirmacoes-baby-shower.csv',data.rsvps)}>Confirmações CSV</button><button className="btn" onClick={()=>csv('reservas-presentes.csv',data.reservations)}>Reservas CSV</button><button className="btn" onClick={()=>csv('lista-presentes.csv',data.gifts)}>Presentes CSV</button></div></section>}
