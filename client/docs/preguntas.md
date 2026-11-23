# Preguntas de cierre - EC2 F1 A6

## 1. ¿Qué función cumple la interfaz Task?
Define la estructura estricta y las propiedades obligatorias (id, title, status, createdAt, updatedAt) que debe tener todo objeto que represente una tarea en la aplicación.

## 2. ¿Qué diferencia existe entre Task y TaskStatus?
`Task` es una interfaz que describe la forma completa del objeto de tarea, mientras que `TaskStatus` es un tipo unión que limita el estado a únicamente los valores `'pending'` o `'completed'`.

## 3. ¿Qué significa declarar un arreglo como Task[]?
Indica a TypeScript que la colección solo puede contener objetos que cumplan exactamente con la interfaz `Task`, evitando elementos con estructuras incorrectas.

## 4. ¿Qué hace el método map?
Recorre cada elemento de un arreglo y genera un nuevo arreglo transformando cada objeto en un elemento JSX/React.

## 5. ¿Qué resultado produce map dentro de TaskList?
Transforma la lista de objetos `Task` en una lista de componentes `<TaskItem />` renderizados en la pantalla.

## 6. ¿Para qué utiliza React la propiedad key?
React usa `key` como un identificador único y estable para rastrear qué elementos de una lista han cambiado, se han agregado o se han eliminado, optimizando el renderizado del DOM.

## 7. ¿Por qué se utiliza task.id y no el índice?
Porque `task.id` es un identificador único y permanente ligado al dato. Los índices pueden cambiar si la lista se reordena, filtra o elimina elementos, causando errores visuales o de estado.

## 8. ¿Cómo se envía una tarea de TaskList a TaskItem?
Se envía a través de una propiedad llamada `task` (`<TaskItem key={task.id} task={task} />`).

## 9. ¿Cómo se comunican App, TaskSummary y TaskList?
`App` actúa como componente padre centralizando el arreglo `tasks` y distribuyéndolo como prop hacia `TaskSummary` y `TaskList` mediante un flujo de datos unidireccional.

## 10. ¿Qué es el renderizado condicional?
Es la capacidad de mostrar diferentes elementos visuales o componentes en la interfaz dependiendo de una condición matemática o lógica (por ejemplo, evaluar `tasks.length === 0`).

## 11. ¿Por qué el resumen se calcula a partir de la colección?
Porque es un valor derivado. Al calcularse dinámicamente con `filter` y `length`, se garantiza que los totales de completadas y pendientes siempre estén sincronizados con la colección real sin redundancia de estado.

## 12. ¿Qué dificultad encontraste durante la refactorización y cómo la resolviste?
Manejar el tipado de las props y la refactorización del componente de insignias en el desafío. Se resolvió creando un nuevo componente tipado `TaskStatusBadge` e importando los tipos e interfaces desde `task.interface.ts`.