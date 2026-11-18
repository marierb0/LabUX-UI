# BOO-GIE · Funky Disco

Landing page maquetada en **HTML5 + CSS3**, fiel al diseño de Figma (Desktop y iPhone 16). No usa JavaScript.

## Estructura

```
index.html       → estructura semántica (header, nav, main, section, article, footer)
css/styles.css   → estilos: tokens del Figma, posiciones y versión de celular
img/             → imágenes exportadas del Figma (WebP)
fonts/           → Jost, Rammetto One e Inter (licencia OFL)
```

## Interacciones (las mismas del prototipo de Figma, hechas solo con CSS)

- **Header fijo** con navegación por anclas: Inicio, Historia, Canciones y Artistas.
- **Botón "Explora más":** al pasar el mouse cambia a morado con brillo amarillo (estado Hover) y baja a "¿Qué es el Funk & Disco?".
- **Tarjetas de artistas:** el **+** voltea la tarjeta y muestra la biografía; el botón de flecha la regresa. Funciona con un `checkbox` y su `label`.
- **Reproductor:** cada vez que presionas **▶** pasa a la siguiente canción. Funciona con botones `radio`.
- **Menú hamburguesa (celular):** se abre con `:target` y se cierra con la X o tocando fuera.

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta a un repositorio, con `index.html` en la raíz.
2. Ve a **Settings → Pages → Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)` → **Save**.
3. Tu sitio quedará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.
