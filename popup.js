const DEVICES = [
  { id:"iphone15promax", name:"iPhone 15 Pro Max", w:430, h:932 },
  { id:"iphone15pro",    name:"iPhone 15 Pro",     w:393, h:852 },
  { id:"iphone15",       name:"iPhone 15",         w:390, h:844 },
  { id:"iphone14",       name:"iPhone 14",         w:390, h:844 },
  { id:"iphonese",       name:"iPhone SE",         w:375, h:667 },
  { id:"ipadmini",       name:"iPad mini",         w:768, h:1024 },
  { id:"ipadpro11",      name:"iPad Pro 11",       w:834, h:1194 }
];

const $ = (s) => document.querySelector(s);
const frame = $("#frame");
const phone = $("#phone");
const screen = document.querySelector(".phone-screen");
const empty = $("#empty");
const blocked = $("#blocked");
const deviceSel = $("#device");
const zoomSel = $("#zoom");
const devlabel = $("#devlabel");
const clock = $("#clock");

let landscape = false;

DEVICES.forEach((d,i)=>{
  const o=document.createElement("option");
  o.value=d.id;o.textContent=d.name;if(d.id==="iphone15pro")o.selected=true;
  deviceSel.appendChild(o);
});

function device(){ return DEVICES.find(d=>d.id===deviceSel.value)||DEVICES[1]; }

function applySize(){
  const d=device();
  const w=landscape?d.h:d.w;
  const h=landscape?d.w:d.h;
  screen.style.width=w+"px";
  screen.style.height=h+"px";
  const z=parseFloat(zoomSel.value);
  phone.style.transform="scale("+z+")";
  phone.classList.toggle("landscape",landscape);
  devlabel.textContent=d.name;
}

function normalize(u){
  u=(u||"").trim();
  if(!u) return "";
  if(!/^https?:\/\//i.test(u)) u="https://"+u;
  return u;
}

function load(){
  const url=normalize($("#url").value);
  if(!url) return;
  empty.hidden=true;empty.style.display="none";
  blocked.hidden=true;
  frame.style.display="block";
  frame.src=url;
  save(url);
  // detect blocked embeds (X-Frame-Options / CSP) after a short wait
  clearTimeout(window.__chk);
  window.__chk=setTimeout(()=>{
    try{
      const doc=frame.contentDocument;
      if(!doc) throw 0;
      if(doc.body && doc.body.innerHTML.length===0) showBlocked();
    }catch(e){ /* cross-origin = loaded fine, do nothing */ }
  },2500);
}

function showBlocked(){
  blocked.hidden=false;
  $("#openBlocked").onclick=()=>chrome.tabs.create({url:normalize($("#url").value)});
}

function save(url){
  try{ chrome.storage.local.set({last:{url,device:deviceSel.value,zoom:zoomSel.value}}); }catch(e){}
}

function tick(){
  const n=new Date();
  let h=n.getHours(),m=n.getMinutes();
  h=h%12||12;m=(m<10?"0":"")+m;
  clock.textContent=h+":"+m;
}

deviceSel.addEventListener("change",applySize);
zoomSel.addEventListener("change",applySize);
$("#go").addEventListener("click",load);
$("#url").addEventListener("keydown",e=>{if(e.key==="Enter")load();});
$("#rotate").addEventListener("click",()=>{landscape=!landscape;applySize();});
$("#openTab").addEventListener("click",()=>{
  const u=normalize($("#url").value);
  if(u)chrome.tabs.create({url:u});
});
document.querySelectorAll(".chip[data-quick]").forEach(c=>{
  c.addEventListener("click",()=>{$("#url").value=c.dataset.quick;load();});
});

// restore last session
try{
  chrome.storage.local.get("last",(r)=>{
    if(r&&r.last){
      if(r.last.device)deviceSel.value=r.last.device;
      if(r.last.zoom)zoomSel.value=r.last.zoom;
      applySize();
      if(r.last.url){$("#url").value=r.last.url;load();}
    } else { applySize(); }
  });
}catch(e){ applySize(); }

tick();setInterval(tick,10000);
