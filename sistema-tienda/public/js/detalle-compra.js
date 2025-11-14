const API_BASE = "http://localhost:3000";

let productosCache = [];

// ========== CARGAR LISTA DE DETALLES ==========
async function cargarDetallesCompra() {
  try {
    const res = await fetch(`${API_BASE}/detalles-compra/listar`);
    const data = await res.json();
    const tabla = document.getElementById("listaDetallesCompra");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado
        .map((d) => `
          <tr>
            <td>${d.id_det}</td>
            <td>${d.nro_fac}</td>
            <td>${d.cod_pro}</td>
            <td>${d.cant_pro}</td>
            <td>${d.val_uni_pro}</td>
            <td>${d.val_total_pro}</td>
          </tr>
        `)
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="6" class="text-center">No hay detalles registrados</td></tr>';
    }
  } catch (err) {
    document.getElementById("listaDetallesCompra").innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar detalles</td></tr>';
  }
}

// ========== REGISTRAR DETALLE ==========
const formDetalleCompra = document.getElementById("formDetalleCompra");
if (formDetalleCompra) {
  formDetalleCompra.addEventListener("submit", async (e) => {
    e.preventDefault();
    const detalle = {
      nro_fac: document.getElementById("compraId").value.trim(),
      cod_pro: document.getElementById("productoId").value.trim(),
      cant_pro: document.getElementById("cantidad").value.trim(),
      val_uni_pro: document.getElementById("precio_unitario").value.trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/detalles-compra/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detalle),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Detalle registrado correctamente");
        formDetalleCompra.reset();
        cargarDetallesCompra();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al registrar detalle"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== CARGAR OPCIONES DE COMPRAS Y PRODUCTOS ==========
async function cargarOpcionesComprasYProductos() {
  // Cargar compras
  try {
    const resCompras = await fetch(`${API_BASE}/compras/listar`);
    const dataCompras = await resCompras.json();
    const selectCompra = document.getElementById("compraId");
    if (selectCompra && dataCompras.resultado) {
      selectCompra.innerHTML = '<option value="">Seleccione una compra</option>' +
        dataCompras.resultado.map(c =>
          `<option value="${c.nro_fac}">${c.nro_fac} - ${c.ide_cli} - ${new Date(c.fec_fac).toLocaleDateString()}</option>`
        ).join('');
    }
  } catch {}

  // Cargar productos
  try {
    const resProductos = await fetch(`${API_BASE}/productos/listar`);
    const dataProductos = await resProductos.json();
    const selectProducto = document.getElementById("productoId");
    if (selectProducto && dataProductos.resultado) {
      productosCache = dataProductos.resultado; // Guardar productos para uso posterior
      selectProducto.innerHTML = '<option value="">Seleccione un producto</option>' +
        dataProductos.resultado.map(p =>
          `<option value="${p.cod_pro}" data-precio="${p.val_pro}">${p.cod_pro} - ${p.nom_pro}</option>`
        ).join('');
    }
  } catch {}
}

// ========== PRECIO UNITARIO AUTOMÁTICO ==========
const selectProducto = document.getElementById("productoId");
const inputPrecioUnitario = document.getElementById("precio_unitario");
if (selectProducto && inputPrecioUnitario) {
  selectProducto.addEventListener("change", function () {
    const cod_pro = this.value;
    const producto = productosCache.find(p => p.cod_pro == cod_pro);
    if (producto) {
      inputPrecioUnitario.value = producto.val_pro;
    } else {
      inputPrecioUnitario.value = "";
    }
  });
}

// ========== CARGAR DATOS AL INICIAR ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarDetallesCompra();
  cargarOpcionesComprasYProductos();
});
