
Proyecto: Ruleta Grande con Sobre de Preguntas

Estructura de carpetas esperada:
ruleta_project/
  index.html
  styles.css
  script.js
  assets/
    SEGUNDO/
      0.jpg ... 19.jpg
    TERCERO/
      0.jpg ... 19.jpg
    ...
    ADULTOS/
      0.jpg ... 19.jpg
    sounds/  (opcional para sustituir audios)
      click.mp3
      spin.mp3
      win.mp3

Notas:
- El código asume que cada nivel tiene hasta 20 imágenes nombradas 0.jpg .. 19.jpg.
- Al girar, el sobre mostrará una imagen aleatoria de las 20 del nivel seleccionado.
- Puedes reemplazar los <audio> src del index.html para usar archivos locales colocándolos en assets/sounds y editando el HTML.
- Abre index.html con Live Server (VS Code) o en el navegador directamente.
