const $ = (sel) => document.querySelector(sel);

const state = {
  products: window.PRODUCTS || [],
  filtered: [],
  cart: readCart(), // { [productId]: qty }
};

function formatMoney(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

function getCategories(products) {
  return Array.from(new Set(products.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function showToast(msg) {
  const toastEl = $("#toast");
  $("#toastMsg").textContent = msg;
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 1600 });
  toast.show();
}

function getCartCount() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function addToCart(productId) {
  state.cart[productId] = (state.cart[productId] || 0) + 1;
  saveCart(state.cart);
  renderCartBadge();
  showToast("Producto agregado al carrito");
}

function setQty(productId, qty) {
  if (qty <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = qty;
  }
  saveCart(state.cart);
  renderCartBadge();
  renderCartModal();
}

function removeItem(productId) {
  delete state.cart[productId];
  saveCart(state.cart);
  renderCartBadge();
  renderCartModal();
  showToast("Producto eliminado");
}

function renderCartBadge() {
  $("#cartCount").textContent = String(getCartCount());
}

function applyFilters() {
  const q = $("#searchInput").value.trim().toLowerCase();
  const cat = $("#categorySelect").value;
  const sort = $("#sortSelect").value;

  let list = [...state.products];

  if (cat !== "all") list = list.filter((p) => p.category === cat);

  if (q) {
    list = list.filter((p) => {
      const hay = `${p.name} ${p.category} ${p.tag}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  state.filtered = list;
}

function renderProducts() {
  const grid = $("#productsGrid");
  grid.innerHTML = "";

  const list = state.filtered;
  $("#resultsInfo").textContent = `${list.length} producto(s)`;

  list.forEach((p) => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-3";

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

  // Eventos "Agregar"
  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function renderCartModal() {
  const tbody = $("#cartTbody");
  const cartIds = Object.keys(state.cart);

  const empty = $("#cartEmpty");
  const listWrap = $("#cartList");

  if (cartIds.length === 0) {
    empty.classList.remove("d-none");
    listWrap.classList.add("d-none");
    $("#cartItems").textContent = "0";
    $("#cartTotal").textContent = formatMoney(0);
    return;
  }

  empty.classList.add("d-none");
  listWrap.classList.remove("d-none");

  let totalItems = 0;
  let total = 0;

  tbody.innerHTML = "";

  cartIds.forEach((id) => {
    const product = state.products.find((p) => p.id === id);
    if (!product) return;

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

  $("#cartItems").textContent = String(totalItems);
  $("#cartTotal").textContent = formatMoney(total);

  // Eventos cantidad y quitar
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

function initControls() {
  // Categorías
  const categories = getCategories(state.products);
  const sel = $("#categorySelect");
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });

  const onChange = () => {
    applyFilters();
    renderProducts();
  };

  $("#searchInput").addEventListener("input", onChange);
  $("#categorySelect").addEventListener("change", onChange);
  $("#sortSelect").addEventListener("change", onChange);

  $("#btnReset").addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#categorySelect").value = "all";
    $("#sortSelect").value = "relevance";
    applyFilters();
    renderProducts();
    showToast("Filtros reiniciados");
  });

  // Carrito acciones
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

  // Cuando abres el modal, renderiza
  const modal = document.getElementById("cartModal");
  modal.addEventListener("show.bs.modal", () => renderCartModal());
}

function init() {
  applyFilters();
  renderProducts();
  renderCartBadge();
  initControls();
}

init();
