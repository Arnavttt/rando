
const P='fa-interactive-v1-';
function storeKey(qid,type){return P+type+'-'+qid}
function allQuestions(){return Array.from(document.querySelectorAll('.iq'))}
function setState(card,status){
  const qid=card.dataset.qid;
  card.classList.remove('right','wrong');
  if(status==='right'||status==='wrong') card.classList.add(status);
  const st=card.querySelector('[data-state]');
  if(st) st.textContent=status==='right'?'Correct':status==='wrong'?'Wrong':'Unmarked';
  if(status==='right'||status==='wrong') localStorage.setItem(storeKey(qid,'state'),status); else localStorage.removeItem(storeKey(qid,'state'));
  updateScores();
}
function saveAnswer(textarea){localStorage.setItem(storeKey(textarea.closest('.iq').dataset.qid,'answer'),textarea.value)}
function loadState(){
  allQuestions().forEach(card=>{
    const qid=card.dataset.qid;
    const ta=card.querySelector('textarea[data-answer]');
    const saved=localStorage.getItem(storeKey(qid,'answer'));
    if(saved!==null) ta.value=saved;
    setState(card,localStorage.getItem(storeKey(qid,'state'))||'');
  });
  document.querySelectorAll('input[data-progress]').forEach(cb=>{cb.checked=localStorage.getItem('fa-progress-'+cb.dataset.progress)==='1';});
  updateScores();
}
function updateScores(){
  const qs=allQuestions();
  let right=0,wrong=0,answered=0;
  qs.forEach(q=>{if(q.classList.contains('right')) right++; if(q.classList.contains('wrong')) wrong++; if(q.querySelector('textarea')?.value.trim()) answered++;});
  const unmarked=qs.length-right-wrong;
  const pct=qs.length?Math.round(right/qs.length*100):0;
  const set=(id,val)=>{const el=document.getElementById(id); if(el) el.textContent=val};
  set('dash-total',qs.length); set('dash-answered',answered); set('dash-right',right); set('dash-wrong',wrong); set('dash-unmarked',unmarked); set('dash-pct',pct+'%');
  document.querySelectorAll('[data-bank-score]').forEach(el=>{
    const bank=el.dataset.bankScore; const bqs=qs.filter(q=>q.dataset.bank===bank);
    const br=bqs.filter(q=>q.classList.contains('right')).length; const bw=bqs.filter(q=>q.classList.contains('wrong')).length; const bu=bqs.length-br-bw;
    el.textContent=`${br} right · ${bw} wrong · ${bu} unmarked`;
  });
}
function filterSite(){
  const q=document.getElementById('q').value.toLowerCase().trim();
  document.querySelectorAll('.course').forEach(c=>{c.classList.toggle('hidden',q && !c.innerText.toLowerCase().includes(q));});
}
function showGlobal(mode){
  document.body.classList.remove('global-missed','global-correct','global-unmarked');
  if(mode==='missed') document.body.classList.add('global-missed');
  if(mode==='correct') document.body.classList.add('global-correct');
  if(mode==='unmarked') document.body.classList.add('global-unmarked');
}
function resetAll(){
  if(!confirm('Clear all question answers, right/wrong marks, and lesson checkboxes in this file?')) return;
  Object.keys(localStorage).forEach(k=>{ if(k.startsWith(P)||k.startsWith('fa-progress-')) localStorage.removeItem(k); });
  allQuestions().forEach(q=>{q.querySelector('textarea').value=''; q.querySelectorAll('details').forEach(d=>d.open=false); setState(q,'');});
  document.querySelectorAll('input[data-progress]').forEach(cb=>cb.checked=false);
  updateScores();
}
document.addEventListener('input',e=>{if(e.target.matches('textarea[data-answer]')){saveAnswer(e.target); updateScores();}});
document.addEventListener('change',e=>{if(e.target.matches('input[data-progress]')){localStorage.setItem('fa-progress-'+e.target.dataset.progress,e.target.checked?'1':'0');}});
document.addEventListener('click',e=>{
  const btn=e.target.closest('button'); if(!btn) return;
  if(btn.dataset.action==='mark') setState(btn.closest('.iq'),btn.dataset.status);
  if(btn.dataset.action==='clear') {const card=btn.closest('.iq'); card.querySelector('textarea').value=''; localStorage.removeItem(storeKey(card.dataset.qid,'answer')); setState(card,'');}
  if(btn.dataset.bankAction){
    const bank=btn.dataset.bankTarget; const sec=document.querySelector(`[data-bank="${bank}"]`); if(!sec) return;
    if(btn.dataset.bankAction==='show') sec.querySelectorAll('details.answer').forEach(d=>d.open=true);
    if(btn.dataset.bankAction==='hide') sec.querySelectorAll('details.answer').forEach(d=>d.open=false);
    if(btn.dataset.bankAction==='missed') sec.classList.add('missed-filter');
    if(btn.dataset.bankAction==='all') sec.classList.remove('missed-filter');
    if(btn.dataset.bankAction==='reset') { if(confirm('Reset this bank only?')) sec.querySelectorAll('.iq').forEach(card=>{card.querySelector('textarea').value=''; localStorage.removeItem(storeKey(card.dataset.qid,'answer')); setState(card,'');}); }
  }
});
loadState();

function goBackSafe(){ if(history.length>1) history.back(); else location.href='../index.html'; }
