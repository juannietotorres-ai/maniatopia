# Principios del proyecto

Estos principios orientan los cambios de la web y sus versiones de prueba.

## Conservar los originales

- Probar primero los cambios visuales en archivos `- TEST.html`.
- No modificar ni sustituir las páginas originales hasta que se haya revisado y aprobado el resultado.
- Mantener los recursos de prueba separados de los originales cuando sea necesario conservar ambos.

## Cuidar la experiencia

- Comprobar que los cambios funcionan en pantallas grandes y móviles.
- Mantener legibles los textos y utilizables los controles de navegación sobre el fondo.
- Respetar el idioma, la identidad visual y las convenciones existentes en cada página.
- Las ayudas de hover son exclusivas de PC: aplicar siempre la [ley de exclusión del hover en móvil](../features/mobile-hover-tooltips.md). Solo crear emergentes por clic o toque en móvil si el usuario los solicita expresamente, sin retirar los ya autorizados, como el contador de visitantes y GeoSoberanos.
- Mantener los textos emergentes legibles y fuera de la zona que tapa el dedo, y facilitar también su acceso y cierre mediante teclado y tecnologías de asistencia.
- Si un elemento ejecuta otra acción al tocarlo, diseñar un acceso táctil a la explicación que no impida esa acción.
- Aplicar a todos los emergentes explicativos la [ley del estilo de texto explicativo emergente maniatopia.com](../features/explanatory-tooltips.md), sin duplicar la ayuda de PC con paneles por clic.

## Ley previa sobre emergentes

- No crear, inventar ni añadir un emergente explicativo por iniciativa propia.
- Antes de implementar cualquier emergente nuevo, preguntar al usuario qué elemento debe explicarse y qué texto debe mostrar.
- Solo crear emergentes cuando el usuario los solicite expresamente o haya aprobado ese elemento concreto.
- No aplicar emergentes a textos o botones existentes como resultado automático de una navegación o cambio de diseño.

## Mantener los cambios claros

- Usar rutas relativas para los recursos locales de la web.
- Evitar cambios ajenos al objetivo de cada prueba.
- Verificar las referencias a imágenes y el resultado esperado antes de dar una prueba por terminada.
