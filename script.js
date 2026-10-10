
const CANCIONES = [
  { titulo: "Sincerely Yours",  artista: "Thee Sinseers & Joey Quiñones", youtube: "https://youtu.be/ywiTM8FVJMY?si=iHnNmvnnbnhi5WwJ" },
  { titulo: "Once You Know",    artista: "Thee Sacred Souls",             youtube: "https://youtu.be/siO6dkqidc4?si=Mi4sRYWVedkAzP7H" },
];
const MUSICA_AL_ENTRAR = true;
const TEXTO_ALIEN = "Tu novia esta medio loca creo que lo sabes . . . . te manda una carta dice que aun que estes tan lejos ella te ama y lo hara siempre";
const $ = (sel) => document.querySelector(sel);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const alClick = (el, fn) => {
  el.addEventListener("click", fn);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(e); }
  });
};
["img/nave.jpg", "img/alien.png", "img/sobre.png", "img/dialogo.png",
 "img/papel.jpg", "img/pinguinos.png", "img/astronauta.jpg"].forEach((src) => {
  const i = new Image(); i.src = src;
});
const canvas = $("#estrellas");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, DPR = 1;
let estrellas = [];
let fugaces = [];
let velocidad = 1;         
let velocidadObjetivo = 1;
let animando = true;
function ajustarCanvas() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const cantidad = Math.round(Math.min(260, (W * H) / 5200));
  estrellas = Array.from({ length: cantidad }, () => nuevaEstrella(true));
}
function nuevaEstrella(enCualquierLado) {
  const z = Math.random() ** 1.8 * 0.85 + 0.15;   
  return {
    x: Math.random() * W,
    y: enCualquierLado ? Math.random() * H : -10,
    z,
    r: z * 1.35 + 0.2,
    fase: Math.random() * Math.PI * 2,
    titila: 0.6 + Math.random() * 1.8,
    tono: Math.random() < 0.18 ? "205,215,255" : Math.random() < 0.1 ? "255,236,200" : "255,255,255",
  };
}
function lanzarFugaz() {
  if (!animando || velocidadObjetivo > 1) return;
  const desdeIzq = Math.random() < 0.5;
  fugaces.push({
    x: desdeIzq ? Math.random() * W * 0.5 : W * 0.5 + Math.random() * W * 0.5,
    y: Math.random() * H * 0.35,
    vx: (desdeIzq ? 1 : -1) * (380 + Math.random() * 220),
    vy: 160 + Math.random() * 120,
    vida: 0,
    dura: 0.9 + Math.random() * 0.5,
  });
  setTimeout(lanzarFugaz, 6000 + Math.random() * 7000);
}
let ultimo = performance.now();
function dibujarCielo(ahora) {
  if (!animando) return;
  const dt = Math.min((ahora - ultimo) / 1000, 0.05);
  ultimo = ahora;
  velocidad += (velocidadObjetivo - velocidad) * Math.min(dt * 1.6, 1);

  ctx.clearRect(0, 0, W, H);

  for (const s of estrellas) {
    const vy = 7 * s.z * velocidad;           
    s.y += vy * dt;
    if (s.y > H + 20) Object.assign(s, nuevaEstrella(false));
    const brillo = 0.55 + 0.45 * Math.sin(ahora / 1000 * s.titila + s.fase);
    const alfa = (0.35 + 0.65 * s.z) * brillo;
    if (velocidad > 3) {
      const largo = Math.min(vy * 0.06, H * 0.5);
      ctx.strokeStyle = `rgba(${s.tono},${Math.min(alfa + 0.2, 1)})`;
      ctx.lineWidth = s.r;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y - largo);
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(${s.tono},${alfa})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.z > 0.82) {                       
        ctx.fillStyle = `rgba(${s.tono},${alfa * 0.12})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }   // si este wey me esta siendo infiel mientras escribo esto, me mato 
    }
  }
  fugaces = fugaces.filter((f) => f.vida < f.dura);
  for (const f of fugaces) {
    f.vida += dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    const t = f.vida / f.dura;
    const a = Math.sin(t * Math.PI);
    const g = ctx.createLinearGradient(f.x, f.y, f.x - f.vx * 0.22, f.y - f.vy * 0.22);
    g.addColorStop(0, `rgba(255,255,255,${0.9 * a})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.lineTo(f.x - f.vx * 0.22, f.y - f.vy * 0.22);
    ctx.stroke();
  }

  requestAnimationFrame(dibujarCielo);
}

ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);



const LINK_DOCUMENTO = "https://docs.google.com/document/d/1GidMbNEuv3HdtlH188FkWZckCinqdJDOA-sqKZZtSgw/edit?usp=sharing"; 

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  for (const s of estrellas) {
    const dx = mouseX - s.x;
    const dy = mouseY - s.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);
    if (distancia <= Math.max(s.r * 5, 15)) {
      window.open(LINK_DOCUMENTO, "_blank");
      break;
    }
  }
});




requestAnimationFrame(dibujarCielo);
setTimeout(lanzarFugaz, 3500);
const escenaEspacio = $("#escena-espacio");
const escenaNave = $("#escena-nave");
const cohete = $("#cohete");
let enLaNave = false;

setTimeout(() => $(".pista-cohete").classList.add("visible"), 2500);

alClick(cohete, async () => {
  if (enLaNave) return;
  enLaNave = true;

  if (MUSICA_AL_ENTRAR && audio.paused) reproducir(actual);

  $(".pista-cohete").classList.remove("visible");
  velocidadObjetivo = 110;              
  escenaEspacio.classList.add("entrando");

  await esperar(2100);
  escenaEspacio.classList.remove("activa");
  escenaNave.classList.add("activa");

  await esperar(1500);
  animando = false;                        
  asomarAlien();
});
const alien = $("#alien");
const dialogo = $("#dialogo");
const dialogoTexto = $("#dialogo-texto");
const sobreMano = $("#sobre-mano");
let alienListo = false;
let alienHablo = false;



/* no putas mames nose que hice */
function asomarAlien() {
  alien.classList.add("asomandose");
  alien.addEventListener("animationend", function fin(e) {
    if (e.animationName !== "asomarse") return;
    alien.removeEventListener("animationend", fin);
    alien.classList.remove("asomandose");
    alien.classList.add("listo");
    alienListo = true;
    setTimeout(() => { if (!alienHablo) $(".pista-alien").classList.add("visible"); }, 900);
  });
}
alClick(alien, async (e) => {
  if (!alienListo || alienHablo) return;
  if (sobreMano.contains(e.target)) return;
  alienHablo = true;
  $(".pista-alien").classList.remove("visible");

  dialogo.classList.add("visible");
  await esperar(450);
  for (const letra of TEXTO_ALIEN) {
    dialogoTexto.textContent += letra;
    await esperar(letra === " " ? 40 : 62);
  }
  await esperar(550);
  chispitas(sobreMano);
  sobreMano.classList.add("aparece");
});


function chispitas(el) {
  const caja = el.getBoundingClientRect();
  const padre = alien.getBoundingClientRect();
  const cx = caja.left - padre.left + caja.width / 2;
  const cy = caja.top - padre.top + caja.height / 2;

  for (let i = 0; i < 18; i++) {
    const c = document.createElement("span");
    const esEstrella = i % 3 === 0;
    c.className = "chispa" + (esEstrella ? " estrellita" : "");
    if (esEstrella) c.textContent = "✦";
    const ang = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
    const dist = 40 + Math.random() * 55;
    c.style.left = cx + "px";
    c.style.top = cy + "px";
    c.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    c.style.setProperty("--dy", Math.sin(ang) * dist + "px");
    c.style.animationDelay = Math.random() * 0.15 + "s";
    alien.appendChild(c);
    setTimeout(() => c.remove(), 1500);
  }
}
const capa = $("#capa-carta");
const sobreGrande = $("#sobre-grande");
const sobreInclinado = $("#sobre-inclinado");
const cartaScroll = $("#carta-scroll");
let estadoCarta = "cerrada"; 

alClick(sobreMano, (e) => {
  e.stopPropagation();
  if (estadoCarta !== "cerrada") return;
  estadoCarta = "sobre";

  capa.classList.add("abierta");
  capa.setAttribute("aria-hidden", "false");
  sobreGrande.classList.remove("sacando");
  sobreGrande.classList.add("visible");
  const desde = sobreMano.getBoundingClientRect();
  const hasta = sobreGrande.getBoundingClientRect();
  sobreMano.classList.add("escondido");
  const dx = desde.left + desde.width / 2 - (hasta.left + hasta.width / 2);
  const dy = desde.top + desde.height / 2 - (hasta.top + hasta.height / 2);
  const s = desde.width / hasta.width;
  sobreInclinado.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(-9deg)` },
      { transform: "translate(0,0) scale(1) rotate(0)" },
    ],
    { duration: 1000, easing: "cubic-bezier(.2,.8,.2,1)" }
  );

  setTimeout(() => $(".pista-sobre").classList.add("visible"), 1400);
});

sobreGrande.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  const r = sobreGrande.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  sobreInclinado.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`;
});
sobreGrande.addEventListener("pointerleave", () => {
  sobreInclinado.style.transform = "";
});

alClick(sobreGrande, async () => {
  if (estadoCarta !== "sobre") return;
  estadoCarta = "carta";
  $(".pista-sobre").classList.remove("visible");
  sobreGrande.classList.add("sacando");

  await esperar(500);
  cartaScroll.scrollTop = 0;
  cartaScroll.classList.add("visible");
  capa.classList.add("con-carta");
  await esperar(500);
  sobreGrande.classList.remove("visible", "sacando");
});

alClick($("#cerrar"), async () => {
  if (estadoCarta !== "carta") return;
  capa.classList.remove("abierta", "con-carta");
  capa.setAttribute("aria-hidden", "true");
  await esperar(800);
  cartaScroll.classList.remove("visible");
  sobreMano.classList.remove("escondido");
  estadoCarta = "cerrada";
});

(function acomodarPinguinos() {
  const texto = $("#texto-carta");
  const pinguinos = $("#pinguinos");
  const parrafos = [...texto.querySelectorAll("p")];
  if (parrafos.length < 2) { texto.appendChild(pinguinos); return; }

  const total = parrafos.reduce((n, p) => n + p.textContent.length, 0);
  let suma = 0;
  for (const p of parrafos) {
    suma += p.textContent.length;
    if (suma >= total / 2) { p.after(pinguinos); return; }
  }
})();

/* =========================================================
   En vez de que me arrulle tu voz me arrulla el silencio del lugar 
Mismo lugar donde 
Espero tu llamada
Donde nunca 
me senté y ni sentí tu calor 
Mismo lugar donde nunca
pensé en volver a amar con Fervor 
con pasión y dedicación 
Tal vez no,

Pero sentir me lo quiero permitir 
Mientras sea en tus brazos 
En tus besos 
Y en esos labios que ame 
Tal vez si 
Caer en ti
No puedo decidir 
Tal vez estás con alguien más 
Tal vez no 
Llámenme loca la obsesión que tengo con verte sonreír 
Caer en ti 
Solo quiero amor 
mientras me quiebro por dentro
Tal vez no 
Pero sentir me lo quiero permitir
   ========================================================= */











const musica = $("#musica");
const lista = $("#lista");
const aviso = $("#aviso");
let actual = 0;
let player = null;
let playerListo = false;
let pendiente = null;
let sonando = false;

const audio = { get paused() { return !sonando; } };

function sacarId(link) {
  const m = String(link).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(link) ? link : null;
}

CANCIONES.forEach((c, i) => {
  const li = document.createElement("li");
  li.innerHTML = `<button><span class="titulo"></span><span class="artista"></span></button>`;
  li.querySelector(".titulo").textContent = c.titulo;
  li.querySelector(".artista").textContent = c.artista;
  li.querySelector("button").addEventListener("click", () => reproducir(i));
  lista.appendChild(li);
});

function marcarActual() {
  [...lista.children].forEach((li, i) => li.classList.toggle("actual", i === actual));
}

function ponerSonando(si) {
  sonando = si;
  musica.classList.toggle("sonando", si);
}

function reproducir(i) {
  actual = (i + CANCIONES.length) % CANCIONES.length;
  marcarActual();
  const id = sacarId(CANCIONES[actual].youtube);
  if (!id) { aviso.textContent = `Falta el link de "${CANCIONES[actual].titulo}"`; return; }
  if (!playerListo) { pendiente = actual; return; }
  aviso.textContent = "";
  player.loadVideoById(id);
  player.playVideo();
}

function playPausa() {
  if (!playerListo) return reproducir(actual);
  if (sonando) return player.pauseVideo();
  const data = player.getVideoData && player.getVideoData();
  if (data && data.video_id) player.playVideo();
  else reproducir(actual);
}

if (location.protocol === "file:") {
  aviso.textContent = "ABRELE CON GO LIFE ";
}
const yt = document.createElement("script");
yt.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(yt);

window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player("yt-player", {
    width: 200,
    height: 200,
    playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0 },
    events: {
      onReady: () => {
        playerListo = true;
        if (pendiente !== null) reproducir(pendiente);
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) { ponerSonando(true); aviso.textContent = ""; }
        if (e.data === YT.PlayerState.PAUSED) ponerSonando(false);
        if (e.data === YT.PlayerState.ENDED) { ponerSonando(false); reproducir(actual + 1); }
      },
      onError: () => {
        ponerSonando(false);
        aviso.textContent = `"${CANCIONES[actual].titulo}" SI SALE ESTO NO JALA SJJSJSH ES Q ES UNA MIERDAAAAAAAAAAAA `;
      },
    },
  });
};

$("#play").addEventListener("click", playPausa);
$("#anterior").addEventListener("click", () => reproducir(actual - 1));
$("#siguiente").addEventListener("click", () => reproducir(actual + 1));

$("#disco").addEventListener("click", (e) => {
  e.stopPropagation();
  musica.classList.toggle("abierta");
});
document.addEventListener("click", (e) => {
  if (!musica.contains(e.target)) musica.classList.remove("abierta");
});

marcarActual();
