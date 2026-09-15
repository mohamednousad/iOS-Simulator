"use strict";

/* ---------- Device catalogue (logical CSS points) ---------- */
const DEVICES = [
  { id:"ip17pm", name:"iPhone 17 Pro Max", type:"phone", w:440, h:956, radius:false },
  { id:"ip17p",  name:"iPhone 17 Pro",     type:"phone", w:402, h:874 },
  { id:"ip17",   name:"iPhone 17",         type:"phone", w:393, h:852 },
  { id:"ip16pm", name:"iPhone 16 Pro Max", type:"phone", w:440, h:956 },
  { id:"ip16p",  name:"iPhone 16 Pro",     type:"phone", w:402, h:874 },
  { id:"ip16",   name:"iPhone 16",         type:"phone", w:393, h:852 },
  { id:"ip15pm", name:"iPhone 15 Pro Max", type:"phone", w:430, h:932 },
  { id:"ip15p",  name:"iPhone 15 Pro",     type:"phone", w:393, h:852 },
  { id:"ip15",   name:"iPhone 15",         type:"phone", w:393, h:852 },
  { id:"mbp14",  name:"MacBook Pro 14",    type:"mac",   w:1512, h:982 },
  { id:"mbp16",  name:"MacBook Pro 16",    type:"mac",   w:1728, h:1117 }
];

const state = {
  device: DEVICES[0],
  browser: "safari",
  landscape: false,
  theme: "light",
  fit: true,
  url: "https://www.wikipedia.org"
};

const $ = (s) => document.querySelector(s);
const deviceSelect = $("#deviceSelect");
const browserSelect = $("#browserSelect");
const urlInput = $("#urlInput");
const wrap = $("#deviceWrap");
const stage = $("#stage");

/* ---------- Populate device dropdown ---------- */
DEVICES.forEach((d) => {
  const o = document.createElement("option");
  o.value = d.id; o.textContent = d.name;
  deviceSelect.appendChild(o);
});

/* ---------- Helpers ---------- */
function normalizeUrl(v){
  v = (v || "").trim();
  if (!v) return "about:blank";
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  return v;
}

function statusTime(){
  const d = new Date();
  let h = d.getHours(), m = d.getMinutes();
  return (h%12||12) + ":" + (m<10?"0"+m:m);
}

function phoneStatusBar(dark){
  return `<div class="statusbar ${dark?'dark':''}">
    <span>${statusTime()}</span>
    <span class="right">
      <i class="fa-solid fa-signal"></i>
      <i class="fa-solid fa-wifi"></i>
      <i class="fa-solid fa-battery-full"></i>
    </span>
  </div>`;
}

function safariBar(dark, forMac){
  const host = (() => { try { return new URL(normalizeUrl(state.url)).hostname.replace(/^www\./,""); } catch(e){ return state.url; } })();
  const lockOrChrome = state.browser === "safari"
    ? `<i class="fa-solid fa-lock sc-ico"></i>`
    : `<i class="fa-brands fa-chrome sc-ico"></i>`;
  return `<div class="safari-chrome ${dark?'dark':''} ${forMac?'mac-safari-chrome':''}">
      <i class="fa-solid fa-chevron-left sc-ico"></i>
      <i class="fa-solid fa-chevron-right sc-ico"></i>
      <div class="sc-url">${lockOrChrome}<span>${host}</span></div>
      <i class="fa-solid fa-rotate-right sc-ico"></i>
      <i class="fa-solid fa-plus sc-ico"></i>
    </div>`;
}

/* ---------- Render device ---------- */
function render(){
  const d = state.device;
  const dark = state.theme === "dark";
  let w = d.w, h = d.h;
  if (d.type === "phone" && state.landscape){ [w,h] = [h,w]; }

  const src = normalizeUrl(state.url);
  let html = "";

  if (d.type === "phone"){
    const chromeH = 44;
    html = `
      <div class="iphone" style="width:${w+28}px">
        <span class="btn-side btn-mute"></span>
        <span class="btn-side btn-vol-up"></span>
        <span class="btn-side btn-vol-dn"></span>
        <span class="btn-side btn-power"></span>
        <div class="screen" style="width:${w}px;height:${h}px">
          <div class="island"></div>
          ${phoneStatusBar(dark)}
          <div style="position:absolute;top:52px;left:0;right:0;bottom:0;display:flex;flex-direction:column">
            ${safariBar(dark,false)}
            <iframe src="${src}" style="flex:1"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
              referrerpolicy="no-referrer" loading="eager"></iframe>
          </div>
        </div>
      </div>`;
  } else {
    html = `
      <div class="macbook">
        <div class="mac-lid" style="width:${w*0.62+28}px">
          <div class="mac-cam"></div>
          <div class="mac-screen" style="width:${w*0.62}px;height:${h*0.62}px">
            ${safariBar(dark,true)}
            <iframe src="${src}" style="height:calc(100% - 44px);width:100%"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
              referrerpolicy="no-referrer" loading="eager"></iframe>
          </div>
        </div>
        <div class="mac-base" style="width:${w*0.62+90}px"><div class="mac-notch"></div></div>
      </div>`;
  }

  wrap.innerHTML = html;
  fitToStage();
}

/* ---------- Scale to fit the stage ---------- */
function fitToStage(){
  wrap.style.transform = "scale(1)";
  if (!state.fit) return;
  const inner = wrap.firstElementChild;
  if (!inner) return;
  const pad = 60;
  const availW = stage.clientWidth - pad;
  const availH = stage.clientHeight - pad;
  const rect = inner.getBoundingClientRect();
  const scale = Math.min(availW / rect.width, availH / rect.height, 1);
  wrap.style.transform = `scale(${scale})`;
}

/* ---------- Events ---------- */
deviceSelect.addEventListener("change", () => {
  state.device = DEVICES.find(d => d.id === deviceSelect.value) || DEVICES[0];
  if (state.device.type === "mac") state.landscape = false;
  render();
});
browserSelect.addEventListener("change", () => { state.browser = browserSelect.value; render(); });

function loadUrl(){ state.url = normalizeUrl(urlInput.value); render(); }
$("#goBtn").addEventListener("click", loadUrl);
urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") loadUrl(); });

$("#reloadBtn").addEventListener("click", render);
$("#rotateBtn").addEventListener("click", () => {
  if (state.device.type === "phone"){ state.landscape = !state.landscape; render(); }
});
$("#themeBtn").addEventListener("click", () => {
  state.theme = state.theme === "light" ? "dark" : "light"; render();
});
$("#fitBtn").addEventListener("click", (e) => {
  state.fit = !state.fit;
  e.currentTarget.classList.toggle("on", state.fit);
  fitToStage();
});

window.addEventListener("resize", fitToStage);

/* ---------- Init ---------- */
deviceSelect.value = state.device.id;
render();
