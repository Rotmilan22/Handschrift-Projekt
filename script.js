/* =========================
   AUTH & USER
========================= */

const auth = document.getElementById("auth-container");
const app = document.getElementById("app");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authMessage = document.getElementById("authMessage");

let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let user;

function saveUsers() { localStorage.setItem("users", JSON.stringify(users)); }
function showApp() { auth.classList.add("hidden"); app.classList.remove("hidden"); }
function showAuth() { auth.classList.remove("hidden"); app.classList.add("hidden"); }

document.getElementById("registerBtn").onclick = () => {
  const email = emailInput.value, password = passwordInput.value;
  if(!email||!password){ authMessage.textContent="Bitte alles ausfüllen"; return; }
  if(users[email]){ authMessage.textContent="Account existiert bereits"; return; }
  users[email] = { password, lang:"de", alphabet:{} };
  "abcdefghijklmnopqrstuvwxyz".split("").forEach(l=>{ users[email].alphabet[l]=0; });
  saveUsers();
  authMessage.style.color="green"; authMessage.textContent="Registrierung erfolgreich!";
};

document.getElementById("loginBtn").onclick = login;
passwordInput.addEventListener("keydown", e=>{ if(e.key==="Enter") login(); });

function login(){
  const email=emailInput.value, password=passwordInput.value;
  if(!users[email]||users[email].password!==password){ authMessage.textContent="Login fehlgeschlagen"; return; }
  currentUser=email; localStorage.setItem("currentUser", JSON.stringify(email)); initUser();
}

document.getElementById("logoutBtn").onclick = ()=>{
  localStorage.removeItem("currentUser"); showAuth();
};

function initUser(){ user = users[currentUser]; showApp(); applyLang(); renderProgress(); }

/* =========================
   I18N
========================= */

const translations = { de:{home:"Home",steps:"Ablauf",training:"Training",progress:"Fortschritt",subtitle:"Lerne Handschrift mit System",step1:"Satz ansehen",step2:"Satz schreiben",step3:"Fortschritt sammeln"}, en:{home:"Home",steps:"Steps",training:"Training",progress:"Progress",subtitle:"Learn handwriting with structure",step1:"Read sentence",step2:"Write sentence",step3:"Track progress"}};

function applyLang(){ document.querySelectorAll("[data-i18n]").forEach(el=>{ el.textContent=translations[user.lang][el.dataset.i18n]; }); }

/* =========================
   PROGRESS
========================= */

function renderProgress(){
  const grid = document.getElementById("alphabetGrid"); grid.innerHTML="";
  let done=0;
  Object.keys(user.alphabet).forEach(l=>{
    const el=document.createElement("div"); el.textContent=l.toUpperCase();
    if(user.alphabet[l]>=2){ el.classList.add("done"); done++; }
    grid.appendChild(el);
  });
  document.getElementById("progressText").textContent=`${done} / 26`;
}

/* =========================
   TRAINING CANVAS
========================= */

const canvas=document.getElementById("drawCanvas");
const ctx=canvas.getContext("2d");
let drawing=false;

function resizeCanvas(){ const dpr=window.devicePixelRatio||1; canvas.width=canvas.clientWidth*dpr; canvas.height=canvas.clientHeight*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); ctx.lineCap="round"; ctx.lineJoin="round"; ctx.strokeStyle="#000"; }
resizeCanvas();
window.addEventListener("resize",resizeCanvas);

canvas.addEventListener("pointerdown",e=>{ e.preventDefault(); drawing=true; ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); });
canvas.addEventListener("pointermove",e=>{ if(!drawing) return; e.preventDefault(); ctx.lineWidth=Math.max(1.5,e.pressure*5||2); ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); });
canvas.addEventListener("pointerup",e=>{ e.preventDefault(); drawing=false; });
canvas.addEventListener("pointerleave",e=>{ e.preventDefault(); drawing=false; });

document.getElementById("clearBtn").onclick=()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); };
document.getElementById("doneBtn").onclick=()=>{ alert("Super gemacht! ✍️"); ctx.clearRect(0,0,canvas.width,canvas.height); };

/* =========================
   AUTO LOGIN
========================= */
if(currentUser && users[currentUser]){ initUser(); } else { showAuth(); }
