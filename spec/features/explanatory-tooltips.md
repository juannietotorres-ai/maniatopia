# Ley de los emergentes explicativos de Maniatopia

## Estilo obligatorio

Todo texto explicativo emergente nuevo o modificado debe usar el **«estilo de texto explicativo emergente maniatopia.com»**. La referencia visual es la descripción de GeoSoberanos mostrada por toque:

- Fuente Special Elite, alternativa monospace, peso 400, tamaño 16 px e interlineado 1.4.
- Texto blanco, sin sombra; fondo negro con opacidad 0.9.
- Borde blanco de 1 px con opacidad 0.55; esquinas redondeadas de 12 px.
- Espacio interior de 8 px vertical y 12 px horizontal.
- Ancho ajustado al contenido y limitado a la pantalla; las cadenas largas deben poder partirse.

El CSS compartido es la única definición visual: `assets/tooltip.test.css` durante las pruebas y `assets/tooltip.css` después de su promoción aprobada. No copiar estas propiedades en cada página. Los paneles táctiles específicos deben reutilizar la clase compartida `maniatopia-help`.

## Comportamiento

- En PC, usar `data-help` con el JavaScript compartido para mostrar una única ayuda al pasar el ratón o recibir foco de teclado. No usar `title`: su aspecto depende del navegador y no admite este estilo.
- No añadir un panel duplicado por clic en PC ni un cursor `help` («?»). Mantener el cursor propio de la acción real.
- Retirar la ayuda al salir del elemento o perder el foco y permitir cerrarla con Escape. Asociarla al elemento mediante `aria-describedby` y `role="tooltip"`.
- Aplicar siempre la [ley de exclusión del hover en móvil](mobile-hover-tooltips.md): las ayudas de PC no aparecen en móvil, ni brevemente al tocar. No crear ayudas por clic o toque salvo petición expresa del usuario.
- Conservar las excepciones táctiles autorizadas, como el contador de visitantes y GeoSoberanos: deben abrir y cerrar por toque y cerrarse al tocar fuera. No situarlas bajo el dedo.
- No interceptar ni exigir un segundo toque para navegar por enlaces o ejecutar otra acción. Si hace falta ayuda táctil en ellos, ofrecer un acceso específico que no impida la acción.
- Mantener nombres accesibles, controles de teclado y descripciones actualizadas cuando cambia una acción.
- Cargar Special Elite en las páginas que utilicen estas ayudas; para Google Fonts, anticipar la conexión, sin inventar URL de precarga.
- Probar en archivos `.test` y no promover páginas ni recursos oficiales sin autorización.

## Revisión de la web: 17 de noviembre de 2026

Se revisaron las páginas HTML de la raíz, sus versiones de prueba, los recursos compartidos y las tres páginas HTML de `jan/Maniatopia 1.0`. Se excluye la carpeta de reconstrucción indicada por el usuario.

### Implementado y oficializado

- `universos.html`: las descripciones de GeoSoberanos y Amigos utilizan el emergente compartido en PC, sin `title`. GeoSoberanos conserva la apertura por toque solo en dispositivos táctiles; Amigos sigue siendo un enlace directo en móvil.
- `assets/tooltip.css`: los emergentes `data-help` de Contacto, Créditos, Jan Space, Dónde estoy, Universos, Universos Amigos, StarCraft Tactics, Qué es Maniatopia y Shepherd comparten el estilo definido arriba. La descripción táctil de GeoSoberanos reutiliza esa misma definición.
- `donde-estoy.html`, `que-es-maniatopia.html` y `Shepherd.html`: las explicaciones antes nativas pasan a `data-help`, incluidos los cambios de texto al abrir/cerrar bloques y pausar/reanudar Cocina de arte. En PC siguen disponibles; en móvil no se activan.
- `index.html` y el JavaScript compartido bloquean el hover de PC también cuando el móvil emite eventos de ratón de compatibilidad. Se conservan las ayudas por toque del contador y GeoSoberanos, y los paneles de contenido por clic.
- Validación: las diez páginas `.test` de la raíz mantienen hover/foco en PC y no insertan ni muestran fugazmente ayudas de PC al simular toque, foco y ratón en un dispositivo táctil. Verificados además apertura, segundo toque y cierre fuera del contador y GeoSoberanos.
- Promoción a los archivos oficiales autorizada por el usuario el 17 de noviembre de 2026.

### Elementos que todavía no cumplen el estilo

| Página o grupo | Elementos encontrados | Motivo |
| --- | --- | --- |
| `index.html` y `.test` | Contador de visitantes, puerta del menú, Inicio y gramófono (4 elementos) | Sistema local `data-tooltip`/`visitor-counter-hint`: ya usa Special Elite, pero conserva forma de píldora, fondo 0.82 y otro interlineado, en vez de la definición compartida. |
| `jan/Maniatopia 1.0/index.html` | Puerta y gramófono (2 elementos) | Ayudas nativas `title`, incluido el cambio de texto al pausar/reanudar música. |
| `jan/Maniatopia 1.0/contacto.html` y `donde-estoy.html` | Una puerta por página (2 elementos) | Ayudas nativas `title`, sin recursos compartidos. |

Esta tabla identifica las migraciones pendientes: no autoriza a modificar los originales, el contenido archivado ni el comportamiento de sus controles.
