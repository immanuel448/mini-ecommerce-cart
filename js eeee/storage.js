// ================================
// storage.js
// Responsabilidad: persistir y recuperar el carrito en LocalStorage
// ================================

// Claves centralizadas para LocalStorage.
// Ventaja: si luego cambias el nombre de la key, solo lo haces aquí.
const STORAGE_KEYS = {
  cart: "mini_ecom_cart_v1", // Nombre de la key donde guardamos el carrito (versionada)
};

// Lee el carrito desde LocalStorage y lo devuelve como objeto.
// Formato esperado: { "p1": 2, "p5": 1 }  -> productId: cantidad
function readCart() {
  try {
    // 1) Trae el string guardado (o null si no existe)
    const raw = localStorage.getItem(STORAGE_KEYS.cart);

    // 2) Si no hay nada guardado todavía, devuelve carrito vacío
    if (!raw) return {};

    // 3) Convierte el string JSON a objeto JS
    const obj = JSON.parse(raw);

    // 4) Validación mínima: aseguramos que sea un objeto
    // (si por alguna razón hay otro tipo guardado, evitamos romper la app)
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    // Si el JSON está corrupto o falla el parseo, regresamos carrito vacío
    // para que la app siga funcionando sin crashear.
    return {};
  }
}

// Guarda el carrito en LocalStorage.
// Recibe un objeto con el formato { productId: qty }.
function saveCart(cart) {
  // Convertimos el objeto a JSON string antes de guardarlo
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

// Elimina por completo el carrito de LocalStorage.
// Útil cuando el usuario hace "Vaciar carrito" o "Checkout".
function clearCart() {
  localStorage.removeItem(STORAGE_KEYS.cart);
}
