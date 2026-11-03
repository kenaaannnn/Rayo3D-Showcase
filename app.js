function abrirLegal(seccion) {
  const overlay = document.getElementById('legalOverlay');
  const tabTerms = document.getElementById('tab-terms');
  const tabPrivacy = document.getElementById('tab-privacy');
  if (!overlay) return;

  const esTerminos = seccion !== 'privacidad';
  if (esTerminos && tabTerms) tabTerms.checked = true;
  if (!esTerminos && tabPrivacy) tabPrivacy.checked = true;

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function cerrarLegal() {
  const overlay = document.getElementById('legalOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function cerrarLegalSiFondo(event) {
  if (event.target.id === 'legalOverlay' || event.target.classList.contains('backdrop')) {
    cerrarLegal();
  }
}

window.abrirLegal = abrirLegal;
window.cerrarLegal = cerrarLegal;
window.cerrarLegalSiFondo = cerrarLegalSiFondo;

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') cerrarLegal();
});

const bgAudio = document.getElementById('bgAudio');
const btnAudio = document.getElementById('btnAudio');
const audioDock = document.getElementById('audioDock');
const audioVolume = document.getElementById('audioVolume');
const audioStatus = document.getElementById('audioStatus');
const audioIconPlay = document.getElementById('audioIconPlay');
const audioIconPause = document.getElementById('audioIconPause');
const DEFAULT_VOLUME = 0.35;
let userPausedAudio = false;

if (bgAudio) {
  bgAudio.volume = audioVolume ? Number(audioVolume.value) : DEFAULT_VOLUME;
}

function actualizarUIAudio() {
  const playing = !!(bgAudio && !bgAudio.paused);
  if (btnAudio) {
    btnAudio.setAttribute('aria-pressed', String(playing));
    btnAudio.setAttribute('aria-label', playing ? 'Pausar música de fondo' : 'Reproducir música de fondo');
  }
  if (audioIconPlay) audioIconPlay.classList.toggle('hidden', playing);
  if (audioIconPause) audioIconPause.classList.toggle('hidden', !playing);
  if (audioStatus) audioStatus.textContent = playing ? 'Pause' : 'Play';
  if (audioDock) {
    audioDock.classList.toggle('is-playing', playing);
    audioDock.classList.toggle('is-paused', !playing);
  }
}

function reproducirFondo() {
  if (!bgAudio) return Promise.resolve();
  if (audioVolume) bgAudio.volume = Number(audioVolume.value);
  return bgAudio.play()
    .then(() => {
      userPausedAudio = false;
      actualizarUIAudio();
    })
    .catch(() => {
      actualizarUIAudio();
    });
}

function toggleAudio() {
  if (!bgAudio) return;
  if (bgAudio.paused) {
    userPausedAudio = false;
    reproducirFondo();
  } else {
    userPausedAudio = true;
    bgAudio.pause();
    actualizarUIAudio();
  }
}

function iniciarAudioAlPrimerClic(event) {
  if (userPausedAudio || !bgAudio || !bgAudio.paused) return;
  if (event.target.closest && event.target.closest('#btnAudio')) return;
  reproducirFondo();
}

if (bgAudio) {
  bgAudio.addEventListener('play', actualizarUIAudio);
  bgAudio.addEventListener('pause', actualizarUIAudio);
  bgAudio.addEventListener('volumechange', () => {
    if (audioVolume && Math.abs(Number(audioVolume.value) - bgAudio.volume) > 0.01) {
      audioVolume.value = String(bgAudio.volume);
    }
  });
}

if (audioVolume) {
  audioVolume.addEventListener('input', () => {
    if (!bgAudio) return;
    bgAudio.volume = Number(audioVolume.value);
    if (bgAudio.paused && !userPausedAudio) reproducirFondo();
  });
}

['click', 'touchstart', 'keydown'].forEach((tipo) => {
  document.addEventListener(tipo, iniciarAudioAlPrimerClic, { once: true, capture: true });
});

window.toggleAudio = toggleAudio;
actualizarUIAudio();

// --- MOTOR 3D DE FONDO (CRISTALES & GEMAS MULTICOLOR) ---
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ILUMINACIÓN MULTICOLOR (Rojo, Azul, Verde)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const redLight = new THREE.PointLight(0xef4444, 3, 30);
redLight.position.set(-5, 5, 2);
scene.add(redLight);

const cyanLight = new THREE.PointLight(0x06b6d4, 3, 30);
cyanLight.position.set(5, -5, 2);
scene.add(cyanLight);

const emeraldLight = new THREE.PointLight(0x10b981, 2, 30);
emeraldLight.position.set(0, 5, -5);
scene.add(emeraldLight);

// OBJETO CENTRAL: NÚCLEO GEOMÉTRICO 3D
const coreGeo = new THREE.OctahedronGeometry(2, 0);
const coreMat = new THREE.MeshStandardMaterial({
  color: 0x0f172a,
  roughness: 0.1,
  metalness: 0.8,
  wireframe: true
});
const coreMesh = new THREE.Mesh(coreGeo, coreMat);
scene.add(coreMesh);

// CRISTALES FLOTANTES ALREDEDOR
const shardsCount = 40;
const shardsGroup = new THREE.Group();
const shardGeo = new THREE.TetrahedronGeometry(0.3);

for (let i = 0; i < shardsCount; i++) {
  const shardMat = new THREE.MeshStandardMaterial({
    color: i % 3 === 0 ? 0xef4444 : (i % 3 === 1 ? 0x06b6d4 : 0x10b981),
    roughness: 0.2,
    metalness: 0.5
  });
  const shard = new THREE.Mesh(shardGeo, shardMat);
  shard.position.set(
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 12
  );
  shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  shardsGroup.add(shard);
}
scene.add(shardsGroup);

// ANIMACIÓN CONTINUA EN 3D
function animate() {
  requestAnimationFrame(animate);
  coreMesh.rotation.y += 0.005;
  coreMesh.rotation.x += 0.003;
  shardsGroup.rotation.y -= 0.002;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- LÓGICA DEL CUESTIONARIO Y SELECCIÓN ---
let userConfig = {
  ocasion: '',
  estilo: '',
  modalidad: ''
};

function iniciarCuestionario() {
  gsap.to('#stepHero', { opacity: 0, duration: 0.4, onComplete: () => {
    document.getElementById('stepHero').classList.add('hidden');
    document.getElementById('step1').classList.remove('hidden');
    gsap.fromTo('#step1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
  }});
}

function seleccionarOcasión(ocasion) {
  userConfig.ocasion = ocasion;
  gsap.to('#step1', { opacity: 0, duration: 0.3, onComplete: () => {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
    gsap.fromTo('#step2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
  }});
}

function seleccionarEstilo(estilo) {
  userConfig.estilo = estilo;
  gsap.to('#step2', { opacity: 0, duration: 0.3, onComplete: () => {
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.remove('hidden');
    gsap.fromTo('#step3', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
  }});
}

function finalizarSeleccion(modalidad) {
  userConfig.modalidad = modalidad;
  
  const resumen = `• Ocasión: ${userConfig.ocasion}\n• Estilo: ${userConfig.estilo}\n• Modalidad: ${modalidad === 'Automatico' ? 'Automatizado 24/7' : 'Personalizado Sábado con Kenan VIP'}`;
  document.getElementById('resumenConfig').innerText = resumen;

  // Enlace simulado de Mercado Pago (aquí pegas tu link real de pago de MP)
  const mpLink = modalidad === 'Automatico' 
    ? "https://mpago.la/2kuLMPd" 
    : "https://mpago.la/338gnj7";
  
  document.getElementById('btnMercadoPago').href = mpLink;

  gsap.to('#step3', { opacity: 0, duration: 0.3, onComplete: () => {
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('stepCheckout').classList.remove('hidden');
    gsap.fromTo('#stepCheckout', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }});
}

function procesarPago() {
  alert("Redirigiendo a la pasarela segura de Mercado Pago...");
}
// ==========================================================
// ANALÍTICA DE TIEMPO Y EVENTOS 3D - RAYO 3D STUDIO
// ==========================================================

let tiempoInicio = Date.now();
let tiempoAcumulado = 0;
let sesionActiva = true;

// Medir tiempo de atención activa
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    tiempoAcumulado += Math.floor((Date.now() - tiempoInicio) / 1000);
    sesionActiva = false;
  } else {
    tiempoInicio = Date.now();
    sesionActiva = true;
  }
});

// Registrar duración final al salir de la web
window.addEventListener('beforeunload', () => {
  if (sesionActiva) {
    tiempoAcumulado += Math.floor((Date.now() - tiempoInicio) / 1000);
  }

  if (typeof gtag === 'function') {
    gtag('event', 'tiempo_interaccion_3d', {
      'duracion_segundos': tiempoAcumulado,
      'estudio': 'Rayo 3D Studio'
    });
  }
});

// Función para registrar clics en tus modelos Three.js
function registrarEvento3D(accion, nombreObjeto) {
  if (typeof gtag === 'function') {
    gtag('event', 'interaccion_canvas_3d', {
      'accion': accion,
      'objeto': nombreObjeto
    });
  }
}
// ==========================================================
// CONTROL DE INTENTOS GRATIS Y LÍMITE DE USO (RAYO 3D)
// ==========================================================

const MAX_INTENTOS = 3;

function obtenerIntentosRestantes() {
  let intentos = localStorage.getItem('rayo_intentos_gratis');
  if (intentos === null) {
    intentos = MAX_INTENTOS;
    localStorage.setItem('rayo_intentos_gratis', intentos);
  }
  return parseInt(intentos, 10);
}

function aplicarControlDeIntentos() {
  let intentos = obtenerIntentosRestantes();
  const modal = document.getElementById('modalLimite');
  const badge = document.getElementById('badgeIntentos');

  // Si ya no quedan intentos, muestra el modal de bloqueo
  if (intentos <= 0) {
    if (badge) badge.textContent = `Pruebas gratis: 0/${MAX_INTENTOS}`;
    if (modal) modal.classList.remove('hidden');

    // Desactiva la rotación 3D en caso de usar OrbitControls de Three.js
    if (typeof controls !== 'undefined' && controls) {
      controls.enabled = false;
    }
    return;
  }

  // Resta 1 intento por cada visita/recarga de la página
  intentos--;
  localStorage.setItem('rayo_intentos_gratis', intentos);

  if (badge) {
    badge.textContent = `Pruebas gratis: ${intentos}/${MAX_INTENTOS}`;
  }
}

// Redirección al agotar los intentos
function solicitarAcceso() {
  const mensaje = encodeURIComponent("¡Hola Rayo 3D Studio! Agoté mis pruebas gratuitas en la web y me gustaría información para acceder al contenido o cotizar un proyecto.");
  // Reemplaza 5212345678900 con tu número de WhatsApp real
  window.open(`https://wa.me/5212345678900?text=${mensaje}`, '_blank');
}

// COMANDO PARA MIS PRUEBAS: Escribe resetearPruebas() en la consola del navegador para reiniciar a 3
window.resetearPruebas = function() {
  localStorage.setItem('rayo_intentos_gratis', MAX_INTENTOS);
  location.reload();
};

// Iniciar verificación al cargar
document.addEventListener('DOMContentLoaded', () => {
  aplicarControlDeIntentos();
});
// ==========================================================
// CONTADOR DE VISTAS Y LIKES SIMULADO / LOCAL
// ==========================================================

function inicializarEstadisticas() {
  // Cargar vistas guardadas o iniciar base
  let vistas = parseInt(localStorage.getItem('rayo_vistas_totales') || '1250', 10);
  let likes = parseInt(localStorage.getItem('rayo_likes_totales') || '482', 10);

  // Sumar 1 vista nueva por visita
  vistas += 1;
  localStorage.setItem('rayo_vistas_totales', vistas);

  const elemVistas = document.getElementById('contadorVistas');
  const elemLikes = document.getElementById('contadorLikes');

  if (elemVistas) elemVistas.textContent = vistas.toLocaleString();
  if (elemLikes) elemLikes.textContent = likes.toLocaleString();
}

function darLike() {
  let likes = parseInt(localStorage.getItem('rayo_likes_totales') || '482', 10);
  let yaDioLike = localStorage.getItem('rayo_usuario_dio_like');

  if (!yaDioLike) {
    likes += 1;
    localStorage.setItem('rayo_likes_totales', likes);
    localStorage.setItem('rayo_usuario_dio_like', 'true');

    const elemLikes = document.getElementById('contadorLikes');
    if (elemLikes) elemLikes.textContent = likes.toLocaleString();

    // Lanzar confeti al dar like
    if (typeof confetti === 'function') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.2 } });
    }
  }
}

// Iniciar al cargar la página
document.addEventListener('DOMContentLoaded', inicializarEstadisticas);