const CANTIDAD_HOYOS = 9;
const DURACION = 15;          // segundos
const ASOMA_MIN = 900;        // ms que el topo queda visible
const ASOMA_MAX = 1500;

const tablero = document.getElementById('tablero');
const elPuntos = document.getElementById('puntos');
const elTiempo = document.getElementById('tiempo');
const elRecord = document.getElementById('record');
const elMensaje = document.getElementById('mensaje');
const btnJugar = document.getElementById('btn-jugar');

let hoyos = [];
let puntos = 0;
let tiempo = DURACION;
let jugando = false;
let ultimoHoyo = -1;
let timerReloj = null;
let timerTopo = null;
let record = leerRecord();

elRecord.textContent = record;

// Crear el tablero
for (let i = 0; i < CANTIDAD_HOYOS; i++) {
  const hoyo = document.createElement('button');
  hoyo.type = 'button';
  hoyo.className = 'hoyo';
  hoyo.setAttribute('aria-label', 'Hoyo ' + (i + 1));
  hoyo.innerHTML = '<span class="topo"></span>';
  hoyo.addEventListener('pointerdown', () => golpear(hoyo));
  tablero.appendChild(hoyo);
  hoyos.push(hoyo);
}

btnJugar.addEventListener('click', empezar);

function empezar() {
  clearInterval(timerReloj);
  clearTimeout(timerTopo);
  hoyos.forEach(h => h.classList.remove('activo', 'golpeado'));

  puntos = 0;
  tiempo = DURACION;
  jugando = true;
  actualizarMarcador();
  elMensaje.textContent = '¡Ahora!';
  btnJugar.textContent = 'Reiniciar';

  timerReloj = setInterval(() => {
    tiempo--;
    actualizarMarcador();
    if (tiempo <= 0) terminar();
  }, 1000);

  mostrarTopo();
}

function mostrarTopo() {
  if (!jugando) return;

  // Elegir un hoyo distinto al anterior
  let i;
  do { i = Math.floor(Math.random() * CANTIDAD_HOYOS); } while (i === ultimoHoyo);
  ultimoHoyo = i;

  const hoyo = hoyos[i];
  hoyo.classList.remove('golpeado');
  hoyo.classList.add('activo');

  // Los topos se aceleran apenas con el paso del tiempo
  const factor = 0.8 + (tiempo / DURACION) * 0.2;
  const visible = (ASOMA_MIN + Math.random() * (ASOMA_MAX - ASOMA_MIN)) * factor;

  timerTopo = setTimeout(() => {
    hoyo.classList.remove('activo');
    timerTopo = setTimeout(mostrarTopo, 500 + Math.random() * 400);
  }, visible);
}

function golpear(hoyo) {
  if (!jugando || !hoyo.classList.contains('activo')) return;

  puntos++;
  hoyo.classList.add('golpeado');
  hoyo.classList.remove('activo');
  actualizarMarcador();

  // Pasar enseguida al siguiente topo
  clearTimeout(timerTopo);
  timerTopo = setTimeout(mostrarTopo, 500);
}

function terminar() {
  jugando = false;
  clearInterval(timerReloj);
  clearTimeout(timerTopo);
  hoyos.forEach(h => h.classList.remove('activo'));

  if (puntos > record) {
    record = puntos;
    guardarRecord(record);
    elRecord.textContent = record;
    elMensaje.textContent = '¡Nuevo récord! Atrapaste ' + puntos + ' topos.';
  } else {
    elMensaje.textContent = 'Se acabó el tiempo. Atrapaste ' + puntos + ' topos.';
  }
  btnJugar.textContent = 'Jugar de nuevo';
}

function actualizarMarcador() {
  elPuntos.textContent = puntos;
  elTiempo.textContent = Math.max(tiempo, 0);
}

function leerRecord() {
  try { return Number(localStorage.getItem('topos-record')) || 0; }
  catch (e) { return 0; }
}
function guardarRecord(valor) {
  try { localStorage.setItem('topos-record', String(valor)); }
  catch (e) { /* sin almacenamiento disponible */ }
}