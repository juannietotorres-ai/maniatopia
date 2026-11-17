# Ley: las ayudas de hover de PC no aparecen en móvil

## Regla obligatoria

Los textos explicativos que aparecen al pasar el ratón en PC son exclusivos de PC. En móvil no deben abrirse al tocar, recibir foco, simular un hover ni emitir eventos de ratón de compatibilidad; tampoco pueden verse durante una fracción de segundo.

No crear emergentes por clic o toque en móvil salvo que el usuario los solicite expresamente. No convertir automáticamente una ayuda de hover en una ayuda por toque.

## Excepciones autorizadas que deben conservarse

- El contador de visitantes con el stickman, que abre y cierra su explicación al tocarlo.
- Universos GeoSoberanos, que abre y cierra su descripción al tocar el título.
- Cualquier otro panel por clic o toque expresamente solicitado por el usuario. Esta ley no elimina los paneles de contenido ni los avisos que forman parte de una acción.

No aplicar una ocultación global de `role="tooltip"`, de los paneles emergentes ni de sus clases: podría eliminar estas excepciones.

## Implementación

- Separar las ayudas de hover/foco de PC de los manejadores explícitos de clic o toque.
- En las ayudas de PC, comprobar el tipo de dispositivo con `(hover: none), (pointer: coarse)` y el tipo de puntero del evento. Rechazar el hover y el foco que puedan provocar la aparición de esas ayudas en móvil.
- Si se cambia de modo PC a táctil, cerrar la ayuda de hover que estuviera abierta.
- No dejar atributos `title` con explicaciones de hover en las páginas adaptadas: usar el sistema compartido `data-help`, que permite controlar tanto el estilo como la activación.
- Mantener los nombres accesibles y la navegación; tocar un enlace o un botón no debe requerir una interacción extra por culpa de una ayuda.
- Mantener el hover y el foco de teclado en PC con el [estilo explicativo de Maniatopia](explanatory-tooltips.md).
- Trabajar primero en las versiones `.test`; no promover archivos oficiales sin autorización.

## Validación obligatoria

- En móvil, tocar los controles y simular eventos de ratón y foco: las ayudas exclusivas de PC no deben insertarse ni hacerse visibles, ni siquiera momentáneamente.
- Comprobar que siguen funcionando el primer toque, segundo toque y cierre fuera del contador y GeoSoberanos.
- Comprobar que las ayudas de hover y teclado siguen disponibles en PC.
