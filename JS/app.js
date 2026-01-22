// Atajo tipo jQuery: $("#id") o $(".clase")
// Reduce repetición de document.querySelector(...)
const $ = (sel) => document.querySelector(sel);

// Estado global de la app (single source of truth)
const state = {
  products: window.PRODUCTS || [], // Catálogo (viene de data.js)
  filtered: [], // Resultado tras aplicar filtros/ordenamiento
  cart: readCart(), // Carrito persistido: { [productId]: qty }
};

// Formatea números como moneda MXN (para precios y totales)
function formatMoney(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

// Obtiene categorías únicas del catálogo y las ordena A-Z
function getCategories(products) {
  return Array.from(new Set(products.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b)
  );
}

// Muestra un toast (Bootstrap) con un mensaje corto
function showToast(msg) {
  const toastEl = $("#toast");
  $("#toastMsg").textContent = msg;

  // Reutiliza la instancia si ya existe
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 1600 });
  toast.show();
}

// Cuenta total de items en el carrito (suma de cantidades)
function getCartCount() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

// Agrega 1 unidad al carrito para un producto
function addToCart(productId) {
  state.cart[productId] = (state.cart[productId] || 0) + 1;
  saveCart(state.cart);     // Persistencia
  renderCartBadge();        // UI (contador)
  showToast("Producto agregado al carrito");
}

// Ajusta cantidad (si queda <=0, elimina el producto del carrito)
function setQty(productId, qty) {
  if (qty <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = qty;
  }
  saveCart(state.cart);
  renderCartBadge();
  renderCartModal(); // Re-render del modal para reflejar cambios
}

// Elimina un producto del carrito
function removeItem(productId) {
  delete state.cart[productId];
  saveCart(state.cart);
  renderCartBadge();
  renderCartModal();
  showToast("Producto eliminado");
}

// Renderiza el contador del carrito (badge del botón)
function renderCartBadge() {
  $("#cartCount").textContent = String(getCartCount());
}

// Lee UI de filtros (buscar/categoría/orden) y actualiza state.filtered
function applyFilters() {
  const q = $("#searchInput").value.trim().toLowerCase();
  const cat = $("#categorySelect").value;
  const sort = $("#sortSelect").value;

  // Copia para no mutar el arreglo original
  let list = [...state.products];

  // Filtro por categoría
  if (cat !== "all") list = list.filter((p) => p.category === cat);

  // Filtro por búsqueda (name/category/tag)
  if (q) {
    list = list.filter((p) => {
      const hay = `${p.name} ${p.category} ${p.tag}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // Ordenamientos opcionales
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  state.filtered = list;
}

// Renderiza cards de productos en el grid según state.filtered
function renderProducts() {
  const grid = $("#productsGrid");
  grid.innerHTML = "";

  const list = state.filtered;
  $("#resultsInfo").textContent = `${list.length} producto(s)`;

  list.forEach((p) => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-3";

    // Card del producto
    col.innerHTML = `
      <div class="card h-100 bg-black border border-secondary">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <h3 class="h6 mb-1">${p.name}</h3>
            <span class="badge text-bg-secondary">${p.category}</span>
          </div>

          <div class="text-secondary small mb-3">${p.tag}</div>

          <div class="mt-auto d-flex justify-content-between align-items-center">
            <div class="fw-bold">${formatMoney(p.price)}</div>
            <button class="btn btn-outline-success btn-sm" data-add="${p.id}">
              Agregar
            </button>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(col);
  });

  // Bind eventos "Agregar" (después de renderizar)
  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

// Renderiza el contenido del modal del carrito (tabla + totales)
function renderCartModal() {
  const tbody = $("#cartTbody");
  const cartIds = Object.keys(state.cart);

  const empty = $("#cartEmpty");
  const listWrap = $("#cartList");

  // Estado vacío
  if (cartIds.length === 0) {
    empty.classList.remove("d-none");
    listWrap.classList.add("d-none");
    $("#cartItems").textContent = "0";
    $("#cartTotal").textContent = formatMoney(0);
    return;
  }

  // Estado con items
  empty.classList.add("d-none");
  listWrap.classList.remove("d-none");

  let totalItems = 0;
  let total = 0;

  tbody.innerHTML = "";

  cartIds.forEach((id) => {
    const product = state.products.find((p) => p.id === id);
    if (!product) return; // Por seguridad si cambió el catálogo

    const qty = state.cart[id];
    const sub = qty * product.price;

    totalItems += qty;
    total += sub;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="fw-semibold">${product.name}</div>
        <div class="text-secondary small">${product.category} · ${product.tag}</div>
      </td>
      <td class="text-end">${formatMoney(product.price)}</td>
      <td class="text-center">
        <div class="btn-group btn-group-sm" role="group" aria-label="Cantidad">
          <button class="btn btn-outline-light" data-dec="${id}">−</button>
          <span class="btn btn-outline-secondary disabled">${qty}</span>
          <button class="btn btn-outline-light" data-inc="${id}">+</button>
        </div>
      </td>
      <td class="text-end">${formatMoney(sub)}</td>
      <td class="text-end">
        <button class="btn btn-outline-danger btn-sm" data-remove="${id}">
          Quitar
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Totales
  $("#cartItems").textContent = String(totalItems);
  $("#cartTotal").textContent = formatMoney(total);

  // Bind eventos dentro del modal (incrementar/decrementar/quitar)
  tbody.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.inc;
      setQty(id, (state.cart[id] || 0) + 1);
    });
  });

  tbody.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.dec;
      setQty(id, (state.cart[id] || 0) - 1);
    });
  });

  tbody.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeItem(btn.dataset.remove));
  });
}

// Conecta eventos UI (inputs, selects, botones, modal)
function initControls() {
  // 1) Llenar select de categorías dinámicamente
  const categories = getCategories(state.products);
  const sel = $("#categorySelect");
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });

  // 2) Cada cambio aplica filtros y re-renderiza productos
  const onChange = () => {
    applyFilters();
    renderProducts();
  };

  $("#searchInput").addEventListener("input", onChange);
  $("#categorySelect").addEventListener("change", onChange);
  $("#sortSelect").addEventListener("change", onChange);

  // 3) Reset de filtros
  $("#btnReset").addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#categorySelect").value = "all";
    $("#sortSelect").value = "relevance";
    applyFilters();
    renderProducts();
    showToast("Filtros reiniciados");
  });

  // 4) Acciones del carrito
  $("#btnClearCart").addEventListener("click", () => {
    if (!confirm("¿Vaciar carrito?")) return;
    state.cart = {};
    clearCart();
    renderCartBadge();
    renderCartModal();
    showToast("Carrito vaciado");
  });

  $("#btnCheckout").addEventListener("click", () => {
    if (!confirm("Checkout simulado: ¿confirmas la compra?")) return;
    state.cart = {};
    clearCart();
    renderCartBadge();
    renderCartModal();
    showToast("Compra simulada completada ✅");
  });

  // 5) Al abrir el modal, renderiza el contenido actualizado
  const modal = document.getElementById("cartModal");
  modal.addEventListener("show.bs.modal", () => renderCartModal());
}

// Inicialización general (arranque)
function init() {
  applyFilters();      // Calcula state.filtered desde el inicio
  renderProducts();    // Pinta catálogo inicial
  renderCartBadge();   // Pinta contador inicial desde LocalStorage
  initControls();      // Conecta eventos
}

init(); // Ejecuta la app
