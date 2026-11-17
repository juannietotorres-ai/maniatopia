---
description: "Aplicar al crear o modificar mensajes emergentes, botones, controles o fuentes de Maniatopia."
applyTo: "**/*.{html,js}"
---

# Mensajes emergentes explicativos

- Aplica la ley de [emergentes explicativos](../../spec/features/explanatory-tooltips.md): todos deben usar el «estilo de texto explicativo emergente maniatopia.com».
- En PC utiliza `data-help` con el CSS y JavaScript compartidos de `assets/tooltip` (variantes `.test` durante las pruebas), al pasar el ratón o recibir foco de teclado. No uses `title` como ayuda visible: el navegador impide darle el estilo de Maniatopia y puede duplicar el emergente.
- No añadas un segundo panel por clic ni el cursor `help` («?») a una explicación de PC. Reserva las ayudas por toque para dispositivos táctiles.
- Mantén mensajes breves y descriptivos; actualiza el texto si cambia la acción o el estado del control.
- Aplica siempre la [ley de exclusión del hover en móvil](../../spec/features/mobile-hover-tooltips.md): las ayudas de PC no deben aparecer en móvil, ni fugazmente por foco o eventos de ratón simulados al tocar.
- No crees emergentes por clic o toque en móvil salvo petición expresa del usuario. Conserva los ya autorizados, como el contador de visitantes y GeoSoberanos, con su apertura y cierre por toque y sin impedir otras acciones.
- Proporciona nombres accesibles, asociación de la descripción y acceso mediante teclado; permite cerrar la ayuda con Escape.
- Realiza los cambios primero en las versiones de prueba y no los pases a las oficiales hasta que el usuario lo indique.

# Carga de fuentes

- Precarga las fuentes locales necesarias para el texto visible al abrir cada página mediante `rel="preload"`, `as="font"`, el tipo adecuado y `crossorigin`.
- Para fuentes de Google, anticipa la conexión a `fonts.googleapis.com` y `fonts.gstatic.com`; no precargues archivos de fuentes sin conocer sus URL y variantes exactas.
- Evita precargar fuentes de elementos inicialmente ocultos y conserva las fuentes alternativas por si falla la carga.
- La precarga reduce la espera, pero no garantiza por sí sola que desaparezca el cambio visual de fuente.
