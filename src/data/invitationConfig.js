export const invitationConfig={
  estimatedDueDate:'2027-02-08',
  detailsSection:'inicio',
  title:'BABY LOADING…',
  headline:'Um bebé muito especial está quase a chegar.',
  invitation:'Estás oficialmente convidado/a para o nosso baby shower.',
  callToAction:'Consulta todos os detalhes e confirma a tua presença no nosso site.'
};

const DAY_MS=24*60*60*1000;
const PREGNANCY_DAYS=40*7;

export function pregnancyProgress(dueDate,today=new Date()){
  const [year,month,day]=dueDate.split('-').map(Number);
  const dueAt=Date.UTC(year,month-1,day);
  const todayAt=Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate());
  const pregnancyStart=dueAt-PREGNANCY_DAYS*DAY_MS;
  const progress=Math.round((todayAt-pregnancyStart)/(PREGNANCY_DAYS*DAY_MS)*100);
  return Math.min(100,Math.max(0,progress));
}
