// Función para obtener los datos desde el archivo JSON
const obtenerDatosDesdeJSON = (archivo, callback) => {
  const request = new XMLHttpRequest();

  request.addEventListener("readystatechange", () => {
    if (request.readyState == 4 && request.status == 200) {
      const respuesta = JSON.parse(request.responseText);
      callback(null, respuesta);
    } else if (request.readyState === 4) {
      callback("No se han podido obtener los datos", null);
    }
  });

  request.open("GET", archivo);
  request.send();
};

// Captura de elementos HTML
const intentos = document.getElementById("intentos");
const cronometro = document.getElementById("cronometro");
const palabraElemento = document.getElementById("palabra");
const teclado = document.getElementById("teclado");
const errores = document.getElementById("errores");
const selector = document.getElementById("selector");
const perdida = document.getElementById("perdida");
const victoria = document.getElementById("victoria");
const imagenAhorcado = document.getElementById("dibujo").querySelector("img");

// Array de letras correctas
let letrasCorrectas = [];
let maxIntentos = 7;
let segundosTranscurridos = 0;
const tiempoRestarIntento = 7;
let tiempoInicio;
let cronometroInterval;
let palabraSeleccionada;
let tematicas;

// Llamada a la función para obtener las temáticas desde el archivo JSON
obtenerDatosDesdeJSON("json/tematicas.json", (error, datos) => {
  if (error) {
    console.error("Error al obtener las temáticas:", error);
  } else {
    tematicas = datos;
    console.log("Tematicas cargadas con éxito:", tematicas);
  }
});
// EventListener para el teclado
teclado.addEventListener("click", (e) => {
  if (e.target.classList.contains("letra")) {
    let letraUsada = e.target.textContent;
    ComprobarLetra(letraUsada.toLowerCase());
  }
});

//El usuario inserta una letra
function ComprobarLetra(letra) {
  if (palabraSeleccionada.includes(letra)) {
    letrasCorrectas.push(letra);
    reiniciarCronometro();
    mostrarPalabraConGuiones();
    // Agrega la clase "correcta" a la letra seleccionada
    teclado.querySelectorAll(".letra").forEach((element) => {
      if (element.textContent.toLowerCase() === letra) {
        element.classList.add("correcta");
      }
    });
  } else {
    restarIntento();
    errores.textContent = 7 - maxIntentos;
    // Agrega la clase "incorrecta" a la letra seleccionada
    teclado.querySelectorAll(".letra").forEach((element) => {
      if (element.textContent.toLowerCase() === letra) {
        element.classList.add("incorrecta");
      }
    });
  }
}
//Inicializar cronometro
function iniciarCronometro() {
  tiempoInicio = new Date();
  // Actualiza el cronómetro cada segundo
  cronometroInterval = setInterval(actualizarCronometro, 1000);
}
//Actualizar cronometro, intentos y texto
function actualizarCronometro() {
  const tiempoActual = new Date();
  const diferencia = tiempoActual - tiempoInicio;
  const segundos = Math.floor(diferencia / 1000);
  if (segundos > segundosTranscurridos) {
    segundosTranscurridos = segundos;
    // Cada siete segundos, resta un intento
    if (segundosTranscurridos % tiempoRestarIntento === 0) {
      restarIntento();
    }
  }
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const tiempoFormateado = `${rellenarCeros(horas)}:${rellenarCeros(
    minutos % 60
  )}:${rellenarCeros(segundos % 60)}`;

  cronometro.textContent = tiempoFormateado;
}

// Función para reiniciar el cronómetro
function reiniciarCronometro() {
  clearInterval(cronometroInterval);
  segundosTranscurridos = 0;
  iniciarCronometro();
}

// Función para mostrar la palabra con guiones bajos y letras adivinadas
function mostrarPalabraConGuiones() {
  let palabraMostrada = "";
  for (const letra of palabraSeleccionada) {
    if (letrasCorrectas.includes(letra)) {
      palabraMostrada += letra + " ";
    } else {
      palabraMostrada += "_ ";
    }
  }
  palabraElemento.textContent = palabraMostrada.trim();

  // Verificamos si el jugador ha adivinado todas las letras
  if (!palabraMostrada.includes("_")) {
    HasGanado();
  }
}

// Función para rellenar ceros en los dígitos menores a 10
function rellenarCeros(valor) {
  return valor < 10 ? `0${valor}` : valor;
}

//Para elegir temáticas
function elegirTematica(tematica) {
  const palabras = tematicas[tematica];
  palabraSeleccionada = palabras[Math.floor(Math.random() * palabras.length)];
  console.log("La palabra seleccionada es: " + palabraSeleccionada);
  selector.style.display = "none";
  mostrarPalabraConGuiones();
  iniciarCronometro();
}

function restarIntento() {
  maxIntentos--;
  intentos.textContent = maxIntentos;
  // Verificar si aún hay intentos restantes
  imagenAhorcado.src = `img/${8 - maxIntentos}.png`;
  intentos.textContent = maxIntentos;

  if (maxIntentos === 0) {
    ocultarElementos();
    perdida.style.display = "flex";
  }
  // Verificamos si se han agotado los intentos
  if (maxIntentos == 0) {
    clearInterval(cronometroInterval);
  }
}

//Lanzar pantalla de victoria
function HasGanado() {
  ocultarElementos();
  victoria.style.display = "flex";
  clearInterval(cronometroInterval);
}

// Oculta los elementos al ganar/perder
function ocultarElementos() {
  intentos.style.display = "none";
  cronometro.style.display = "none";
  palabraElemento.style.display = "none";
  teclado.style.display = "none";
  errores.style.display = "none";
  selector.style.display = "none";
  perdida.style.display = "none";
  victoria.style.display = "none";
  imagenAhorcado.style.display = "none";
}
function obtenerEstadisticas() {
  const estadisticas = localStorage.getItem("estadisticas");
  return estadisticas
    ? JSON.parse(estadisticas)
    : {
        partidasJugadas: 0,
        victorias: 0,
        tiempoTotal: 0,
      };
}

// Función para guardar estadísticas en el almacenamiento local
function guardarEstadisticas(estadisticas) {
  localStorage.setItem("estadisticas", JSON.stringify(estadisticas));
}

// Función para actualizar estadísticas después de cada partida
function actualizarEstadisticas(victoria, tiempo) {
  const estadisticas = obtenerEstadisticas();
  // Incrementar el número total de partidas jugadas
  estadisticas.partidasJugadas++;
  // Incrementar el número de victorias si la partida fue ganada
  if (victoria) {
    estadisticas.victorias++;
  }
  // Sumar el tiempo total de juego
  estadisticas.tiempoTotal += tiempo;
  // Calcular el tiempo promedio de juego
  estadisticas.tiempoPromedio =
    estadisticas.tiempoTotal / estadisticas.partidasJugadas;
  // Guardar las estadísticas actualizadas en localStorage
  guardarEstadisticas(estadisticas);
}
