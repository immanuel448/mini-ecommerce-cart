const STORAGE_KEYS = {
  cart: "mini_ecom_cart_v1",
};

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cart);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem(STORAGE_KEYS.cart);
}
