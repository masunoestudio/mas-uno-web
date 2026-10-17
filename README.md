# Más Uno + — publicación con GitHub Pages

Esta carpeta contiene el sitio estático. La portada es `index.html`; todas las páginas y los archivos compartidos están al mismo nivel. Los enlaces son relativos para que funcionen tanto en la vista previa como en una dirección del tipo `https://USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

## Publicarlo desde el navegador

1. Iniciá sesión en GitHub y creá un repositorio nuevo, por ejemplo `mas-uno-web`.
2. Para una cuenta con GitHub Free, elegí visibilidad **Public**. GitHub Pages publica el sitio en internet; no subas información privada.
3. Abrí el repositorio y elegí **Add file → Upload files**.
4. Descomprimí `mas-uno-github-pages.zip` en tu computadora. Abrí la carpeta extraída y arrastrá **todos los archivos que contiene** al repositorio. `index.html` debe quedar directamente en la raíz, al mismo nivel que `mas-uno-site.css`, `mas-uno-home.js` y las demás páginas; no subas la carpeta contenedora como una subcarpeta.
5. Confirmá la carga con **Commit changes** en la rama `main`.
6. En el repositorio, abrí **Settings → Pages**. En **Build and deployment**, elegí **Deploy from a branch**; seleccioná `main` y la carpeta `/(root)`, y guardá.
7. Cuando GitHub termine la publicación, la dirección aparecerá en **Settings → Pages**. Abrila y recorré la navegación para comprobar las páginas.

## Actualizar el sitio

Subí los archivos modificados a la misma raíz y confirmá los cambios en `main`. GitHub Pages volverá a publicar el sitio.

## Nota de publicación

El sitio se publica como páginas estáticas: no necesita compilación ni servidor propio. El archivo `.nojekyll` deja explícito que no se requiere el procesamiento de Jekyll. Las páginas de calculadoras que están marcadas como “en preparación” o “en revisión” continúan siendo fichas informativas, no calculadoras habilitadas.
