const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('uk-UA').format(n)+' ₴';
const svg=body=>`<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
const platforms=[
 {id:'instagram',name:'Instagram',color:'linear-gradient(145deg,#9854e9,#e15495,#f2ad66)',icon:svg('<rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="7" r="1" fill="currentColor"/>')},
 {id:'telegram',name:'Telegram',color:'#60b5ed',icon:svg('<path d="m3 10 18-7-4 18-6-5-3 3v-6l10-7-12 5z" fill="currentColor"/>')},
 {id:'tiktok',name:'TikTok',color:'#2d2b37',icon:svg('<path d="M13 3h3c0 3 2 4 4 4v3c-2 0-3-.5-4-1v8a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2z" fill="currentColor"/>')},
 {id:'youtube',name:'YouTube',color:'#f36977',icon:svg('<rect x="2" y="5" width="20" height="14" rx="5" fill="currentColor"/><path d="m10 9 5 3-5 3z" fill="#f36977"/>')},
 {id:'facebook',name:'Facebook',color:'#6a8fe9',icon:svg('<path d="M14 22v-9h3l.5-4H14V7c0-1 .5-2 2-2h2V1h-3c-4 0-5 2-5 6v2H7v4h3v9z" fill="currentColor"/>')}
];
const icons={
 followers:svg('<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>'),
 likes:svg('<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1C-1 11 12 20 12 20S25 11 20 5Z"/>'),
 comments:svg('<path d="M21 11a9 8 0 0 1-9 8H8l-5 3 1-6a8 8 0 0 1-1-5 9 8 0 0 1 18 0Z"/><path d="M7 9h10M7 13h7"/>'),
 views:svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>')
};
const number=n=>new Intl.NumberFormat('uk-UA').format(n);
const managerUrl='https://t.me/booster_smm';
let activePlatform='instagram',activeCategory='Усі послуги',cart=[];
const selectedPackages={};
function currentServices(){return catalog[activePlatform]||[]}
function packageFor(s){const units=selectedPackages[activePlatform+'-'+s.id];return s.packages.find(p=>p[0]===units)||s.packages[0]}
function unitLabel(s){if(s.category==='Коментарі'&&packageFor(s)[0]===1)return 'коментар';return s.category==='Підписники'?'підписників':s.category==='Лайки'?'лайків':s.category==='Коментарі'?'коментарів':'переглядів'}
function renderPlatforms(){$('platforms').innerHTML=platforms.map(p=>`<button class="platform ${p.id===activePlatform?'active':''}" data-platform="${p.id}" aria-pressed="${p.id===activePlatform}"><span class="platform-icon" style="background:${p.color}">${p.icon}</span>${p.name}<span class="chevron">↗</span></button>`).join('')}
function renderCategories(){const services=currentServices();const categories=['Усі послуги',...new Set(services.map(s=>s.category))];if(!categories.includes(activeCategory))activeCategory='Усі послуги';$('categories').innerHTML=services.length?categories.map(c=>`<button class="${c===activeCategory?'active':''}" data-category="${c}" aria-pressed="${c===activeCategory}">${c}</button>`).join(''):''}
function renderServices(){
 const all=currentServices();const services=all.filter(s=>activeCategory==='Усі послуги'||s.category===activeCategory);
 $('result-count').textContent=all.length?all.reduce((n,s)=>n+s.packages.length,0)+' пакетів':'';
 document.querySelector('.price-note').hidden=!all.length;
 $('services').classList.toggle('unavailable',!all.length);
 if(!all.length){const p=platforms.find(p=>p.id===activePlatform);$('services').innerHTML=`<div class="coming-soon"><span class="coming-icon">✦</span><span class="overline">${p.name}</span><h3>В розробці</h3><p>Послуги для цієї соцмережі ще готуються.<br>Обери Instagram, Telegram або TikTok.</p></div>`;return}
 $('services').innerHTML=services.map(s=>{
  const [units,price]=packageFor(s);const key=activePlatform+'-'+s.id+'-'+units;const selected=cart.some(x=>x.key===key);
  return `<article class="service"><div class="card-top"><span class="service-icon">${icons[s.icon]}</span>${s.badge?`<span class="badge">${s.badge}</span>`:''}</div><h3>${s.title}</h3><p>${s.description}</p><label class="package-label" for="package-${s.id}">Кількість у пакеті</label><select class="package-select" id="package-${s.id}" data-package="${s.id}" aria-label="Пакет: ${s.title}">${s.packages.map(([n,p])=>`<option value="${n}" ${n===units?'selected':''}>${number(n)} — ${money(p)}</option>`).join('')}</select><div class="service-bottom"><div class="service-price">${money(price)}<span class="unit">${number(units)} ${unitLabel(s)}</span></div><button class="add-btn ${selected?'added':''}" data-add="${s.id}" aria-label="${selected?'Додати ще:':'Додати:'} ${s.title}, ${units}">${selected?'✓ У кошику':'+ Додати'}</button></div></article>`;
 }).join('');
}
function total(){return cart.reduce((n,s)=>n+s.price*s.quantity,0)}
function buildOrderText(){
 const lines=['Вітаю! Хочу замовити в Advance Rocket:',''];
 // Grouping keeps even a cart containing every package below Telegram's text limit.
 for(const p of platforms){const rows=cart.filter(s=>s.platform===p.id);if(!rows.length)continue;lines.push(p.name.toUpperCase());
  for(const s of catalog[p.id]){const items=rows.filter(x=>x.id===s.id);if(!items.length)continue;lines.push(s.id==='ua-followers'?'Активні підписники з України:':s.category+':');for(const item of items)lines.push(`${item.units} × ${item.quantity} пак. = ${item.price*item.quantity} грн`)}lines.push('');
 }
 lines.push('Разом: '+money(total()),'Підкажіть, будь ласка, як оформити замовлення.');return lines.join('\n');
}
function checkoutUrl(){return managerUrl+'?text='+encodeURIComponent(buildOrderText())}
function updateOrderLinks(){document.querySelectorAll('.order-link').forEach(a=>{a.classList.toggle('is-disabled',!cart.length);a.setAttribute('aria-disabled',String(!cart.length));if(cart.length)a.href=checkoutUrl();else a.removeAttribute('href')})}
function renderCart(){
 const count=cart.reduce((n,s)=>n+s.quantity,0);$('cart-count').textContent=count;$('order-count').textContent=count;$('mobile-count').textContent=count;$('total').textContent=money(total());$('mobile-total').textContent=money(total());$('mobile-cart').hidden=!count;
 $('cart-items').innerHTML=cart.length?cart.map(s=>`<div class="cart-row"><div class="cart-row-top"><div><h4>${s.title}</h4><small>${s.platformName} · ${number(s.units)} ${s.unit}</small></div><button class="remove-btn" data-remove="${s.key}" aria-label="Видалити ${s.title}, ${s.units}">×</button></div><div class="cart-row-bottom"><div class="quantity"><button data-change="${s.key}" data-delta="-1" aria-label="Зменшити кількість ${s.title}, ${s.units}">−</button><span>${s.quantity}</span><button data-change="${s.key}" data-delta="1" aria-label="Збільшити кількість ${s.title}, ${s.units}">+</button></div><strong>${money(s.price*s.quantity)}</strong></div></div>`).join(''):`<div class="empty-cart"><span class="empty-icon">↗</span><h4>Місце для твоїх амбіцій</h4><p>Додай пакети з каталогу —<br>і твій план набуде форми.</p></div>`;
 updateOrderLinks();
}
let toastTimer;function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2300)}
function addService(id){const s=currentServices().find(s=>s.id===id);if(!s)throw Error('Невідома послуга');const [units,price]=packageFor(s);const key=activePlatform+'-'+id+'-'+units;const item=cart.find(x=>x.key===key);if(item&&item.quantity>=99){toast('Максимум 99 пакетів');return}if(item)item.quantity++;else cart.push({id:s.id,title:s.title,category:s.category,units,price,unit:unitLabel(s),key,platform:activePlatform,platformName:platforms.find(p=>p.id===activePlatform).name,quantity:1});renderCart();renderServices();toast('Додано до твого запуску');try{const tg=window.Telegram?.WebApp;if(tg?.isVersionAtLeast('6.1'))tg.HapticFeedback.impactOccurred('light')}catch{}return{items:cart.length,total:total()}}
function selectPlatform(id){if(!platforms.some(p=>p.id===id))throw Error('Невідома соцмережа');activePlatform=id;activeCategory='Усі послуги';renderPlatforms();renderCategories();renderServices()}
function openDialog(id){$(id).showModal();try{const tg=window.Telegram?.WebApp;if(tg?.isVersionAtLeast('6.1'))tg.BackButton.show()}catch{}}
function review(){if(!cart.length){$('order-panel').scrollIntoView({behavior:'smooth',block:'center'});toast('Обери пакети для свого запуску');return}$('review-items').innerHTML=cart.map(s=>`<div class="review-line"><div>${s.title}<small>${number(s.units)} ${s.unit} · ${s.quantity} пак. × ${money(s.price)}</small></div><strong>${money(s.price*s.quantity)}</strong></div>`).join('');$('review-total').textContent=money(total());$('order-text').value=buildOrderText();$('order-text').hidden=true;updateOrderLinks();openDialog('review-dialog')}
$('platforms').addEventListener('click',e=>{const b=e.target.closest('[data-platform]');if(b)selectPlatform(b.dataset.platform)});
$('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){activeCategory=b.dataset.category;renderCategories();renderServices()}});
$('services').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addService(b.dataset.add)});
$('services').addEventListener('change',e=>{const b=e.target.closest('[data-package]');if(!b)return;const s=currentServices().find(s=>s.id===b.dataset.package);const units=Number(b.value);if(!s?.packages.some(p=>p[0]===units))return;selectedPackages[activePlatform+'-'+s.id]=units;renderServices();$('package-'+s.id).focus()});
$('cart-items').addEventListener('click',e=>{const remove=e.target.closest('[data-remove]'),change=e.target.closest('[data-change]');if(remove)cart=cart.filter(s=>s.key!==remove.dataset.remove);if(change){const item=cart.find(s=>s.key===change.dataset.change);if(item)item.quantity=Math.min(99,item.quantity+Number(change.dataset.delta));cart=cart.filter(s=>s.quantity>0)}renderCart();renderServices()});
$('how-btn').onclick=()=>openDialog('info-dialog');$('cart-btn').onclick=review;$('mobile-cart').onclick=review;
document.querySelectorAll('dialog').forEach(d=>{d.querySelectorAll('.close-dialog,.close-info').forEach(b=>b.onclick=()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>{try{window.Telegram?.WebApp?.BackButton?.hide()}catch{}})});
document.querySelectorAll('.order-link').forEach(a=>a.addEventListener('click',e=>{
 if(!cart.length){e.preventDefault();return}
 const url=checkoutUrl();a.href=url;const tg=window.Telegram?.WebApp;
 if(tg?.initData&&tg?.isVersionAtLeast('6.1')){try{tg.openTelegramLink(url);e.preventDefault()}catch{/* Native HTTPS link remains available. */}}
}));
$('copy-btn').onclick=async()=>{try{await navigator.clipboard.writeText(buildOrderText());toast('Кошик скопійовано')}catch{$('order-text').hidden=false;$('order-text').value=buildOrderText();$('order-text').focus();$('order-text').select();toast('Виділи та скопіюй текст кошика')}};
renderPlatforms();renderCategories();renderServices();renderCart();
try{const tg=window.Telegram?.WebApp;if(tg?.initData){tg.ready();tg.expand();if(tg.isVersionAtLeast('6.1')){tg.setHeaderColor('#8863ed');tg.setBackgroundColor('#faf9fd');tg.BackButton.onClick(()=>document.querySelector('dialog[open]')?.close())}}}catch{}
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'configure_social_catalog',description:'Select a social network in the visible catalog. Does not add packages, contact the manager, or submit orders.',inputSchema:{type:'object',properties:{platform:{type:'string',enum:platforms.map(p=>p.id)}},required:['platform'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||typeof input.platform!=='string')throw Error('Platform required');selectPlatform(input.platform);return{platform:activePlatform,status:currentServices().length?'available':'in_development',services:currentServices().map(s=>({id:s.id,title:s.title,packages:s.packages.map(([quantity,price])=>({quantity,price,currency:'UAH'}))}))}}})).catch(()=>{})}catch{}}
