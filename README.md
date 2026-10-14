# ANDROID LAB — Web app v0.1

Panel web de monitorización con interfaz profesional y diseño adaptable a celulares y tablets.

## Cómo probarla
1. Descargá y descomprimí `android_lab_web.zip`.
2. Subí `index.html`, `style.css` y `app.js` a un repositorio de GitHub.
3. En el repositorio, entrá en **Settings → Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**, seleccioná `main` y la carpeta `/ (root)`, y guardá.
5. Abrí la URL de GitHub Pages desde el teléfono Android.

También podés abrir `index.html` localmente, aunque algunas funciones del navegador pueden requerir HTTPS.

## Qué hace realmente
- Muestra reloj y fecha locales.
- Intenta leer el nivel de batería y el estado de carga mediante Battery Status API, si el navegador lo permite.
- Dibuja un historial del nivel de batería durante la sesión.
- Muestra capacidades básicas del navegador cuando están expuestas.
- Permite añadir marcas manuales al registro.

## Limitaciones importantes
- Muchos navegadores modernos no exponen Battery Status API. En ese caso, la app indica que el dato no está disponible.
- Los navegadores web no proporcionan una API estándar para leer la temperatura real de la batería, corriente eléctrica fiable o frecuencia/uso detallado de CPU.
- Esta versión no cambia el rendimiento del procesador ni calienta/enfría el dispositivo. Es una primera versión de monitorización, no un controlador térmico.
- Para leer sensores de Android y explorar controles adicionales, la siguiente etapa sería una app nativa o un contenedor híbrido con código nativo.

## Archivos
- `index.html`: estructura.
- `style.css`: diseño adaptable.
- `app.js`: lecturas compatibles, gráfico y registro.
