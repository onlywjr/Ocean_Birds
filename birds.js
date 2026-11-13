const birds = {};
const gallery=document.querySelector('#family-grid'), list=document.querySelector('#species-list'), detail=document.querySelector('#detail-view'), catalog=document.querySelector('#catalog-view'), image=document.querySelector('#species-image'), copy=document.querySelector('#species-copy'), auto=document.querySelector('#auto-play');
let options=[],current=0,currentSlide=0,timer=null,allBirds=[];
async function loadBirdData(){
 const index=await fetch('assets/bird-catalog/index.json').then(response=>{if(!response.ok)throw new Error('無法讀取鳥類目錄');return response.json()});
 window.BIRD_SLIDES={};window.BIRD_ASSET_PATHS={};
 const results=await Promise.all(index.species.map(async entry=>{
  let folder='';
  try{
  folder=String(entry.folder||'');
  if(!/^[a-z0-9-]+$/i.test(folder))throw new Error(`鳥種資料夾名稱不正確：${folder}`);
  const root=`assets/bird-catalog/species/${folder}/`;
  const data=await fetch(`${root}dialog.json`).then(response=>{if(!response.ok)throw new Error(`找不到 ${folder}/dialog.json`);return response.json()});
  const slides=(data.slides||[]).map(item=>({image:`${folder}/${item.image}`,text:item.text||''}));
  if(!data.name||!data.family||!slides.length)throw new Error(`${folder}/dialog.json 缺少鳥名、科別或對話圖片`);
  slides.forEach(slide=>{window.BIRD_ASSET_PATHS[slide.image]=`${root}${encodeURIComponent(slide.image.slice(folder.length+1))}`});
  window.BIRD_SLIDES[data.name]=slides;
  return{name:data.name,family:data.family,id:slides[0].image,folder};
  }catch(error){return{error:`${folder||entry.folder||'未命名鳥種'}：${error.message}`}}
 }));
 const records=results.filter(result=>!result.error);
 const failures=results.filter(result=>result.error).map(result=>result.error);
 if(!records.length)throw new Error(failures.join('；')||'索引中沒有可載入的鳥種資料');
 for(const bird of records)(birds[bird.family]??=[]).push(bird);
 allBirds=records.map(bird=>({...bird,slug:bird.folder}));
 document.querySelector('#bird-total').textContent=`${allBirds.length} 種鳥類`;
 return failures;
}
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
function renderSlide(index=0, transition=true){
 const bird=options[current],slides=window.BIRD_SLIDES?.[bird.name]||[],slide=slides[index];
 const imageSource=window.BIRD_ASSET_PATHS[slide?.image??bird.id];
 const update=()=>{
  currentSlide=index;
  document.querySelector('#family-label').textContent=bird.family;document.querySelector('#story-heading').textContent=bird.name;document.querySelector('#species-name').textContent=bird.name;
  image.src=imageSource;image.alt=`${bird.name}（第 ${index+1} 張照片）`;
  const html=(slide?.text||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<\/p>\s*<p[^>]*>/gi,' ').replace(/<\/?p[^>]*>/gi,' ').replace(/<[^>]*>/g,'');const decoded=document.createElement('textarea');decoded.innerHTML=html;copy.textContent=decoded.value.replace(/\s+/g,' ').trim()||'這張照片暫無文字記錄。';
  document.querySelector('#slide-count').textContent=`${index+1} / ${slides.length||1}`;document.querySelector('#previous-slide').disabled=index<=0;document.querySelector('#next-slide').disabled=index>=slides.length-1;
  list.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',i===current?'true':'false'));
 };
 if(transition)window.transitionPageContent(update,imageSource);else update();
}
function selectBird(i){stopAutoplay();current=i;renderSlide(0)}
function openFamily(family,items){options=items.map(b=>({...b,family}));current=0;const bird=options[0],slide=window.BIRD_SLIDES?.[bird.name]?.[0],src=window.BIRD_ASSET_PATHS[slide?.image??bird.id];window.transitionPageContent(()=>{list.innerHTML='';options.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.textContent=item.name;b.addEventListener('click',()=>selectBird(i));list.append(b)});catalog.hidden=true;detail.hidden=false;renderSlide(0,false)},src)}
document.querySelector('#bird-search').addEventListener('input',e=>renderFamilies(e.target.value));document.querySelector('#back-to-list').addEventListener('click',()=>{stopAutoplay();window.transitionPageContent(()=>{detail.hidden=true;catalog.hidden=false})});
document.querySelector('#previous-slide').addEventListener('click',()=>{stopAutoplay();if(currentSlide>0)renderSlide(currentSlide-1)});document.querySelector('#next-slide').addEventListener('click',()=>{stopAutoplay();const slides=window.BIRD_SLIDES?.[options[current].name]||[];if(currentSlide<slides.length-1)renderSlide(currentSlide+1)});
auto.addEventListener('click',()=>{if(timer){stopAutoplay();return}const slides=window.BIRD_SLIDES?.[options[current].name]||[];if(currentSlide>=slides.length-1)renderSlide(0);auto.setAttribute('aria-pressed','true');auto.textContent='停止播放';timer=setInterval(()=>{if(currentSlide>=slides.length-1){stopAutoplay();return}renderSlide(currentSlide+1)},4600)});
loadBirdData().then(failures=>{renderFamilies();if(failures.length){const empty=document.querySelector('#empty-search');empty.hidden=false;empty.textContent=`部分鳥種未能載入：${failures.join('；')}`}}).catch(error=>{const empty=document.querySelector('#empty-search');empty.hidden=false;empty.textContent=`鳥類圖鑑載入失敗：${error.message}`;});
