const birds = window.BIRD_CATALOG;
const gallery=document.querySelector('#family-grid'), list=document.querySelector('#species-list'), detail=document.querySelector('#detail-view'), catalog=document.querySelector('#catalog-view'), image=document.querySelector('#species-image'), copy=document.querySelector('#species-copy'), auto=document.querySelector('#auto-play');
let options=[],current=0,currentSlide=0,timer=null;
const allBirds=Object.entries(birds).flatMap(([family,items])=>items.map(bird=>({...bird,family,slug:bird.name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-')})));
document.querySelector('#bird-total').textContent=`${allBirds.length} 種鳥類`;
function renderFamilies(query=''){
 const q=query.trim().toLocaleLowerCase();gallery.innerHTML='';let count=0;
 for(const [family,items] of Object.entries(birds)){
  const matches=items.filter(b=>!q||`${b.name} ${family}`.toLocaleLowerCase().includes(q));if(!matches.length)continue;count+=matches.length;
  const card=document.createElement('button');card.type='button';card.className='family-card';card.dataset.family=family;
  card.innerHTML=`<img src="${window.BIRD_ASSET_PATHS[matches[0].id]}" alt="" loading="lazy"><span class="family-card-body"><span class="family-card-title">${family}</span><span class="family-card-summary">${matches.length} 種 · ${matches.map(b=>b.name).join('、')}</span></span>`;
  card.addEventListener('click',()=>openFamily(family,matches));gallery.append(card);
 }
 document.querySelector('#empty-search').hidden=count>0;
}
function stopAutoplay(){clearInterval(timer);timer=null;auto.setAttribute('aria-pressed','false');auto.textContent='自動播放'}
function renderSlide(index=0){currentSlide=index;const bird=options[current],slides=window.BIRD_SLIDES?.[bird.name]||[];const slide=slides[index];
 document.querySelector('#family-label').textContent=bird.family;document.querySelector('#story-heading').textContent=bird.name;document.querySelector('#species-name').textContent=bird.name;
 image.classList.remove('photo-enter');void image.offsetWidth;image.classList.add('photo-enter');
 image.src=window.BIRD_ASSET_PATHS[slide?.image??bird.id];image.alt=`${bird.name}（第 ${index+1} 張照片）`;
 const html=(slide?.text||'').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/p>\s*<p[^>]*>/gi,'\n\n').replace(/<\/p>/gi,'\n').replace(/<[^>]*>/g,'');const decoded=document.createElement('textarea');decoded.innerHTML=html;copy.textContent=decoded.value.trim()||'這張照片暫無文字記錄。';
 document.querySelector('#slide-count').textContent=`${index+1} / ${slides.length||1}`;document.querySelector('#previous-slide').disabled=index<=0;document.querySelector('#next-slide').disabled=index>=slides.length-1;
 list.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',i===current?'true':'false'));
}
function selectBird(i){stopAutoplay();current=i;renderSlide(0)}
function openFamily(family,items){options=items.map(b=>({...b,family}));current=0;list.innerHTML='';options.forEach((bird,i)=>{const b=document.createElement('button');b.type='button';b.textContent=bird.name;b.addEventListener('click',()=>selectBird(i));list.append(b)});catalog.hidden=true;detail.hidden=false;renderSlide()}
document.querySelector('#bird-search').addEventListener('input',e=>renderFamilies(e.target.value));document.querySelector('#back-to-list').addEventListener('click',()=>{stopAutoplay();detail.hidden=true;catalog.hidden=false});
document.querySelector('#previous-slide').addEventListener('click',()=>{stopAutoplay();if(currentSlide>0)renderSlide(currentSlide-1)});document.querySelector('#next-slide').addEventListener('click',()=>{stopAutoplay();const slides=window.BIRD_SLIDES?.[options[current].name]||[];if(currentSlide<slides.length-1)renderSlide(currentSlide+1)});
auto.addEventListener('click',()=>{if(timer){stopAutoplay();return}const slides=window.BIRD_SLIDES?.[options[current].name]||[];if(currentSlide>=slides.length-1)renderSlide(0);auto.setAttribute('aria-pressed','true');auto.textContent='停止播放';timer=setInterval(()=>{if(currentSlide>=slides.length-1){stopAutoplay();return}renderSlide(currentSlide+1)},3000)});
renderFamilies();
