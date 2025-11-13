/* script.js - motor de la ruleta grande y control del sobre derecho */

/* CONFIGURACIÓN:
 - Niveles: el orden solicitado.
 - Rutas de imágenes: assets/<NIVEL>/<index>.jpg (index 0..19). 
   Ejemplo: assets/SEGUNDO/0.jpg ... assets/SEGUNDO/19.jpg
 - Por cada giro, el sobre mostrará una imagen elegida aleatoriamente entre las 20 del nivel seleccionado.
*/

const levels = ["SEGUNDO","TERCERO","CUARTO","QUINTO","SEXTO","SEPTIMO","DOCENTES","ADULTOS"];
const numbers = Array.from({length:10},(_,i)=>i);
const IMAGE_COUNT_PER_LEVEL = 20; // coloca 0..19 por cada nivel en assets/<NIVEL>/

// elementos DOM
const wheel = document.getElementById('wheel');
const pointer = document.querySelector('.pointer');
const openLevelBtn = document.getElementById('openLevelBtn');
const levelMenu = document.getElementById('levelMenu');
const spinBtn = document.getElementById('spinBtn');
const quickSpin = document.getElementById('quickSpin');
const durationInput = document.getElementById('duration');
const currentLevelDom = document.getElementById('currentLevel');
const lastResultDom = document.getElementById('lastResult');
const envelopeNumber = document.getElementById('envelopeNumber');
const envImage = document.getElementById('envImage');
const noImgHint = document.getElementById('noImgHint');

// sonidos
const soundClick = document.getElementById('soundClick');
const soundSpin = document.getElementById('soundSpin');
const soundWin = document.getElementById('soundWin');

function playSound(s){
  try{ s.currentTime = 0; s.play(); } catch(e){ /* autoplay may be blocked until user interacts */ }
}

// generar segmentos visuales en la rueda (0..9)
function buildWheel() {
  const segCount = numbers.length;
  const angle = 360 / segCount;
  wheel.innerHTML = '';
  const palette = ["#ef4d4dff","#f7b825ff","#56f58dff","#48c1f9ff","#a368f5ff","#e652b7ff","#75f280ff","#db4c4cff","#8fb0ff","#eae31cff"];

  numbers.forEach((n, i) => {
    const seg = document.createElement('div');
    seg.className = 'segment';
    seg.style.background = palette[i % palette.length];
    seg.style.transform = `rotate(${i * angle}deg)`;
    seg.style.clipPath = `polygon(50% 50%, 100% 0, 100% 48%)`;

    // crear el número curvado en el borde
    const label = document.createElement('span');
    label.textContent = n;
    label.style.position = 'absolute';
    label.style.transformOrigin = 'bottom center';
    label.style.transform = `rotate(${angle / 2}deg) translate(90px) rotate(${125 - angle / 2}deg)`;
    label.style.fontSize = '30px';
    label.style.fontWeight = '900';
    label.style.color = 'rgba(255, 255, 255, 1)';
    seg.appendChild(label);

    wheel.appendChild(seg);
  });
}
buildWheel();

// crear menu de niveles
function buildLevelMenu(){
  levelMenu.innerHTML = '';
  levels.forEach(l=>{
    const item = document.createElement('div');
    item.className = 'level-item';
    item.textContent = l;
    item.addEventListener('click', ()=>{
      selectLevel(l);
      levelMenu.classList.add('hidden');
    });
    levelMenu.appendChild(item);
  });
}
buildLevelMenu();

let selectedLevel = null;
let currentRotation = 0;
let spinning = false;

openLevelBtn.addEventListener('click', ()=>{
  levelMenu.classList.toggle('hidden');
  playSound(soundClick);
});

function selectLevel(lvl){
  selectedLevel = lvl;
  spinBtn.disabled = false;
  currentLevelDom.querySelector('strong').textContent = lvl;
  playSound(soundClick);
}

// función para elegir imagen del nivel
function pickImageForLevel(lvl){
  // intentará cargar assets/<lvl>/<idx>.jpg con idx aleatorio 0..IMAGE_COUNT_PER_LEVEL-1
  const idx = Math.floor(Math.random()*IMAGE_COUNT_PER_LEVEL);
  const path = `assets/${lvl}/${idx}.jpg`;
  return {path, idx};
}

// función para mostrar imagen en sobre (si existe)
function showEnvelopeForNumber(number){
  envelopeNumber.textContent = number;
  if(!selectedLevel){ envImage.src=''; noImgHint.style.display='block'; return; }
  const picked = pickImageForLevel(selectedLevel);
  // probamos asignar -- si no existe la imagen el navegador mostrará 404; indicamos pista al usuario
  envImage.src = picked.path;
  envImage.onload = ()=>{ noImgHint.style.display='none'; };
  envImage.onerror = ()=>{ envImage.src=''; noImgHint.style.display='block'; };
}

// lógica del giro
function spin(finalCallback){
  if(spinning) return;
  if(!selectedLevel){ alert('Selecciona primero un nivel antes de girar.'); return; }
  spinning = true;
  playSound(soundSpin);

  const duration = Math.max(0.5, parseFloat(durationInput.value) || 4);
  const anglePer = 360 / numbers.length;
  const targetIndex = Math.floor(Math.random()*numbers.length);

  // definimos vueltas aleatorias
  const extraTurns = Math.floor(Math.random()*5)+3; // 3..7 vueltas
  const final = -(extraTurns*360 + targetIndex*anglePer + anglePer/2);

  // acumulamos rotación
  currentRotation += final;

  // aplicar transición con duración variable
  wheel.style.transition = `transform ${duration}s cubic-bezier(.08,.8,.22,1)`;
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  // mientras gira, podemos ir actualizando el sobre con números intermedios
  const spinStart = performance.now();
  const updateDuringSpin = (time)=>{
    const t = (time - spinStart) / (duration*1000); // 0..1
    if(t>=1) return; // final
    // calcular un índice interpolado según progreso para simular cambio rápido de números
    const virtualAngle = - ( (extraTurns*360) * t + t * (targetIndex*anglePer) );
    const virtualIndex = Math.abs(Math.round((virtualAngle % 360) / anglePer)) % numbers.length;
    const currentNum = numbers[(virtualIndex+numbers.length) % numbers.length];
    envelopeNumber.textContent = currentNum;
    // opcional: mostrar imagen cambiante mientras gira (elige imagen aleatoria rápida)
    const temp = pickImageForLevel(selectedLevel);
    envImage.src = temp.path;
    requestAnimationFrame(updateDuringSpin);
  };
  requestAnimationFrame(updateDuringSpin);

  wheel.addEventListener('transitionend', function _end(){
    wheel.removeEventListener('transitionend', _end);
    spinning = false;
    const landed = numbers[targetIndex];
    lastResultDom.querySelector('strong').textContent = landed;
    envelopeNumber.textContent = landed;
    // mostrar la imagen final (definitiva)
    const finalImg = pickImageForLevel(selectedLevel);
    envImage.src = finalImg.path;
    envImage.onerror = ()=>{ envImage.src=''; noImgHint.style.display='block'; };
    envImage.onload = ()=>{ noImgHint.style.display='none'; };
    playSound(soundWin);
    if(finalCallback) finalCallback(landed);
  });
}
// botón girar
spinBtn.addEventListener('click', ()=>{
  playSound(soundClick);
  spin();
});
// atajos teclado
window.addEventListener('keydown',(e)=>{
  if(e.key.toLowerCase()==='g') spinBtn.click();
});
// inicialización visual
showEnvelopeForNumber('-');
