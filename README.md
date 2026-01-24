# Mini E-commerce – Cart Demo

Proyecto demo de frontend que simula un mini e-commerce con:
- catálogo dinámico
- filtros
- carrito de compras
- persistencia con LocalStorage

No usa backend ni frameworks JS.

## Funcionalidades

- 🔍 Búsqueda por texto
- 🗂 Filtro por categoría
- ↕️ Ordenamiento (precio / nombre)
- 🛒 Carrito con:
  - agregar / quitar productos
  - control de cantidades
  - subtotal y total
- 💾 Persistencia del carrito con LocalStorage
- 🔔 Feedback visual con Toasts (Bootstrap)

## Tecnologías

- HTML5
- CSS (Bootstrap 5)
- JavaScript Vanilla
- LocalStorage API

## Estructura

```text
js/
├─ data.js // Datos de productos
├─ storage.js // Persistencia en LocalStorage
└─ app.js // Lógica principal (UI + estado)
```

## Objetivo

Proyecto creado como **demo de portafolio** para mostrar:
- manejo de estado en frontend
- lógica de carrito
- manipulación del DOM
- buenas prácticas sin frameworks

## Nota

Este proyecto simula un flujo real, pero **no procesa pagos**.

## Autor

**Immanuel (Frontend Developer)**  
Desarrollado por [immanuel448](https://github.com/immanuel448)

