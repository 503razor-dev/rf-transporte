// 📅 Fecha automática
const inputFecha = document.getElementById("fecha");
if (inputFecha) {
  inputFecha.value = new Date().toISOString().split("T")[0];
}

// 📅 Formatear fecha
function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return `${parseInt(partes[2])} ${meses[parseInt(partes[1]) - 1]} ${partes[0]}`;
}

// 📦 Datos
let viajes = JSON.parse(localStorage.getItem("viajes")) || [];
let viajesMostrados = [];

const formulario = document.getElementById("formulario");
const lista = document.getElementById("lista");
const totalSpan = document.getElementById("total");

// 🚀 Inicio
mostrarViajes();

// 🧠 Formatear nombre
function formatearNombre(texto) {
  return texto
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// 📝 Guardar viaje
formulario.addEventListener("submit", function(e) {
  e.preventDefault();

  const cliente = formatearNombre(document.getElementById("cliente").value);
  const precio = parseFloat(document.getElementById("precio").value);
  const estado = document.getElementById("estado").value;
  const fecha = document.getElementById("fecha").value;

  if (!cliente) return alert("Ingrese un cliente");
  if (isNaN(precio) || precio <= 0) return alert("Precio inválido");
  if (!fecha) return alert("Seleccione fecha");

  const viaje = { cliente, precio, estado, fecha };

  viajes.push(viaje);
  guardar();
  mostrarViajes();
  formulario.reset();

  inputFecha.value = new Date().toISOString().split("T")[0];
});

// 💾 Guardar
function guardar() {
  localStorage.setItem("viajes", JSON.stringify(viajes));
}

// 📋 Crear item
function crearItem(v, index) {
  const li = document.createElement("li");

  li.innerHTML = `
    📅 ${formatearFecha(v.fecha)} <br>
    👤 ${v.cliente} - 💰 $${v.precio} 
    <strong>(${v.estado})</strong>
  `;

  li.style.background = v.estado === "Pagado" ? "#d4edda" : "#f8d7da";

  const btn = document.createElement("button");
  btn.textContent = "Eliminar";
  btn.className = "btn-eliminar";

  btn.onclick = () => {
    if (confirm("¿Eliminar este viaje?")) {
      viajes.splice(index, 1);
      guardar();
      mostrarViajes();
    }
  };

  li.appendChild(btn);
  return li;
}

// 📋 Mostrar todos
function mostrarViajes() {
  lista.innerHTML = "";

  let total = 0;
  let pendiente = 0;

  viajesMostrados = [...viajes];

  viajes.forEach((v, index) => {
    lista.appendChild(crearItem(v, index));

    if (v.estado === "Pagado") total += v.precio;
    else pendiente += v.precio;
  });

  totalSpan.textContent = total;
  actualizarResumen(viajes.length, pendiente);
}

// 🔍 Filtrar por fecha
function filtrarPorFecha() {
  const fechaSeleccionada = document.getElementById("filtroFecha").value;

  if (!fechaSeleccionada) return alert("Selecciona una fecha");

  lista.innerHTML = "";

  let total = 0;
  let pendiente = 0;
  let totalViajes = 0;

  viajesMostrados = [];

  viajes.forEach((v, index) => {

    if (v.fecha === fechaSeleccionada) {

      viajesMostrados.push(v);
      totalViajes++;

      lista.appendChild(crearItem(v, index));

      if (v.estado === "Pagado") total += v.precio;
      else pendiente += v.precio;
    }
  });

  totalSpan.textContent = total;
  actualizarResumen(totalViajes, pendiente);
}

// ❌ LIMPIAR FILTRO (NUEVO)
function limpiarFiltro() {

  // limpiar fecha
  document.getElementById("filtroFecha").value = "";

  // limpiar lista
  document.getElementById("lista").innerHTML = "";

  // resetear total
  document.getElementById("total").textContent = "0";

  actualizarResumen(0, 0);

  viajesMostrados = [];
}

// 📊 Resumen
function actualizarResumen(totalViajes, pendiente) {

  let viajesTexto = document.getElementById("totalViajes");
  if (!viajesTexto) {
    viajesTexto = document.createElement("h3");
    viajesTexto.id = "totalViajes";
    totalSpan.parentElement.appendChild(viajesTexto);
  }
  viajesTexto.textContent = `🚛 Total de viajes: ${totalViajes}`;

  let deuda = document.getElementById("deuda");
  if (!deuda) {
    deuda = document.createElement("h3");
    deuda.id = "deuda";
    totalSpan.parentElement.appendChild(deuda);
  }
  deuda.textContent = `💸 Te deben: $${pendiente}`;
}

// 💾 GUARDAR SEGÚN LO QUE VES
function guardarHistorial() {

  if (viajesMostrados.length === 0) {
    alert("No hay datos para guardar");
    return;
  }

  let contenido = `<h1>📋 Historial</h1><hr>`;

  let total = 0;
  let pendiente = 0;
  let totalViajes = 0;

  viajesMostrados.forEach(v => {

    totalViajes++;

    contenido += `
      <p>
        📅 ${formatearFecha(v.fecha)} |
        👤 ${v.cliente} |
        💰 $${v.precio} |
        ${v.estado}
      </p>
    `;

    if (v.estado === "Pagado") total += v.precio;
    else pendiente += v.precio;
  });

  contenido += `
    <hr>
    <h2>💰 Total: $${total}</h2>
    <h2>🚛 Total de viajes: ${totalViajes}</h2>
    <h2>💸 Te deben: $${pendiente}</h2>
  `;

  let ventana = window.open("", "", "width=800,height=600");

  ventana.document.write(`
    <html>
      <head><title>Historial</title></head>
      <body>${contenido}</body>
    </html>
  `);

  ventana.document.close();
  ventana.print();
}
document.getElementById("btnLimpiar").addEventListener("click", limpiarFiltro);