export const documentationContent = {
    dashboard: `# Manual de Usuario: Dashboard de la Agencia
  
  Este manual explica la información y funcionalidades que puedes encontrar en el dashboard principal de tu agencia.
  
  ## ¿Qué es el Dashboard?
  El dashboard es el panel de control principal de la agencia. Aquí puedes visualizar de manera rápida y centralizada los datos más importantes sobre el estado de tu inventario, ventas, productos y actividad reciente.
  
  ## Secciones del Dashboard
  
  ### 1. Resumen General
  En la parte superior encontrarás tarjetas con los siguientes indicadores clave:
  - **Total Productos**: Cantidad total de productos registrados en el sistema.
  - **Valor del Inventario**: Suma total del valor de todos los productos en stock.
  - **Ventas Mensuales**: Total de ventas realizadas en el mes actual y su crecimiento respecto al mes anterior.
  - **Productos Bajo Mínimo**: Número de productos cuyo stock está por debajo del mínimo recomendado.
  
  ### 2. Actividad Reciente
  Lista de los últimos movimientos de inventario (entradas y salidas), mostrando:
  - Tipo de movimiento (entrada o salida).
  - Fecha y hora.
  - Producto y cantidad involucrada.
  - Área o ubicación del movimiento.
  - Notas asociadas (si existen).
  
  ### 3. Productos con Stock Bajo
  Visualiza los productos que requieren reposición inmediata, junto con su SKU y el stock actual comparado con el mínimo requerido.
  
  ### 4. Productos Más Vendidos
  Gráfica y listado de los productos con mayor rotación en ventas. Permite identificar los artículos más populares.
  
  ### 5. Distribución por Áreas
  Muestra cómo se distribuye el valor del inventario entre las diferentes áreas o ubicaciones de la agencia.
  
  ### 6. Rendimiento del Inventario
  Incluye visualizaciones y métricas sobre:
  - Distribución de entradas y salidas de inventario.
  - Estado de stock (normal vs bajo).
  - Tendencias de valor de inventario a lo largo del tiempo.
  - Movimientos mensuales y balance.
  - Rotación de inventario por categoría.
  
  ## Consejos de Uso
  
  > **💡 Tip**: Revisa el dashboard diariamente para mantener un control efectivo de tu inventario y identificar oportunidades de mejora.
  
  ### Acciones Recomendadas
  1. **Monitoreo diario**: Revisa los indicadores principales cada mañana
  2. **Gestión proactiva**: Atiende inmediatamente los productos con stock bajo
  3. **Análisis de tendencias**: Utiliza los gráficos para identificar patrones de venta
  4. **Optimización**: Ajusta tu estrategia basándote en los productos más vendidos
  
  ## Navegación Rápida
  Desde el dashboard puedes acceder directamente a:
  - Módulo de Inventario
  - Gestión de Productos
  - Reportes Detallados
  - Configuración de Alertas`,
  
    inventario: `# Manual de Usuario: Módulo de Inventario
  
  Este manual describe el funcionamiento del módulo de Inventario, sus principales herramientas y cómo gestionar los productos de tu agencia.
  
  ## ¿Qué es el Módulo de Inventario?
  El módulo de Inventario te permite gestionar todos los productos, categorías, stock, descuentos y movimientos relacionados con el inventario de tu agencia. Es una herramienta central para el control y la optimización de tus existencias.
  
  ## Funcionalidades Principales
  
  ### Gestión de Productos
  - **Creación de productos**: Registro completo con información detallada
  - **Edición masiva**: Actualización de múltiples productos simultáneamente
  - **Categorización**: Organización por categorías y subcategorías
  - **Etiquetado**: Sistema de etiquetas para clasificación avanzada
  - **Control de variantes**: Gestión de productos con múltiples variaciones
  
  ### Control de Stock
  - **Registro de movimientos**: Entradas y salidas automáticas y manuales
  - **Transferencias entre áreas**: Movimiento de productos entre ubicaciones
  - **Alertas inteligentes**: Notificaciones automáticas de stock bajo
  - **Historial completo**: Trazabilidad de todos los movimientos
  - **Inventario físico**: Herramientas para conteos y ajustes
  
  ### Reportes y Análisis
  - **Valor del inventario**: Cálculos en tiempo real del valor total
  - **Rotación de productos**: Análisis de velocidad de venta
  - **Tendencias de ventas**: Identificación de patrones estacionales
  - **Productos más vendidos**: Rankings de productos estrella
  - **Análisis ABC**: Clasificación por importancia económica
  
  ## Gestión de Productos
  
  ### Crear un Nuevo Producto
  
  1. **Información Básica**
     - Nombre del producto
     - Descripción detallada
     - SKU (código único)
     - Código de barras
  
  2. **Clasificación**
     - Categoría principal
     - Subcategoría
     - Etiquetas personalizadas
     - Marca y modelo
  
  3. **Precios y Costos**
     - Precio de compra
     - Precio de venta
     - Margen de ganancia
     - Descuentos aplicables
  
  4. **Control de Stock**
     - Stock inicial
     - Stock mínimo
     - Stock máximo
     - Punto de reorden
  
  ### Movimientos de Inventario
  
  #### Tipos de Movimientos
  - **Entrada por Compra**: Productos adquiridos a proveedores
  - **Entrada por Ajuste**: Correcciones de inventario
  - **Salida por Venta**: Productos vendidos a clientes
  - **Salida por Ajuste**: Correcciones negativas
  - **Transferencia**: Movimientos entre áreas
  
  #### Registro de Movimientos
  \`\`\`
  1. Seleccionar tipo de movimiento
  2. Elegir productos involucrados
  3. Especificar cantidades
  4. Indicar área de origen/destino
  5. Agregar notas explicativas
  6. Confirmar el movimiento
  \`\`\`
  
  ## Alertas y Notificaciones
  
  ### Configuración de Alertas
  - **Stock bajo**: Cuando el inventario está por debajo del mínimo
  - **Stock crítico**: Cuando el inventario está en niveles críticos
  - **Productos vencidos**: Para productos con fecha de caducidad
  - **Movimientos inusuales**: Detección de patrones anómalos
  
  ### Gestión de Notificaciones
  - Configuración de destinatarios
  - Frecuencia de envío
  - Canales de notificación (email, SMS, push)
  - Personalización de mensajes
  
  ## Mejores Prácticas
  
  > **⚠️ Importante**: Mantén siempre actualizado tu inventario para evitar discrepancias entre el sistema y la realidad física.
  
  ### Recomendaciones Operativas
  1. **Actualización constante**: Registra todos los movimientos inmediatamente
  2. **Conteos periódicos**: Realiza inventarios físicos regulares
  3. **Configuración de mínimos**: Establece puntos de reorden apropiados
  4. **Categorización consistente**: Mantén un sistema de clasificación coherente
  5. **Documentación completa**: Incluye toda la información relevante de cada producto
  
  ### Optimización del Inventario
  - Análisis regular de rotación
  - Identificación de productos de lento movimiento
  - Optimización de niveles de stock
  - Negociación con proveedores basada en datos
  - Implementación de estrategias Just-in-Time cuando sea apropiado`,
  
    tiendas: `# Manual de Usuario: Creación y Gestión de Tiendas
  
  ## Introducción
  Este manual te guiará paso a paso en el proceso de crear y gestionar tiendas en nuestro sistema. Las tiendas son unidades organizacionales que te permiten segmentar tu negocio por ubicaciones, departamentos o cualquier otra división lógica.
  
  ## ¿Qué es una Tienda?
  Una tienda es una entidad dentro de tu agencia que puede representar:
  - Una sucursal física
  - Un departamento específico
  - Un canal de venta (online, presencial)
  - Una línea de productos
  - Cualquier división organizacional de tu negocio
  
  ## Funcionalidades Principales
  
  ### 1. Crear una Nueva Tienda
  
  #### Paso a Paso
  1. **Acceso al módulo**: Navega a **Configuración > Tiendas**
  2. **Iniciar creación**: Haz clic en el botón **"Crear Tienda"**
  3. **Completar información básica**:
  
  #### Información Requerida
  - **Logo de la tienda**: Imagen representativa (formato JPG, PNG)
  - **Nombre de la tienda**: Denominación oficial
  - **Email de contacto**: Correo electrónico principal
  - **Teléfono**: Número de contacto directo
  - **Dirección completa**: Ubicación física
  - **Ciudad**: Ciudad donde opera
  - **Estado/Provincia**: División administrativa
  - **Código Postal**: Código postal de la ubicación
  - **País**: País de operación
  
  #### Configuración Avanzada
  - **Zona horaria**: Configuración de horario local
  - **Moneda**: Moneda de operación
  - **Idioma**: Idioma principal de la tienda
  - **Configuración fiscal**: Información tributaria específica
  
  ### 2. Gestión de Tiendas Existentes
  
  #### Panel de Control de Tiendas
  - **Vista general**: Lista de todas las tiendas activas
  - **Estadísticas rápidas**: Métricas clave por tienda
  - **Estado operativo**: Indicadores de funcionamiento
  - **Acciones rápidas**: Botones para operaciones comunes
  
  #### Funciones de Gestión
  - **Editar información**: Actualización de datos de la tienda
  - **Cambiar estado**: Activar/desactivar tiendas
  - **Duplicar configuración**: Crear tiendas similares rápidamente
  - **Eliminar tienda**: Proceso de eliminación segura
  
  ### 3. Configuración por Tienda
  
  #### Personalización
  - **Tema visual**: Colores y estilos específicos
  - **Configuración de productos**: Catálogo por tienda
  - **Precios diferenciados**: Estrategias de precios específicas
  - **Promociones locales**: Ofertas exclusivas por tienda
  
  #### Integración con Otros Módulos
  - **Inventario**: Asignación de productos por tienda
  - **Usuarios**: Permisos específicos por tienda
  - **Reportes**: Análisis segmentado por tienda
  - **POS**: Configuración de punto de venta
  
  ## Casos de Uso Comunes
  
  ### Múltiples Sucursales
  \`\`\`
  Ejemplo: Cadena de tiendas de ropa
  - Tienda Centro: Sucursal del centro de la ciudad
  - Tienda Norte: Sucursal zona norte
  - Tienda Online: Canal de ventas digitales
  \`\`\`
  
  ### Departamentos Especializados
  \`\`\`
  Ejemplo: Ferretería con departamentos
  - Herramientas: Departamento de herramientas
  - Materiales: Departamento de materiales de construcción
  - Jardinería: Departamento de productos para jardín
  \`\`\`
  
  ### Canales de Venta
  \`\`\`
  Ejemplo: Negocio omnicanal
  - Tienda Física: Ventas presenciales
  - E-commerce: Ventas online
  - WhatsApp: Ventas por redes sociales
  \`\`\`
  
  ## Mejores Prácticas
  
  ### Organización Eficiente
  1. **Nomenclatura clara**: Usa nombres descriptivos y consistentes
  2. **Categorización lógica**: Agrupa tiendas por criterios coherentes
  3. **Información completa**: Mantén todos los datos actualizados
  4. **Configuración estándar**: Establece plantillas para nuevas tiendas
  
  ### Gestión Operativa
  - **Monitoreo regular**: Revisa el rendimiento de cada tienda
  - **Actualización periódica**: Mantén la información actualizada
  - **Backup de configuración**: Respalda las configuraciones importantes
  - **Documentación**: Mantén registros de cambios y configuraciones
  
  ## Solución de Problemas
  
  ### Problemas Comunes
  - **Error al crear tienda**: Verificar campos obligatorios
  - **Problemas de permisos**: Revisar roles de usuario
  - **Sincronización de datos**: Verificar conexión de red
  - **Configuración incorrecta**: Validar parámetros de configuración
  
  ### Soporte Técnico
  Si encuentras problemas que no puedes resolver:
  1. Consulta la documentación técnica
  2. Contacta al equipo de soporte
  3. Revisa los logs del sistema
  4. Verifica la configuración de red
  
  > **💡 Consejo**: Planifica la estructura de tus tiendas antes de crearlas. Una buena organización inicial te ahorrará tiempo y esfuerzo en el futuro.`,
  
    areas: `# Manual de Usuario: Gestión de Áreas de Inventario
  
  ## ¿Qué es un Área?
  Un área es una ubicación física o lógica dentro del inventario donde se almacenan productos. Las áreas te permiten organizar tu inventario de manera eficiente y mantener un control preciso sobre la ubicación de cada producto.
  
  ## Tipos de Áreas
  
  ### Áreas Físicas
  - **Almacenes**: Espacios de almacenamiento principal
  - **Bodegas**: Áreas de almacenamiento secundario
  - **Estantes**: Ubicaciones específicas dentro de almacenes
  - **Zonas**: Divisiones por tipo de producto
  - **Refrigeración**: Áreas con control de temperatura
  
  ### Áreas Lógicas
  - **Cuarentena**: Productos en proceso de verificación
  - **Dañados**: Productos con defectos
  - **Devoluciones**: Productos devueltos por clientes
  - **Promociones**: Productos en oferta
  - **Reservados**: Productos apartados para clientes
  
  ## Funcionalidades Principales
  
  ### Creación de Áreas
  
  #### Proceso Paso a Paso
  1. **Acceder al módulo**: Navega a **Inventario > Áreas**
  2. **Nueva área**: Haz clic en **"Nueva Área"**
  3. **Completar formulario**:
     - **Nombre del Área**: Identificación única y descriptiva
     - **Descripción**: Detalles sobre el propósito del área
     - **Tienda asociada**: Seleccionar la tienda correspondiente
     - **Tipo de área**: Clasificación según su uso
     - **Capacidad**: Límite de productos o volumen
     - **Ubicación física**: Dirección o referencia espacial
  
  #### Configuración Avanzada
  - **Restricciones de acceso**: Control de permisos por usuario
  - **Condiciones especiales**: Temperatura, humedad, seguridad
  - **Alertas personalizadas**: Notificaciones específicas del área
  - **Integración con códigos QR**: Para identificación rápida
  
  ### Gestión Visual de Áreas
  
  #### Vista en Cuadrícula
  - **Representación gráfica**: Visualización espacial de las áreas
  - **Código de colores**: Estados y tipos de área diferenciados
  - **Información rápida**: Datos clave visibles al pasar el cursor
  - **Navegación intuitiva**: Acceso directo a cada área
  
  #### Vista de Tabla
  - **Lista detallada**: Información completa en formato tabular
  - **Filtros avanzados**: Búsqueda por múltiples criterios
  - **Ordenamiento**: Por nombre, capacidad, ocupación, etc.
  - **Acciones masivas**: Operaciones en múltiples áreas
  
  ### Estadísticas y Ocupación
  
  #### Métricas por Área
  - **Ocupación actual**: Porcentaje de capacidad utilizada
  - **Valor del inventario**: Valor total de productos en el área
  - **Número de productos**: Cantidad de SKUs diferentes
  - **Rotación**: Frecuencia de movimientos de entrada y salida
  - **Tiempo promedio**: Duración de permanencia de productos
  
  #### Análisis de Rendimiento
  - **Eficiencia de espacio**: Optimización del uso del área
  - **Costos operativos**: Gastos asociados al mantenimiento
  - **Productividad**: Movimientos procesados por período
  - **Indicadores de calidad**: Errores y discrepancias
  
  ## Editor Visual de Disposición
  
  ### Herramientas de Diseño
  - **Drag & Drop**: Arrastrar y soltar elementos
  - **Plantillas predefinidas**: Layouts comunes para diferentes tipos de negocio
  - **Personalización**: Ajuste de dimensiones y propiedades
  - **Vista 3D**: Representación tridimensional del espacio
  
  ### Elementos Configurables
  - **Estantes**: Diferentes tipos y tamaños
  - **Pasillos**: Rutas de acceso y circulación
  - **Zonas especiales**: Áreas con características específicas
  - **Equipamiento**: Montacargas, escaleras, equipos de seguridad
  
  ## Control de Capacidad
  
  ### Configuración de Límites
  - **Capacidad por volumen**: Metros cúbicos disponibles
  - **Capacidad por peso**: Kilogramos máximos soportados
  - **Capacidad por unidades**: Número máximo de productos
  - **Capacidad por valor**: Límite monetario del inventario
  
  ### Alertas de Capacidad
  - **Alerta temprana**: Notificación al 80% de capacidad
  - **Alerta crítica**: Notificación al 95% de capacidad
  - **Sobrecapacidad**: Alertas cuando se exceden los límites
  - **Recomendaciones**: Sugerencias de redistribución
  
  ## Movimientos entre Áreas
  
  ### Transferencias
  - **Transferencia simple**: Mover productos entre áreas
  - **Transferencia masiva**: Múltiples productos simultáneamente
  - **Transferencia programada**: Movimientos automáticos programados
  - **Transferencia condicional**: Basada en reglas predefinidas
  
  ### Trazabilidad
  - **Historial completo**: Registro de todos los movimientos
  - **Responsables**: Identificación de usuarios que realizaron movimientos
  - **Motivos**: Razones documentadas para cada transferencia
  - **Validaciones**: Confirmaciones y aprobaciones requeridas
  
  ## Integración con Otros Módulos
  
  ### Inventario
  - **Asignación automática**: Productos se asignan a áreas según reglas
  - **Conteos por área**: Inventarios físicos segmentados
  - **Reportes específicos**: Análisis por área individual
  
  ### Ventas y POS
  - **Picking inteligente**: Sugerencias de ubicación para recolección
  - **Reservas por área**: Apartado de productos en áreas específicas
  - **Disponibilidad en tiempo real**: Stock actualizado por ubicación
  
  ### Reportes
  - **Análisis comparativo**: Rendimiento entre diferentes áreas
  - **Tendencias de ocupación**: Evolución del uso del espacio
  - **Optimización de layout**: Recomendaciones de mejora
  
  ## Mejores Prácticas
  
  ### Organización Eficiente
  1. **Clasificación lógica**: Agrupa productos similares en la misma área
  2. **Rotación ABC**: Productos de alta rotación en áreas de fácil acceso
  3. **Señalización clara**: Identificación visible y comprensible
  4. **Mantenimiento regular**: Limpieza y organización constante
  
  ### Optimización del Espacio
  - **Análisis de rotación**: Ubicar productos según frecuencia de movimiento
  - **Aprovechamiento vertical**: Usar toda la altura disponible
  - **Zonas de picking**: Áreas optimizadas para recolección rápida
  - **Flexibilidad**: Diseño adaptable a cambios en el inventario
  
  > **📊 Dato importante**: Una buena organización de áreas puede mejorar la eficiencia operativa hasta en un 30% y reducir significativamente los errores de picking.
  
  ### Seguridad y Cumplimiento
  - **Normativas aplicables**: Cumplimiento de regulaciones locales
  - **Seguridad industrial**: Medidas de prevención de accidentes
  - **Control de acceso**: Restricciones según tipo de producto
  - **Documentación**: Registros para auditorías y inspecciones`,
  
    proveedores: `# Manual de Usuario: Gestión de Proveedores
  
  ## ¿Qué es un Proveedor?
  Un proveedor es una entidad o persona que suministra productos o servicios a tu agencia. La gestión eficiente de proveedores es fundamental para mantener un inventario adecuado y establecer relaciones comerciales sólidas.
  
  ## Importancia de la Gestión de Proveedores
  
  ### Beneficios Clave
  - **Continuidad del negocio**: Asegurar el suministro constante de productos
  - **Optimización de costos**: Negociación de mejores precios y condiciones
  - **Calidad garantizada**: Selección de proveedores confiables
  - **Diversificación de riesgo**: Múltiples fuentes de suministro
  - **Innovación**: Acceso a nuevos productos y tecnologías
  
  ## Funcionalidades Principales
  
  ### Crear un Nuevo Proveedor
  
  #### Información Básica
  1. **Acceso al módulo**: Navega a **Inventario > Proveedores**
  2. **Nuevo proveedor**: Haz clic en **"Nuevo Proveedor"**
  3. **Datos principales**:
     - **Nombre del Proveedor**: Razón social o nombre comercial
     - **Tienda asociada**: Seleccionar la tienda correspondiente
     - **Tipo de proveedor**: Clasificación según el tipo de suministro
     - **Estado**: Activo, inactivo, en evaluación
  
  #### Información de Contacto
  - **Persona de Contacto**: Nombre del representante principal
  - **Correo Electrónico**: Email principal para comunicaciones
  - **Teléfono Principal**: Número de contacto directo
  - **Teléfono Alternativo**: Número secundario de contacto
  - **Sitio Web**: URL del sitio web corporativo
  
  #### Dirección y Ubicación
  - **Dirección Completa**: Dirección física del proveedor
  - **Ciudad**: Ciudad donde se ubica
  - **Estado/Provincia**: División administrativa
  - **Código Postal**: Código postal de la ubicación
  - **País**: País de origen del proveedor
  
  ### Información Comercial
  
  #### Datos Fiscales
  - **Número de Identificación Fiscal**: RUT, NIT, o equivalente
  - **Régimen Tributario**: Clasificación fiscal del proveedor
  - **Responsabilidades Tributarias**: IVA, retenciones, etc.
  - **Certificaciones**: Documentos de habilitación comercial
  
  #### Condiciones Comerciales
  - **Términos de Pago**: Condiciones de pago acordadas
  - **Descuentos**: Descuentos por volumen o pronto pago
  - **Tiempo de Entrega**: Plazos estándar de entrega
  - **Monto Mínimo de Pedido**: Valor mínimo para realizar pedidos
  - **Garantías**: Políticas de garantía y devoluciones
  
  ### Gestión de Proveedores
  
  #### Listado y Filtros
  - **Vista completa**: Lista de todos los proveedores registrados
  - **Filtros avanzados**: Por estado, tipo, ciudad, etc.
  - **Búsqueda rápida**: Por nombre o número de identificación
  - **Ordenamiento**: Por diferentes criterios (nombre, fecha, etc.)
  
  #### Estadísticas Rápidas
  - **Total de proveedores**: Número total registrado
  - **Proveedores activos**: Cantidad de proveedores en operación
  - **Nuevos este mes**: Proveedores registrados recientemente
  - **Valor de compras**: Monto total de compras por período
  
  ### Evaluación y Calificación
  
  #### Criterios de Evaluación
  - **Calidad de productos**: Evaluación de la calidad suministrada
  - **Cumplimiento de entregas**: Puntualidad en las entregas
  - **Servicio al cliente**: Calidad de atención y soporte
  - **Competitividad de precios**: Relación precio-calidad
  - **Estabilidad financiera**: Solidez económica del proveedor
  
  #### Sistema de Calificación
  - **Escala de puntuación**: Sistema de 1 a 5 estrellas
  - **Comentarios**: Observaciones detalladas sobre el desempeño
  - **Historial de evaluaciones**: Registro de evaluaciones anteriores
  - **Alertas de rendimiento**: Notificaciones sobre proveedores problemáticos
  
  ## Gestión de Compras
  
  ### Proceso de Compra
  1. **Solicitud de cotización**: Envío de requerimientos
  2. **Evaluación de ofertas**: Comparación de propuestas
  3. **Generación de orden**: Creación de orden de compra
  4. **Seguimiento**: Monitoreo del estado del pedido
  5. **Recepción**: Validación de productos recibidos
  6. **Pago**: Procesamiento de facturas y pagos
  
  ### Órdenes de Compra
  - **Creación automática**: Basada en puntos de reorden
  - **Creación manual**: Pedidos específicos según necesidad
  - **Plantillas**: Órdenes recurrentes predefinidas
  - **Aprobaciones**: Flujo de aprobación según montos
  
  ### Historial de Compras
  - **Registro completo**: Todas las transacciones con cada proveedor
  - **Análisis de tendencias**: Patrones de compra y consumo
  - **Comparación de precios**: Evolución de precios en el tiempo
  - **Productos más comprados**: Ranking de productos por proveedor
  
  ## Comunicación y Documentos
  
  ### Gestión de Comunicaciones
  - **Historial de contactos**: Registro de todas las comunicaciones
  - **Recordatorios**: Alertas para seguimiento de pendientes
  - **Notas importantes**: Información relevante sobre el proveedor
  - **Archivos adjuntos**: Documentos relacionados con el proveedor
  
  ### Documentación
  - **Contratos**: Acuerdos comerciales vigentes
  - **Certificados**: Documentos de calidad y habilitación
  - **Catálogos**: Listas de productos y precios
  - **Facturas**: Historial de facturación
  - **Correspondencia**: Emails y comunicaciones oficiales
  
  ## Análisis y Reportes
  
  ### Reportes de Proveedores
  - **Desempeño por proveedor**: Métricas individuales de rendimiento
  - **Comparativo de proveedores**: Análisis comparativo entre proveedores
  - **Análisis de costos**: Evolución de precios y costos
  - **Cumplimiento de entregas**: Puntualidad y confiabilidad
  - **Calidad de productos**: Indicadores de calidad recibida
  
  ### Indicadores Clave (KPIs)
  - **Tiempo promedio de entrega**: Días entre pedido y recepción
  - **Porcentaje de entregas a tiempo**: Cumplimiento de plazos
  - **Tasa de productos defectuosos**: Calidad de productos recibidos
  - **Variación de precios**: Estabilidad de precios en el tiempo
  - **Rotación de proveedores**: Frecuencia de cambio de proveedores
  
  ## Mejores Prácticas
  
  ### Selección de Proveedores
  1. **Evaluación integral**: Considerar todos los aspectos, no solo el precio
  2. **Referencias comerciales**: Verificar experiencia con otros clientes
  3. **Visitas a instalaciones**: Conocer las operaciones del proveedor
  4. **Pruebas piloto**: Realizar compras de prueba antes de comprometerse
  5. **Diversificación**: Mantener múltiples proveedores para productos críticos
  
  ### Gestión de Relaciones
  - **Comunicación regular**: Mantener contacto frecuente y constructivo
  - **Pagos puntuales**: Cumplir con los términos de pago acordados
  - **Feedback constructivo**: Proporcionar retroalimentación sobre el desempeño
  - **Desarrollo conjunto**: Trabajar en mejoras y nuevos productos
  - **Reconocimiento**: Valorar y reconocer el buen desempeño
  
  ### Optimización de Costos
  - **Negociación estratégica**: Buscar mejores condiciones comerciales
  - **Compras consolidadas**: Aprovechar economías de escala
  - **Análisis de TCO**: Considerar el costo total de propiedad
  - **Revisión periódica**: Evaluar regularmente las condiciones comerciales
  - **Benchmarking**: Comparar con el mercado regularmente
  
  > **💼 Consejo profesional**: Una buena relación con los proveedores es una inversión a largo plazo. Trata a tus proveedores como socios estratégicos, no solo como vendedores.
  
  ## Solución de Problemas Comunes
  
  ### Problemas de Calidad
  - **Protocolo de reclamos**: Proceso estructurado para reportar problemas
  - **Devoluciones**: Procedimiento para productos defectuosos
  - **Planes de mejora**: Trabajo conjunto para resolver problemas recurrentes
  - **Auditorías**: Evaluaciones periódicas de procesos de calidad
  
  ### Problemas de Entrega
  - **Seguimiento proactivo**: Monitoreo constante de pedidos en tránsito
  - **Planes de contingencia**: Alternativas para entregas críticas
  - **Comunicación temprana**: Notificación inmediata de retrasos
  - **Penalizaciones**: Consecuencias por incumplimientos reiterados
  
  ### Problemas Financieros
  - **Evaluación crediticia**: Monitoreo de la salud financiera del proveedor
  - **Términos flexibles**: Adaptación de condiciones según circunstancias
  - **Garantías**: Respaldos para transacciones de alto valor
  - **Planes de pago**: Alternativas para situaciones especiales`,
  
    configuracion: `# Módulo de Configuraciones
  
  ## Descripción General
  El módulo de configuraciones proporciona una interfaz centralizada para gestionar todos los aspectos de configuración del sistema. Permite a los usuarios administrar la información de la empresa, contactos, punto de venta, usuarios, WhatsApp y configuración DIAN.
  
  ## Características Principales
  
  ### 1. Configuración General
  
  #### Información Básica de la Agencia
  - **Datos corporativos**: Nombre, logo, descripción de la empresa
  - **Información de contacto**: Dirección, teléfonos, emails principales
  - **Configuración regional**: Zona horaria, idioma, moneda
  - **Preferencias del sistema**: Tema, notificaciones, formato de fecha
  
  #### Gestión de Subcuentas
  - **Creación de subcuentas**: Configuración de tiendas o departamentos
  - **Asignación de permisos**: Control de acceso por subcuenta
  - **Configuración heredada**: Parámetros que se propagan automáticamente
  - **Personalización individual**: Configuraciones específicas por subcuenta
  
  ### 2. Configuración de Empresa
  
  #### Información Fiscal y Legal
  - **Datos tributarios**: NIT, régimen fiscal, responsabilidades tributarias
  - **Información legal**: Razón social, representante legal, constitución
  - **Certificados digitales**: Gestión de certificados para facturación electrónica
  - **Resoluciones DIAN**: Numeración autorizada para facturación
  
  #### Configuración de Marca
  - **Identidad corporativa**: Logo, colores corporativos, tipografías
  - **Plantillas de documentos**: Facturas, cotizaciones, reportes
  - **Personalización de interfaces**: Temas y estilos personalizados
  - **Marca blanca**: Configuración para agencias white-label
  
  #### Gestión de Sucursales
  - **Registro de sucursales**: Información de cada punto de venta
  - **Configuración específica**: Parámetros únicos por sucursal
  - **Coordinación central**: Sincronización de configuraciones
  - **Reportes consolidados**: Información unificada de todas las sucursales
  
  ### 3. Configuración de Contacto
  
  #### Formulario de Contacto
  - **Campos personalizables**: Definición de información requerida
  - **Validaciones**: Reglas de validación para datos ingresados
  - **Notificaciones**: Alertas automáticas para nuevos contactos
  - **Integración CRM**: Conexión con sistema de gestión de clientes
  
  #### Información de Soporte
  - **Canales de atención**: Teléfono, email, chat, WhatsApp
  - **Horarios de atención**: Disponibilidad por canal y día
  - **Escalamiento**: Procedimientos para casos complejos
  - **Base de conocimiento**: Enlaces a documentación y tutoriales
  
  #### Gestión de Planes Personalizados
  - **Configuración de planes**: Definición de características y precios
  - **Personalización**: Adaptación según necesidades del cliente
  - **Facturación**: Integración con sistema de facturación
  - **Seguimiento**: Monitoreo de uso y renovaciones
  
  ### 4. Configuración POS (Punto de Venta)
  
  #### Configuración General del POS
  - **Interfaz de usuario**: Personalización de la pantalla de venta
  - **Flujo de trabajo**: Configuración del proceso de venta
  - **Integración con inventario**: Sincronización en tiempo real
  - **Configuración de impresoras**: Tickets, facturas, códigos de barras
  
  #### Gestión de Recibos
  - **Plantillas de recibos**: Diseño y contenido de tickets de venta
  - **Información legal**: Datos fiscales requeridos en recibos
  - **Promociones**: Mensajes promocionales en tickets
  - **Códigos QR**: Integración para pagos digitales o seguimiento
  
  #### Métodos de Pago
  - **Configuración de métodos**: Efectivo, tarjetas, transferencias, digitales
  - **Integración con pasarelas**: Conexión con procesadores de pago
  - **Comisiones**: Configuración de costos por método de pago
  - **Reconciliación**: Herramientas para cuadre de caja
  
  #### Control de Inventario en POS
  - **Actualización automática**: Descuento de stock en tiempo real
  - **Alertas de stock**: Notificaciones de productos agotados
  - **Reservas**: Apartado de productos durante la venta
  - **Devoluciones**: Proceso de devolución y reintegro al inventario
  
  ### 5. Gestión de Usuarios y Permisos
  
  #### Administración de Usuarios
  - **Creación de usuarios**: Registro de nuevos usuarios del sistema
  - **Información personal**: Datos de contacto y perfil profesional
  - **Credenciales**: Gestión de usuarios y contraseñas
  - **Estado de cuenta**: Activación, suspensión, eliminación de usuarios
  
  #### Asignación de Roles
  - **Roles predefinidos**: Administrador, vendedor, supervisor, etc.
  - **Roles personalizados**: Creación de roles específicos
  - **Jerarquías**: Estructura organizacional y reportes
  - **Herencia de permisos**: Propagación de permisos por jerarquía
  
  #### Control de Accesos
  - **Permisos granulares**: Control detallado por funcionalidad
  - **Restricciones por módulo**: Acceso limitado a secciones específicas
  - **Horarios de acceso**: Restricciones temporales de uso
  - **Ubicación**: Control de acceso por ubicación geográfica
  
  #### Seguimiento de Actividad
  - **Logs de usuario**: Registro de actividades por usuario
  - **Auditoría**: Seguimiento de cambios críticos
  - **Reportes de uso**: Estadísticas de utilización del sistema
  - **Alertas de seguridad**: Notificaciones de actividades sospechosas
  
  ### 6. Configuración WhatsApp
  
  #### Integración con WhatsApp Business
  - **Configuración de cuenta**: Vinculación con WhatsApp Business
  - **Verificación**: Proceso de verificación de número comercial
  - **Perfil comercial**: Configuración de información de la empresa
  - **Catálogo de productos**: Sincronización con inventario
  
  #### Configuración de API
  - **Tokens de acceso**: Gestión de credenciales de API
  - **Webhooks**: Configuración de endpoints para recibir mensajes
  - **Rate limiting**: Configuración de límites de envío
  - **Sandbox**: Ambiente de pruebas para desarrollo
  
  #### Gestión de Webhooks
  - **Configuración de endpoints**: URLs para recibir notificaciones
  - **Eventos suscritos**: Tipos de eventos a recibir
  - **Validación**: Verificación de integridad de mensajes
  - **Logs**: Registro de webhooks recibidos y procesados
  
  #### Automatización de Mensajes
  - **Mensajes de bienvenida**: Respuestas automáticas iniciales
  - **Respuestas rápidas**: Plantillas para consultas frecuentes
  - **Flujos conversacionales**: Chatbots para atención automatizada
  - **Escalamiento**: Transferencia a agentes humanos
  
  ### 7. Configuración DIAN
  
  #### Configuración Fiscal
  - **Información tributaria**: Datos fiscales de la empresa
  - **Régimen tributario**: Clasificación fiscal y responsabilidades
  - **Actividades económicas**: Códigos CIIU de actividades
  - **Obligaciones**: Configuración de obligaciones tributarias
  
  #### Gestión de Certificados Digitales
  - **Instalación de certificados**: Certificados de firma digital
  - **Renovación**: Proceso de renovación de certificados
  - **Respaldo**: Copias de seguridad de certificados
  - **Validación**: Verificación de validez de certificados
  
  #### Resoluciones de Facturación
  - **Numeración autorizada**: Rangos de numeración DIAN
  - **Vigencia**: Fechas de vigencia de resoluciones
  - **Prefijos**: Configuración de prefijos de facturación
  - **Consecutivos**: Control de numeración consecutiva
  
  #### Ambiente de Pruebas
  - **Configuración de pruebas**: Ambiente de testing DIAN
  - **Certificados de prueba**: Certificados para ambiente de pruebas
  - **Validación**: Pruebas de conectividad y funcionamiento
  - **Migración**: Proceso de paso a producción
  
  #### Validación de Conexión
  - **Test de conectividad**: Verificación de conexión con DIAN
  - **Validación de certificados**: Verificación de certificados digitales
  - **Pruebas de envío**: Envío de documentos de prueba
  - **Monitoreo**: Supervisión continua de la conexión
  
  ## Flujo de Configuración Inicial
  
  ### 1. Configuración Básica
  \`\`\`
  1. Información de la empresa
  2. Configuración regional
  3. Creación de usuario administrador
  4. Configuración de primera tienda
  \`\`\`
  
  ### 2. Configuración Fiscal
  \`\`\`
  1. Datos tributarios
  2. Instalación de certificados
  3. Configuración de resoluciones
  4. Pruebas de facturación electrónica
  \`\`\`
  
  ### 3. Configuración Operativa
  \`\`\`
  1. Configuración de POS
  2. Métodos de pago
  3. Usuarios y permisos
  4. Integración con WhatsApp
  \`\`\`
  
  ## Mejores Prácticas
  
  ### Seguridad
  - **Contraseñas seguras**: Políticas de contraseñas robustas
  - **Autenticación de dos factores**: Seguridad adicional para administradores
  - **Respaldos regulares**: Copias de seguridad de configuraciones
  - **Auditoría regular**: Revisión peri��dica de permisos y accesos
  
  ### Optimización
  - **Configuración por fases**: Implementación gradual de funcionalidades
  - **Documentación**: Registro de todas las configuraciones realizadas
  - **Capacitación**: Entrenamiento de usuarios en nuevas configuraciones
  - **Revisión periódica**: Actualización regular de configuraciones
  
  > **⚙️ Importante**: La configuración correcta del sistema es fundamental para su funcionamiento óptimo. Dedica tiempo a entender cada opción y su impacto en la operación diaria.
  
  ## Solución de Problemas
  
  ### Problemas Comunes
  - **Error de conexión DIAN**: Verificar certificados y conectividad
  - **Problemas de impresión**: Revisar configuración de impresoras
  - **Errores de permisos**: Validar roles y permisos de usuarios
  - **Fallos en integración WhatsApp**: Comprobar tokens y webhooks
  
  ### Soporte Técnico
  Si encuentras problemas que no puedes resolver:
  1. Consulta la documentación técnica
  2. Contacta al equipo de soporte
  3. Proporciona detalles específicos del problema
  4. Sigue las recomendaciones del equipo técnico`,
  
    clientes: `# Módulo de Clientes y CRM
  
  ## Descripción General
  El módulo de Clientes y CRM proporciona una solución completa para la gestión de clientes, oportunidades de venta y comunicación. Este módulo integra funcionalidades de directorio de clientes, CRM y gestión de PQRs en una interfaz unificada.
  
  ## Características Principales
  
  ### 1. Directorio de Clientes
  
  #### Gestión de Información
  - **Datos básicos del cliente**:
    - Nombre completo o razón social
    - Tipo de identificación (NIT, CC, CE, etc.)
    - Número de identificación
    - Tipo de cliente (persona natural, empresa)
    - Clasificación (VIP, regular, ocasional)
    - Fecha de registro
  
  - **Información de contacto**:
    - Dirección principal y sucursales
    - Teléfonos (fijo, móvil, extensiones)
    - Correos electrónicos
    - Redes sociales
    - Sitio web
    - Persona de contacto principal
  
  - **Historial de compras**:
    - Listado cronológico de transacciones
    - Productos adquiridos
    - Montos y formas de pago
    - Descuentos aplicados
    - Vendedor asignado
    - Notas de venta
  
  - **Estado de cuenta**:
    - Saldo actual
    - Facturas pendientes
    - Historial de pagos
    - Límite de crédito
    - Condiciones de pago
    - Días de cartera
  
  - **Documentos asociados**:
    - Contratos
    - Cotizaciones
    - Facturas
    - Recibos de pago
    - Certificados
    - Correspondencia
  
  #### Funcionalidades
  
  - **Creación de nuevos clientes**:
    - Formulario completo de registro
    - Validación de datos
    - Detección de duplicados
    - Campos personalizados
    - Categorización automática
  
  - **Edición de información**:
    - Actualización de datos básicos
    - Modificación de contactos
    - Ajuste de clasificación
    - Cambio de estado
    - Historial de cambios
  
  - **Búsqueda avanzada**:
    - Por nombre o razón social
    - Por número de identificación
    - Por ubicación geográfica
    - Por volumen de compras
    - Por fecha de última compra
    - Por productos adquiridos
  
  - **Filtros por categoría**:
    - Estado del cliente (activo, inactivo)
    - Tipo de cliente
    - Clasificación
    - Vendedor asignado
    - Ubicación
    - Volumen de negocio
  
  - **Exportación de datos**:
    - Formatos disponibles (Excel, CSV, PDF)
    - Selección de campos a exportar
    - Filtros pre-exportación
    - Programación de exportaciones periódicas
    - Envío automático por correo
  
  ### 2. CRM (Customer Relationship Management)
  
  #### Gestión de Oportunidades
  
  - **Creación de oportunidades**:
    - Cliente asociado
    - Producto o servicio de interés
    - Origen de la oportunidad
    - Fecha de creación
    - Fecha estimada de cierre
    - Responsable de seguimiento
  
  - **Seguimiento de etapas**:
    - Prospecto
    - Contacto inicial
    - Presentación
    - Negociación
    - Propuesta
    - Cierre (ganado/perdido)
    - Seguimiento post-venta
  
  - **Valoración de oportunidades**:
    - Monto estimado
    - Productos/servicios incluidos
    - Descuentos potenciales
    - Costos asociados
    - Margen proyectado
    - ROI esperado
  
  - **Probabilidad de cierre**:
    - Porcentaje de probabilidad
    - Factores de influencia
    - Barreras identificadas
    - Competidores
    - Ventajas competitivas
    - Estrategias de cierre
  
  - **Asignación de responsables**:
    - Vendedor principal
    - Equipo de apoyo
    - Supervisor
    - Especialistas por producto
    - Calendario de seguimiento
    - Alertas de actividades
  
  #### Embudo de Ventas
  
  - **Visualización por etapas**:
    - Representación gráfica del embudo
    - Distribución de oportunidades
    - Comparación con períodos anteriores
    - Proyección de resultados
    - Identificación de cuellos de botella
  
  - **Métricas de conversión**:
    - Tasa de conversión por etapa
    - Tiempo promedio en cada etapa
    - Efectividad por vendedor
    - Efectividad por tipo de cliente
    - Efectividad por producto/servicio
    - Análisis de abandonos
  
  - **Valor potencial**:
    - Suma total de oportunidades
    - Valor ponderado por probabilidad
    - Distribución por etapas
    - Proyección de ingresos
    - Comparación con objetivos
    - Alertas de desviaciones
  
  - **Tiempo en cada etapa**:
    - Duración promedio del ciclo de venta
    - Tiempo por etapa
    - Identificación de demoras
    - Comparación con estándares
    - Alertas de estancamiento
    - Recomendaciones de acción
  
  - **Análisis de rendimiento**:
    - Comparación con períodos anteriores
    - Tendencias de conversión
    - Efectividad de campañas
    - Rendimiento por vendedor
    - Rendimiento por región
    - Factores de éxito y fracaso
  
  ### 3. Comunicaciones y PQR
  
  #### Gestión de Tickets
  
  - **Creación de tickets**:
    - Cliente asociado
    - Categoría del ticket
    - Descripción del caso
    - Archivos adjuntos
    - Canal de recepción
    - Fecha y hora de creación
  
  - **Asignación de prioridad**:
    - Crítica
    - Alta
    - Media
    - Baja
    - Factores automáticos de priorización
    - Escalamiento automático
  
  - **Categorización**:
    - Petición
    - Queja
    - Reclamo
    - Sugerencia
    - Felicitación
    - Soporte técnico
    - Información general
  
  - **Seguimiento de estado**:
    - Recibido
    - En proceso
    - Esperando información
    - Resuelto
    - Cerrado
    - Reabierto
    - Escalado
  
  - **Historial de interacciones**:
    - Registro cronológico de comunicaciones
    - Responsables de cada interacción
    - Tiempo de respuesta
    - Soluciones propuestas
    - Acuerdos alcanzados
    - Nivel de satisfacción
  
  #### Chat y Mensajería
  
  - **Comunicación en tiempo real**:
    - Chat integrado
    - Historial de conversaciones
    - Estado de conexión
    - Indicador de escritura
    - Transferencia entre agentes
    - Cierre y evaluación
  
  - **Adjuntos de archivos**:
    - Envío de documentos
    - Imágenes y capturas de pantalla
    - Videos explicativos
    - Presentaciones
    - Límites de tamaño
    - Previsualización
  
  - **Emojis y formatos**:
    - Expresiones emocionales
    - Formato de texto (negrita, cursiva)
    - Listas numeradas y con viñetas
    - Enlaces clickeables
    - Citas de mensajes anteriores
    - Código formateado
  
  - **Notificaciones**:
    - Alertas de nuevos mensajes
    - Menciones directas
    - Recordatorios de seguimiento
    - Notificaciones por email
    - Notificaciones push
    - Configuración de preferencias
  
  - **Historial de conversaciones**:
    - Búsqueda en conversaciones
    - Filtrado por fecha
    - Filtrado por agente
    - Exportación de conversaciones
    - Etiquetado de conversaciones
    - Análisis de sentimiento
  
  ## Integraciones
  
  ### Integración con Ventas
  - **Historial de compras**: Visualización completa de transacciones
  - **Recomendaciones**: Sugerencias basadas en compras anteriores
  - **Descuentos personalizados**: Ofertas específicas por cliente
  - **Carrito abandonado**: Recuperación de ventas no completadas
  - **Programas de fidelidad**: Puntos y beneficios por compras
  
  ### Integración con Marketing
  - **Segmentación**: Creación de grupos para campañas específicas
  - **Campañas personalizadas**: Marketing dirigido según perfil
  - **Análisis de efectividad**: Medición de respuesta a campañas
  - **Automatización**: Secuencias de marketing automatizadas
  - **Preferencias de comunicación**: Gestión de consentimientos
  
  ### Integración con Soporte
  - **Historial de casos**: Visualización de tickets anteriores
  - **Base de conocimiento**: Acceso a soluciones comunes
  - **Satisfacción del cliente**: Encuestas post-atención
  - **Tiempo de respuesta**: Métricas de atención
  - **Escalamiento**: Protocolos de derivación a especialistas
  
  ## Reportes y Análisis
  
  ### Reportes de Clientes
  - **Distribución demográfica**: Análisis por ubicación, edad, etc.
  - **Valor del tiempo de vida**: Proyección de valor por cliente
  - **Frecuencia de compra**: Patrones de adquisición
  - **Productos preferidos**: Análisis de preferencias
  - **Canales de contacto**: Preferencias de comunicación
  
  ### Reportes de Ventas
  - **Conversión de oportunidades**: Efectividad del proceso de venta
  - **Tiempo de ciclo**: Duración del proceso de venta
  - **Razones de pérdida**: Análisis de oportunidades perdidas
  - **Proyección de ingresos**: Estimación basada en pipeline
  - **Rendimiento por vendedor**: Comparativa de efectividad
  
  ### Reportes de Atención
  - **Tiempo de resolución**: Eficiencia en la atención de casos
  - **Satisfacción del cliente**: Resultados de encuestas
  - **Volumen de tickets**: Distribución por categorías
  - **Eficiencia de agentes**: Rendimiento del equipo de soporte
  - **Problemas recurrentes**: Identificación de patrones
  
  ## Mejores Prácticas
  
  ### Gestión de Clientes
  1. **Datos actualizados**: Mantener información de contacto al día
  2. **Segmentación efectiva**: Clasificar clientes según valor y potencial
  3. **Comunicación regular**: Mantener contacto periódico
  4. **Historial detallado**: Registrar todas las interacciones
  5. **Personalización**: Adaptar la comunicación a cada perfil
  
  ### Gestión de Oportunidades
  - **Calificación adecuada**: Evaluar correctamente el potencial
  - **Seguimiento oportuno**: Respetar los tiempos de contacto
  - **Documentación completa**: Registrar todos los detalles
  - **Análisis de pérdidas**: Aprender de las oportunidades no ganadas
  - **Estrategias personalizadas**: Adaptar el enfoque a cada cliente
  
  ### Atención al Cliente
  - **Respuesta rápida**: Atender consultas en tiempo óptimo
  - **Empatía**: Entender la situación desde la perspectiva del cliente
  - **Soluciones efectivas**: Resolver el problema de raíz
  - **Seguimiento posterior**: Verificar satisfacción post-resolución
  - **Mejora continua**: Aprender de cada interacción
  
  > **🔑 Consejo clave**: El CRM es tan bueno como la información que contiene. Fomenta una cultura de registro detallado de todas las interacciones con clientes.
  
  ## Configuración Inicial
  
  ### Configuración de Clientes
  \`\`\`
  1. Definir campos obligatorios
  2. Crear categorías de clientes
  3. Establecer reglas de duplicidad
  4. Configurar campos personalizados
  5. Definir procesos de aprobación
  \`\`\`
  
  ### Configuración de CRM
  \`\`\`
  1. Diseñar etapas del embudo de ventas
  2. Establecer criterios de valoración
  3. Configurar reglas de asignación
  4. Definir alertas y recordatorios
  5. Crear plantillas de seguimiento
  \`\`\`
  
  ### Configuración de PQR
  \`\`\`
  1. Definir categorías de tickets
  2. Establecer SLAs por tipo de caso
  3. Configurar flujos de escalamiento
  4. Crear respuestas predefinidas
  5. Diseñar encuestas de satisfacción
  \`\`\`
  
  ## Solución de Problemas Comunes
  
  ### Problemas de Datos
  - **Duplicidad de clientes**: Utilizar herramientas de detección y fusión
  - **Información desactualizada**: Implementar procesos de verificación periódica
  - **Datos incompletos**: Establecer campos obligatorios y validaciones
  - **Inconsistencias**: Realizar auditorías regulares de información
  
  ### Problemas de Proceso
  - **Oportunidades estancadas**: Configurar alertas de inactividad
  - **Seguimiento inconsistente**: Implementar flujos de trabajo automatizados
  - **Asignación incorrecta**: Revisar reglas de distribución
  - **Pérdida de oportunidades**: Analizar causas raíz y ajustar procesos
  
  ### Problemas de Atención
  - **Tiempos de respuesta largos**: Revisar carga de trabajo y recursos
  - **Resolución inefectiva**: Mejorar capacitación y base de conocimiento
  - **Insatisfacción del cliente**: Analizar feedback y ajustar protocolos
  - **Reapertura de casos**: Identificar causas de resoluciones incompletas`,
  
    contactos: `# Módulo de Contactos y Directorio de Equipo
  
  ## Descripción General
  El módulo de Contactos y Directorio de Equipo proporciona una solución completa para la gestión de información personal y laboral de los miembros del equipo. Este módulo centraliza toda la información relevante de los empleados y facilita su administración.
  
  ## Características Principales
  
  ### 1. Directorio de Equipo
  
  #### Vista General
  - **Lista completa de miembros del equipo**:
    - Visualización en formato de tarjetas o tabla
    - Foto de perfil y datos básicos
    - Indicador de estado (activo, ausente, vacaciones)
    - Acceso rápido a información de contacto
    - Filtros y búsqueda avanzada
  
  - **Información personal y laboral**:
    - Nombre completo
    - Cargo actual
    - Departamento
    - Ubicación/Sucursal
    - Fecha de ingreso
    - Contacto directo
  
  - **Estado de afiliación**:
    - Tipo de contrato
    - Fecha de inicio
    - Fecha de finalización (si aplica)
    - Estado de documentación
    - Cumplimiento de requisitos
    - Historial de renovaciones
  
  - **Roles y permisos**:
    - Nivel de acceso al sistema
    - Módulos habilitados
    - Restricciones específicas
    - Historial de cambios de permisos
    - Certificaciones de seguridad
  
  - **Acciones rápidas**:
    - Llamada directa
    - Envío de email
    - Mensaje interno
    - Programación de reunión
    - Visualización de calendario
  
  #### Gestión de Usuarios
  
  - **Invitación de nuevos usuarios**:
    - Generación de invitaciones por email
    - Seguimiento de estado de invitación
    - Reenvío automático
    - Configuración de mensaje personalizado
    - Asignación inicial de permisos
  
  - **Edición de información**:
    - Actualización de datos personales
    - Modificación de información laboral
    - Cambio de estado
    - Gestión de documentos
    - Historial de cambios
  
  - **Actualización de roles**:
    - Promociones y cambios de cargo
    - Reasignación de departamento
    - Modificación de responsabilidades
    - Actualización de línea de reporte
    - Notificaciones automáticas
  
  - **Control de acceso**:
    - Activación/desactivación de usuarios
    - Restablecimiento de contraseñas
    - Bloqueo temporal
    - Auditoría de accesos
    - Verificación en dos pasos
  
  ### 2. Información Personal
  
  #### Datos Básicos
  - **Nombre completo**:
    - Nombres
    - Apellidos
    - Nombre preferido
    - Pronunciación (opcional)
  
  - **Fecha de nacimiento**:
    - Día, mes y año
    - Edad calculada automáticamente
    - Recordatorio de cumpleaños
    - Configuración de privacidad
  
  - **Género**:
    - Opciones inclusivas
    - Preferencia de pronombres
    - Configuración de privacidad
  
  - **Estado civil**:
    - Soltero/a
    - Casado/a
    - Unión libre
    - Divorciado/a
    - Viudo/a
    - Configuración de privacidad
  
  - **Foto de perfil**:
    - Carga de imagen
    - Recorte y ajuste
    - Historial de fotos
    - Opciones de visualización
  
  #### Información de Contacto
  
  - **Dirección física**:
    - Dirección completa
    - Ciudad
    - Estado/Provincia
    - Código postal
    - País
    - Mapa interactivo
  
  - **Número de teléfono**:
    - Teléfono móvil principal
    - Teléfono fijo
    - Extensión interna
    - WhatsApp (si es diferente)
    - Preferencias de contacto
  
  - **Correo electrónico**:
    - Email corporativo
    - Email personal (opcional)
    - Configuración de notificaciones
    - Preferencias de comunicación
  
  - **Información de emergencia**:
    - Contactos de emergencia
    - Relación con el contacto
    - Teléfonos de emergencia
    - Información médica relevante
    - Grupo sanguíneo
  
  ### 3. Información Laboral
  
  #### Datos del Empleo
  
  - **Cargo actual**:
    - Título oficial
    - Descripción breve
    - Nivel jerárquico
    - Responsabilidades principales
    - Habilidades requeridas
  
  - **Fecha de ingreso**:
    - Día de inicio
    - Antigüedad calculada
    - Historial de cargos anteriores
    - Períodos de prueba
    - Evaluaciones de desempeño
  
  - **Salario**:
    - Monto base
    - Moneda
    - Periodicidad
    - Historial de ajustes
    - Bonificaciones
    - Acceso restringido
  
  - **Jornada laboral**:
    - Tipo de jornada (completa, parcial)
    - Horario asignado
    - Días laborables
    - Horas semanales
    - Flexibilidad horaria
  
  - **Departamento**:
    - Área funcional
    - Ubicación física
    - Supervisor directo
    - Compañeros de equipo
    - Proyectos asignados
  
  #### Información de Seguridad Social
  
  - **Número de seguro social**:
    - Identificación oficial
    - Verificación de validez
    - Documentación asociada
    - Acceso restringido
  
  - **Afiliación**:
    - Entidad de salud
    - Fondo de pensiones
    - ARL (Riesgos laborales)
    - Caja de compensación
    - Fecha de afiliación
  
  - **Estado de cotización**:
    - Pagos al día
    - Historial de aportes
    - Novedades registradas
    - Incapacidades
    - Licencias
  
  - **Beneficios**:
    - Plan de salud
    - Seguro de vida
    - Fondo de empleados
    - Beneficios adicionales
    - Cobertura familiar
  
  ## Gestión de Documentos
  
  ### Documentos Personales
  - **Documento de identidad**:
    - Copia digital
    - Fecha de expedición
    - Fecha de vencimiento
    - Verificación de autenticidad
    - Alertas de renovación
  
  - **Hoja de vida**:
    - CV actualizado
    - Certificaciones
    - Referencias
    - Historial académico
    - Experiencia previa
  
  - **Certificados académicos**:
    - Títulos obtenidos
    - Cursos complementarios
    - Certificaciones profesionales
    - Validación de autenticidad
    - Fecha de obtención
  
  ### Documentos Laborales
  - **Contrato de trabajo**:
    - Versión digital firmada
    - Tipo de contrato
    - Cláusulas especiales
    - Adendas y modificaciones
    - Historial de renovaciones
  
  - **Evaluaciones de desempeño**:
    - Resultados periódicos
    - Objetivos cumplidos
    - Áreas de mejora
    - Plan de desarrollo
    - Retroalimentación
  
  - **Acuerdos de confidencialidad**:
    - NDA firmado
    - Alcance del acuerdo
    - Fecha de firma
    - Vigencia
    - Restricciones específicas
  
  ## Herramientas de Comunicación
  
  ### Directorio Interactivo
  - **Búsqueda avanzada**:
    - Por nombre
    - Por cargo
    - Por departamento
    - Por habilidades
    - Por ubicación
  
  - **Visualización personalizada**:
    - Vista de tarjetas
    - Vista de lista
    - Organigrama interactivo
    - Mapa de ubicaciones
    - Directorio telefónico
  
  - **Integración con herramientas**:
    - Llamadas directas
    - Videoconferencias
    - Calendario compartido
    - Chat interno
    - Email corporativo
  
  ### Comunicación Interna
  - **Mensajería instantánea**:
    - Chat individual
    - Grupos por departamento
    - Canales temáticos
    - Compartir archivos
    - Historial de conversaciones
  
  - **Anuncios y notificaciones**:
    - Comunicados oficiales
    - Recordatorios importantes
    - Celebraciones y eventos
    - Logros y reconocimientos
    - Configuración de preferencias
  
  ## Gestión de Permisos y Accesos
  
  ### Niveles de Acceso
  - **Administrador del sistema**:
    - Acceso completo
    - Gestión de usuarios
    - Configuración global
    - Auditoría de actividades
    - Gestión de permisos
  
  - **Gerente de RRHH**:
    - Acceso a información completa
    - Edición de datos sensibles
    - Gestión de documentos
    - Reportes avanzados
    - Evaluaciones de desempeño
  
  - **Supervisor**:
    - Acceso a información de su equipo
    - Solicitudes de cambios
    - Aprobaciones
    - Reportes básicos
    - Gestión de ausencias
  
  - **Usuario estándar**:
    - Acceso a su información personal
    - Directorio básico
    - Solicitudes de actualización
    - Carga de documentos propios
    - Comunicación interna
  
  ### Control de Visibilidad
  - **Información pública**:
    - Visible para todos los usuarios
    - Datos básicos de contacto
    - Cargo y departamento
    - Foto de perfil
    - Información profesional
  
  - **Información restringida**:
    - Datos personales sensibles
    - Información salarial
    - Documentos confidenciales
    - Evaluaciones de desempeño
    - Información médica
  
  ## Reportes y Análisis
  
  ### Reportes de Personal
  - **Distribución demográfica**:
    - Por edad
    - Por género
    - Por ubicación
    - Por antigüedad
    - Por nivel educativo
  
  - **Estructura organizacional**:
    - Distribución por departamentos
    - Niveles jerárquicos
    - Ratio supervisor/empleados
    - Vacantes actuales
    - Proyección de crecimiento
  
  - **Rotación de personal**:
    - Índice de rotación
    - Causas de salida
    - Duración promedio
    - Costos asociados
    - Tendencias temporales
  
  ### Análisis de Productividad
  - **Indicadores clave**:
    - Cumplimiento de objetivos
    - Horas trabajadas
    - Proyectos completados
    - Eficiencia por departamento
    - Comparativas históricas
  
  - **Desarrollo profesional**:
    - Promociones internas
    - Capacitaciones completadas
    - Certificaciones obtenidas
    - Plan de carrera
    - Potencial de crecimiento
  
  ## Mejores Prácticas
  
  ### Gestión de Información
  1. **Actualización regular**: Programar revisiones periódicas de datos
  2. **Verificación de datos**: Validar la información crítica
  3. **Privacidad**: Respetar la confidencialidad de datos sensibles
  4. **Respaldos**: Mantener copias de seguridad de la información
  5. **Documentación**: Registrar todos los cambios importantes
  
  ### Comunicación Efectiva
  - **Directorio actualizado**: Mantener información de contacto al día
  - **Canales claros**: Establecer vías oficiales de comunicación
  - **Accesibilidad**: Facilitar la localización de miembros del equipo
  - **Respeto de horarios**: Considerar jornadas laborales y zonas horarias
  - **Retroalimentación**: Solicitar opiniones sobre la efectividad de la comunicación
  
  ### Onboarding y Offboarding
  - **Proceso estructurado**: Pasos claros para nuevas incorporaciones
  - **Documentación completa**: Recopilación organizada de información
  - **Capacitación inicial**: Formación sobre uso del sistema
  - **Actualización de permisos**: Ajuste inmediato al cambiar roles
  - **Procedimiento de salida**: Protocolo para desvinculaciones
  
  > **👥 Consejo importante**: El directorio de equipo es más que una lista de contactos; es una herramienta estratégica para fomentar la colaboración y el sentido de pertenencia en la organización.
  
  ## Configuración Inicial
  
  ### Configuración del Directorio
  \`\`\`
  1. Definir campos obligatorios
  2. Establecer niveles de privacidad
  3. Configurar plantillas de perfiles
  4. Importar datos existentes
  5. Verificar información importada
  \`\`\`
  
  ### Configuración de Permisos
  \`\`\`
  1. Definir roles básicos
  2. Establecer permisos por rol
  3. Configurar excepciones
  4. Probar accesos
  5. Documentar estructura de permisos
  \`\`\`
  
  ## Solución de Problemas Comunes
  
  ### Problemas de Datos
  - **Información desactualizada**: Implementar recordatorios periódicos
  - **Duplicidad de perfiles**: Utilizar herramientas de detección y fusión
  - **Datos incompletos**: Establecer campos obligatorios mínimos
  - **Inconsistencias**: Realizar auditorías regulares de información
  
  ### Problemas de Acceso
  - **Permisos incorrectos**: Revisar matriz de roles y permisos
  - **Bloqueo de cuentas**: Procedimiento de recuperación de acceso
  - **Visualización inadecuada**: Verificar configuración de privacidad
  - **Sincronización**: Resolver problemas de actualización en tiempo real`,
  
    finanzas: `# Módulo de Finanzas y Facturación
  
  ## Descripción General
  El módulo de finanzas y facturación proporciona una solución completa para la gestión de facturas electrónicas, pagos y transacciones comerciales, cumpliendo con la normativa DIAN. Este módulo está diseñado para agencias y sus subcuentas, permitiendo un control centralizado de todas las operaciones financieras.
  
  ## Características Principales
  
  ### 1. Dashboard Financiero Unificado
  
  #### Vista General
  - **Estadísticas clave en tiempo real**:
    - Total de ingresos del día/semana/mes
    - Comparativa con períodos anteriores
    - Tendencias de facturación
    - Proyecciones financieras
    - Alertas de vencimientos
  
  - **Facturación del día**:
    - Número de facturas emitidas
    - Monto total facturado
    - Desglose por tipo de factura
    - Distribución por tienda/sucursal
    - Comparativa con días anteriores
  
  - **Facturas pendientes**:
    - Listado de facturas por cobrar
    - Clasificación por antigüedad
    - Alertas de vencimiento
    - Acciones de seguimiento
    - Recordatorios automáticos
  
  - **Pagos recibidos**:
    - Total de ingresos del día
    - Desglose por método de pago
    - Conciliación bancaria
    - Depósitos pendientes
    - Transacciones en proceso
  
  - **Documentos DIAN procesados**:
    - Facturas electrónicas emitidas
    - Estado de transmisión
    - Acuses de recibo
    - Documentos rechazados
    - Tiempo promedio de procesamiento
  
  #### Indicadores de Estado
  
  - **Estado de habilitación DIAN**:
    - Verificación de conexión
    - Validez de certificados
    - Estado del servicio
    - Resoluciones activas
    - Próximos vencimientos
  
  - **Estado de facturación electrónica**:
    - Documentos pendientes
    - Documentos procesados
    - Documentos con errores
    - Tiempo de respuesta
    - Disponibilidad del servicio
  
  - **Métricas de cumplimiento**:
    - Facturas emitidas a tiempo
    - Documentos correctamente formados
    - Tasa de rechazo
    - Tiempo promedio de emisión
    - Cumplimiento de requisitos legales
  
  ### 2. Gestión de Facturas
  
  #### Tipos de Factura
  
  - **Facturas Electrónicas (DIAN)**:
    - Generación automática
    - Firma digital
    - Transmisión a la DIAN
    - Validación en tiempo real
    - Representación gráfica
    - Notificación al cliente
  
  - **Facturas Físicas**:
    - Formato personalizable
    - Impresión directa
    - Numeración manual
    - Copias de seguridad
    - Registro en sistema
  
  - **Facturas Mixtas (Electrónicas + Físicas)**:
    - Emisión simultánea
    - Sincronización de numeración
    - Validación cruzada
    - Registro unificado
    - Trazabilidad completa
  
  #### Estados de Factura
  
  - **Pagada**:
    - Registro de pago completo
    - Fecha de pago
    - Método utilizado
    - Comprobante asociado
    - Conciliación automática
  
  - **Pendiente**:
    - Fecha de vencimiento
    - Días de crédito
    - Recordatorios programados
    - Opciones de pago
    - Seguimiento automático
  
  - **Vencida**:
    - Clasificación por antigüedad
    - Cálculo de intereses
    - Notificaciones automáticas
    - Opciones de refinanciación
    - Gestión de cobro
  
  - **Anulada**:
    - Motivo de anulación
    - Usuario responsable
    - Fecha de anulación
    - Documento de respaldo
    - Nota crédito asociada
  
  - **Borrador**:
    - Edición completa
    - Validación preliminar
    - Conversión a factura
    - Almacenamiento temporal
    - Plantillas personalizables
  
  ### 3. Gestión de Pagos
  
  #### Métodos de Pago
  
  - **Efectivo**:
    - Registro de denominaciones
    - Cálculo automático de cambio
    - Cierre de caja
    - Arqueo y conciliación
    - Gestión de fondos
  
  - **Tarjeta de Crédito**:
    - Integración con POS
    - Múltiples franquicias
    - Validación en tiempo real
    - Comisiones por tarjeta
    - Conciliación automática
  
  - **Tarjeta de Débito**:
    - Procesamiento inmediato
    - Verificación de fondos
    - Registro de autorización
    - Comisiones diferenciadas
    - Reportes específicos
  
  - **Transferencia Bancaria**:
    - Cuentas bancarias registradas
    - Verificación de depósitos
    - Conciliación manual/automática
    - Notificaciones de recepción
    - Comprobantes digitales
  
  - **Cheque**:
    - Registro de datos del cheque
    - Fecha de cobro
    - Banco emisor
    - Estado de cobro
    - Gestión de rechazos
  
  - **Pago en línea**:
    - Múltiples pasarelas
    - Confirmación inmediata
    - Enlaces de pago
    - Notificaciones automáticas
    - Historial de transacciones
  
  #### Procesamiento de Pagos
  
  - **Recepción de pagos**:
    - Registro en tiempo real
    - Aplicación a facturas
    - Pagos parciales
    - Excedentes y anticipos
    - Comprobantes automáticos
  
  - **Conciliación bancaria**:
    - Importación de extractos
    - Cruce automático
    - Identificación de diferencias
    - Ajustes contables
    - Reportes de conciliación
  
  - **Gestión de cartera**:
    - Antigüedad de saldos
    - Recordatorios automáticos
    - Acuerdos de pago
    - Intereses por mora
    - Reportes de cobranza
  
  ## Facturación Electrónica DIAN
  
  ### Configuración DIAN
  
  - **Certificado digital**:
    - Instalación y configuración
    - Validación de vigencia
    - Respaldo seguro
    - Renovación automática
    - Pruebas de funcionamiento
  
  - **Resolución de facturación**:
    - Registro de resoluciones
    - Control de numeración
    - Alertas de vencimiento
    - Renovación anticipada
    - Historial de resoluciones
  
  - **Representación gráfica**:
    - Diseño personalizable
    - Elementos obligatorios
    - Código QR/CUFE
    - Información adicional
    - Vista previa
  
  ### Proceso de Facturación Electrónica
  
  - **Generación de documentos**:
    - Creación en formato UBL
    - Aplicación de reglas DIAN
    - Cálculo automático de impuestos
    - Validación previa
    - Corrección de errores
  
  - **Firma digital**:
    - Proceso automático
    - Verificación de integridad
    - Sello de tiempo
    - Registro de eventos
    - Trazabilidad completa
  
  - **Transmisión a la DIAN**:
    - Envío en tiempo real
    - Reintentos automáticos
    - Confirmación de recepción
    - Gestión de errores
    - Registro de transacciones
  
  - **Notificación al cliente**:
    - Envío automático por email
    - Adjuntos en formato PDF/XML
    - Confirmación de entrega
    - Opciones de descarga
    - Portal de consulta
  
  ### Documentos Electrónicos
  
  - **Factura de venta**:
    - Factura nacional
    - Factura de exportación
    - Factura contingencia
    - Documentos equivalentes
    - Factura por computador
  
  - **Nota crédito**:
    - Devoluciones
    - Anulaciones
    - Descuentos posteriores
    - Correcciones
    - Referencias cruzadas
  
  - **Nota débito**:
    - Cargos adicionales
    - Intereses de mora
    - Ajustes positivos
    - Correcciones de valor
    - Referencias a facturas
  
  - **Documentos soporte**:
    - Recepción de servicios
    - Adquisiciones a no obligados
    - Importaciones
    - Gastos en el exterior
    - Documentación de respaldo
  
  ## Reportes Financieros
  
  ### Reportes de Ventas
  
  - **Ventas por período**:
    - Diario/Semanal/Mensual/Anual
    - Comparativas interanuales
    - Tendencias y estacionalidad
    - Proyecciones futuras
    - Análisis de desviaciones
  
  - **Ventas por categoría**:
    - Productos más vendidos
    - Categorías principales
    - Márgenes de contribución
    - Rotación de inventario
    - Rentabilidad por línea
  
  - **Ventas por cliente**:
    - Ranking de clientes
    - Frecuencia de compra
    - Ticket promedio
    - Historial de transacciones
    - Potencial de crecimiento
  
  - **Ventas por vendedor**:
    - Desempeño individual
    - Cumplimiento de metas
    - Comisiones generadas
    - Efectividad de cierre
    - Productos destacados
  
  ### Reportes de Cartera
  
  - **Antigüedad de cartera**:
    - Clasificación 0-30, 31-60, 61-90, >90 días
    - Tendencias de morosidad
    - Clientes críticos
    - Proyección de recuperación
    - Indicadores de gestión
  
  - **Gestión de cobro**:
    - Efectividad de acciones
    - Tiempo promedio de cobro
    - Acuerdos de pago
    - Seguimiento de compromisos
    - Historial de comunicaciones
  
  - **Flujo de caja proyectado**:
    - Ingresos esperados
    - Obligaciones pendientes
    - Saldo proyectado
    - Escenarios de sensibilidad
    - Alertas de liquidez
  
  ### Reportes Fiscales
  
  - **Libros oficiales**:
    - Libro de ventas
    - Libro de compras
    - Libro diario
    - Libro mayor
    - Auxiliares contables
  
  - **Informes tributarios**:
    - IVA generado y descontable
    - Retenciones practicadas
    - Retenciones que nos practicaron
    - Impuesto al consumo
    - Información exógena
  
  - **Informes para declaraciones**:
    - Ingresos gravados
    - Ingresos no gravados
    - Impuestos descontables
    - Bases de retención
    - Soportes documentales
  
  ## Integración con Otros Módulos
  
  ### Integración con Inventario
  
  - **Actualización automática**:
    - Descuento de stock al facturar
    - Reintegro en devoluciones
    - Valorización de inventario
    - Costo de ventas
    - Rotación de productos
  
  - **Alertas de inventario**:
    - Productos sin stock
    - Verificación previa a facturación
    - Reserva de productos
    - Pedidos pendientes
    - Sugerencias de reposición
  
  ### Integración con Clientes
  
  - **Información centralizada**:
    - Datos fiscales actualizados
    - Historial de compras
    - Estado de cuenta
    - Límite de crédito
    - Condiciones comerciales
  
  - **Gestión de crédito**:
    - Aprobación automática
    - Bloqueo por mora
    - Excepciones autorizadas
    - Historial crediticio
    - Garantías registradas
  
  ### Integración con Contabilidad
  
  - **Asientos automáticos**:
    - Generación en tiempo real
    - Configuración de cuentas
    - Distribución por centros de costo
    - Validación contable
    - Trazabilidad documental
  
  - **Cierre contable**:
    - Verificación de transacciones
    - Ajustes automáticos
    - Generación de informes
    - Bloqueo de períodos
    - Apertura de nuevo período
  
  ## Mejores Prácticas
  
  ### Facturación Eficiente
  
  1. **Emisión oportuna**: Facturar inmediatamente después de la venta
  2. **Verificación previa**: Validar datos del cliente antes de emitir
  3. **Documentación completa**: Incluir toda la información requerida
  4. **Seguimiento activo**: Monitorear el estado de cada factura
  5. **Conciliación regular**: Verificar pagos contra facturas emitidas
  
  ### Gestión de Cartera
  
  - **Política clara de crédito**: Establecer términos y condiciones
  - **Evaluación de clientes**: Analizar capacidad de pago
  - **Seguimiento proactivo**: Contactar antes del vencimiento
  - **Opciones de pago**: Facilitar múltiples canales
  - **Incentivos por pronto pago**: Ofrecer descuentos por pago anticipado
  
  ### Cumplimiento Normativo
  
  - **Actualización constante**: Seguir cambios en la normativa
  - **Respaldo de información**: Mantener copias de documentos electrónicos
  - **Validación periódica**: Verificar funcionamiento del sistema
  - **Auditorías internas**: Revisar procesos y documentación
  - **Capacitación**: Mantener al equipo actualizado en normativas
  
  > **💰 Consejo financiero**: La facturación oportuna y el seguimiento efectivo de pagos son fundamentales para mantener un flujo de caja saludable. Un día de retraso en la facturación puede significar varios días adicionales para recibir el pago.
  
  ## Configuración Inicial
  
  ### Configuración de Facturación
  \`\`\`
  1. Configurar datos fiscales de la empresa
  2. Instalar certificado digital
  3. Registrar resoluciones de facturación
  4. Diseñar plantillas de documentos
  5. Configurar numeración y series
  \`\`\`
  
  ### Configuración de Pagos
  \`\`\`
  1. Definir métodos de pago aceptados
  2. Configurar cuentas bancarias
  3. Establecer políticas de crédito
  4. Configurar recordatorios automáticos
  5. Definir proceso de conciliación
  \`\`\`
  
  ### Configuración Contable
  \`\`\`
  1. Definir plan de cuentas
  2. Configurar impuestos
  3. Establecer centros de costo
  4. Configurar asientos automáticos
  5. Definir períodos contables
  \`\`\`
  
  ## Solución de Problemas Comunes
  
  ### Problemas de Facturación Electrónica
  - **Rechazo de documentos**: Verificar formato y datos obligatorios
  - **Fallas de conexión**: Comprobar conectividad con DIAN
  - **Certificado vencido**: Renovar certificado digital
  - **Errores de numeración**: Verificar secuencia y resolución
  - **Notificaciones fallidas**: Revisar configuración de correo
  
  ### Problemas de Pagos
  - **Pagos no identificados**: Implementar referencias de pago
  - **Conciliación incorrecta**: Revisar criterios de cruce
  - **Diferencias en montos**: Verificar cargos bancarios
  - **Duplicidad de pagos**: Establecer controles de verificación
  - **Rechazos bancarios**: Validar información bancaria
  
  ### Problemas Contables
  - **Descuadre contable**: Verificar asientos automáticos
  - **Impuestos incorrectos**: Revisar configuración de tasas
  - **Períodos cerrados**: Establecer procedimiento de ajustes
  - **Informes inconsistentes**: Validar fuentes de datos
  - **Errores de clasificación**: Revisar mapeo de cuentas`,
  
    reportes: `# Módulo de Reportes
  
  ## Descripción General
  El módulo de reportes proporciona una interfaz unificada para acceder y gestionar todos los reportes del sistema. Ofrece una experiencia de usuario moderna y eficiente para visualizar, analizar y exportar datos de diferentes áreas del negocio.
  
  ## Características Principales
  
  ### 1. Dashboard Unificado
  
  #### Interfaz Centralizada
  - **Navegación intuitiva**:
    - Organización por categorías
    - Pestañas temáticas
    - Búsqueda rápida
    - Reportes favoritos
    - Historial reciente
  
  - **Filtros y controles**:
    - Selección de fechas
    - Filtros por tienda/sucursal
    - Filtros por categoría
    - Filtros por usuario
    - Guardado de configuraciones
  
  - **Personalización**:
    - Reportes favoritos
    - Orden personalizado
    - Vistas guardadas
    - Configuración de inicio
    - Notificaciones personalizadas
  
  - **Exportación multiformato**:
    - PDF (documentos formales)
    - Excel (análisis detallado)
    - CSV (integración con otros sistemas)
    - JSON (para desarrolladores)
    - Programación de envíos automáticos
  
  ### 2. Tipos de Reportes
  
  #### 2.1 Reportes Financieros
  
  - **Análisis de ingresos y gastos**:
    - Ingresos por período
    - Comparativa interanual
    - Tendencias mensuales
    - Proyecciones futuras
    - Análisis de desviaciones
  
  - **Estado de cuenta**:
    - Balance general
    - Estado de resultados
    - Flujo de efectivo
    - Indicadores financieros clave
    - Análisis horizontal y vertical
  
  - **Flujo de caja**:
    - Entradas y salidas diarias
    - Proyección a corto plazo
    - Saldos bancarios
    - Alertas de liquidez
    - Escenarios de sensibilidad
  
  - **Rentabilidad**:
    - Por producto/servicio
    - Por categoría
    - Por cliente
    - Por canal de venta
    - Análisis de márgenes
  
  - **Métricas financieras clave**:
    - ROI (Retorno sobre inversión)
    - EBITDA
    - Punto de equilibrio
    - Ciclo de conversión de efectivo
    - Índices de liquidez y solvencia
  
  #### 2.2 Reportes de Inventario
  
  - **Control de stock**:
    - Niveles actuales
    - Productos bajo mínimo
    - Exceso de inventario
    - Productos sin movimiento
    - Necesidades de reposición
  
  - **Movimientos de inventario**:
    - Entradas y salidas
    - Transferencias entre áreas
    - Ajustes de inventario
    - Devoluciones
    - Mermas y pérdidas
  
  - **Valoración de inventario**:
    - Costo promedio
    - FIFO/LIFO
    - Valor total del inventario
    - Depreciación de productos
    - Provisión por obsolescencia
  
  - **Alertas de stock**:
    - Productos agotados
    - Próximos a agotarse
    - Exceso de inventario
    - Productos vencidos
    - Productos sin rotación
  
  - **Rotación de productos**:
    - Índice de rotación
    - Días de inventario
    - Productos más vendidos
    - Productos menos vendidos
    - Estacionalidad
  
  #### 2.3 Reportes de Desempeño
  
  - **KPIs y métricas**:
    - Objetivos vs. resultados
    - Tendencias temporales
    - Comparativa con benchmarks
    - Alertas de desviación
    - Recomendaciones de mejora
  
  - **Análisis de productividad**:
    - Por empleado
    - Por departamento
    - Por tienda/sucursal
    - Evolución temporal
    - Factores de influencia
  
  - **Indicadores de eficiencia**:
    - Tiempo de proceso
    - Costos operativos
    - Utilización de recursos
    - Calidad del servicio
    - Satisfacción del cliente
  
  - **Comparativas temporales**:
    - Día anterior
    - Semana anterior
    - Mes anterior
    - Año anterior
    - Períodos personalizados
  
  ### 3. Visualización de Datos
  
  #### Gráficos Interactivos
  
  - **Tipos de gráficos**:
    - Barras (comparativas)
    - Líneas (tendencias)
    - Circulares (distribución)
    - Dispersión (correlaciones)
    - Mapas de calor (intensidad)
  
  - **Interactividad**:
    - Zoom en áreas específicas
    - Filtrado dinámico
    - Tooltips informativos
    - Cambio de perspectiva
    - Drill-down para detalles
  
  - **Personalización visual**:
    - Esquemas de colores
    - Etiquetas y leyendas
    - Escalas y ejes
    - Anotaciones
    - Temas visuales
  
  #### Tablas Dinámicas
  
  - **Organización de datos**:
    - Agrupación multinivel
    - Ordenamiento personalizado
    - Filtros avanzados
    - Cálculos personalizados
    - Formato condicional
  
  - **Funcionalidades**:
    - Expansión/colapso de grupos
    - Totales y subtotales
    - Exportación selectiva
    - Búsqueda rápida
    - Fijación de columnas
  
  ### 4. Reportes Programados
  
  #### Automatización
  
  - **Programación temporal**:
    - Diaria (inicio/fin de día)
    - Semanal (día específico)
    - Mensual (fecha específica)
    - Trimestral/Anual
    - Personalizada
  
  - **Distribución**:
    - Email (múltiples destinatarios)
    - Almacenamiento en nube
    - Notificaciones en app
    - API para integración
    - Historial de envíos
  
  - **Formatos de entrega**:
    - PDF interactivo
    - Excel con fórmulas
    - Presentación ejecutiva
    - Datos estructurados
    - Visualización web
  
  #### Alertas Inteligentes
  
  - **Condiciones configurables**:
    - Umbrales específicos
    - Variaciones porcentuales
    - Tendencias sostenidas
    - Eventos específicos
    - Combinación de factores
  
  - **Canales de notificación**:
    - Email
    - SMS
    - Notificaciones push
    - Alertas en dashboard
    - Integración con mensajería
  
  - **Niveles de urgencia**:
    - Informativo
    - Advertencia
    - Crítico
    - Escalamiento automático
    - Confirmación de lectura
  
  ### 5. Análisis Avanzado
  
  #### Tendencias y Proyecciones
  
  - **Análisis de tendencias**:
    - Patrones históricos
    - Estacionalidad
    - Ciclos de negocio
    - Factores de influencia
    - Detección de anomalías
  
  - **Modelos predictivos**:
    - Proyección de ventas
    - Estimación de demanda
    - Previsión de flujo de caja
    - Análisis de escenarios
    - Simulación Monte Carlo
  
  #### Análisis Comparativo
  
  - **Benchmarking interno**:
    - Entre tiendas/sucursales
    - Entre períodos
    - Entre productos/servicios
    - Entre vendedores
    - Entre canales de venta
  
  - **Análisis de variaciones**:
    - Desviaciones presupuestarias
    - Cambios interanuales
    - Impacto de promociones
    - Efectos estacionales
    - Factores externos
  
  ## Reportes Específicos por Área
  
  ### Reportes de Ventas
  
  - **Análisis de ventas**:
    - Por producto
    - Por categoría
    - Por cliente
    - Por vendedor
    - Por canal de venta
  
  - **Análisis de precios**:
    - Precio promedio
    - Descuentos aplicados
    - Margen de contribución
    - Elasticidad de precios
    - Comparativa con competencia
  
  - **Efectividad promocional**:
    - ROI de promociones
    - Incremento de ventas
    - Nuevos clientes captados
    - Fidelización
    - Canibalización
  
  ### Reportes de Clientes
  
  - **Segmentación de clientes**:
    - Por valor (RFM)
    - Por comportamiento
    - Por demografía
    - Por ubicación
    - Por preferencias
  
  - **Análisis de retención**:
    - Tasa de retención
    - Churn rate
    - Reactivación de clientes
    - Ciclo de vida
    - Valor del tiempo de vida
  
  - **Satisfacción del cliente**:
    - NPS (Net Promoter Score)
    - CSAT (Customer Satisfaction)
    - Encuestas de satisfacción
    - Análisis de quejas
    - Tiempo de resolución
  
  ### Reportes de Marketing
  
  - **Efectividad de campañas**:
    - ROI por campaña
    - Costo de adquisición
    - Tasa de conversión
    - Engagement
    - Atribución multicanal
  
  - **Análisis de canales**:
    - Rendimiento por canal
    - Costo por lead
    - Tasa de conversión
    - Tiempo de conversión
    - Optimización de presupuesto
  
  - **Comportamiento digital**:
    - Tráfico web
    - Interacciones en redes sociales
    - Email marketing
    - SEO/SEM
    - Análisis de contenido
  
  ## Herramientas de Análisis
  
  ### Filtros Avanzados
  
  - **Filtrado multidimensional**:
    - Combinación de criterios
    - Operadores lógicos
    - Rangos de valores
    - Exclusiones
    - Filtros guardados
  
  - **Segmentación dinámica**:
    - Creación de cohortes
    - Análisis comparativo
    - Grupos de control
    - Segmentos personalizados
    - Análisis de subgrupos
  
  ### Análisis Ad-hoc
  
  - **Consultas personalizadas**:
    - Constructor visual de consultas
    - Campos calculados
    - Joins entre fuentes de datos
    - Agregaciones personalizadas
    - Guardado de consultas
  
  - **Exploración de datos**:
    - Drill-down interactivo
    - Pivoteo dinámico
    - Análisis what-if
    - Detección de patrones
    - Exportación de hallazgos
  
  ## Mejores Prácticas
  
  ### Diseño de Reportes
  
  1. **Claridad visual**: Priorizar la legibilidad y comprensión rápida
  2. **Relevancia**: Incluir solo información útil para la toma de decisiones
  3. **Contexto**: Proporcionar puntos de referencia y comparativas
  4. **Consistencia**: Mantener formatos y métricas coherentes
  5. **Accionabilidad**: Facilitar la identificación de acciones concretas
  
  ### Análisis Efectivo
  
  - **Enfoque en objetivos**: Alinear análisis con metas del negocio
  - **Validación de datos**: Verificar la calidad y consistencia
  - **Interpretación contextual**: Considerar factores externos e internos
  - **Comunicación clara**: Presentar hallazgos de forma comprensible
  - **Seguimiento**: Monitorear el impacto de decisiones basadas en datos
  
  ### Optimización de Rendimiento
  
  - **Indexación adecuada**: Optimizar bases de datos para consultas
  - **Procesamiento por lotes**: Programar reportes pesados en horas valle
  - **Caché inteligente**: Almacenar resultados frecuentes
  - **Muestreo de datos**: Usar técnicas estadísticas para grandes volúmenes
  - **Escalamiento de recursos**: Ajustar infraestructura según demanda
  
  > **📊 Consejo analítico**: Los mejores reportes no son los que contienen más datos, sino los que transforman datos en insights accionables. Enfócate en responder preguntas específicas del negocio.
  
  ## Configuración Inicial
  
  ### Configuración de Reportes Básicos
  \`\`\`
  1. Identificar KPIs críticos por área
  2. Diseñar plantillas estándar
  3. Configurar fuentes de datos
  4. Establecer permisos de acceso
  5. Programar generación automática
  \`\`\`
  
  ### Configuración de Alertas
  \`\`\`
  1. Definir umbrales críticos
  2. Establecer canales de notificación
  3. Configurar frecuencia de verificación
  4. Asignar responsables de seguimiento
  5. Probar sistema de alertas
  \`\`\`
  
  ## Solución de Problemas Comunes
  
  ### Problemas de Datos
  - **Inconsistencias**: Verificar fuentes y procesos ETL
  - **Datos faltantes**: Implementar validaciones y valores predeterminados
  - **Rendimiento lento**: Optimizar consultas y agregar índices
  - **Discrepancias**: Conciliar diferentes fuentes de información
  - **Errores de cálculo**: Revisar fórmulas y lógica de procesamiento
  
  ### Problemas de Visualización
  - **Gráficos confusos**: Simplificar y enfocar en mensaje principal
  - **Sobrecarga de información**: Priorizar métricas clave
  - **Interpretación errónea**: Agregar contexto y referencias
  - **Problemas de accesibilidad**: Mejorar contraste y etiquetado
  - **Inconsistencia visual**: Estandarizar formatos y nomenclatura`,
  
    ventas: `# Sistema de Ventas POS - Historial y Reportes
  
  ## Descripción General
  El Sistema de Ventas POS es una solución completa para la gestión y análisis de ventas realizadas en el punto de venta. Permite visualizar, filtrar y analizar el historial de ventas, así como generar reportes detallados.
  
  ## Características Principales
  
  ### 1. Dashboard de Ventas
  
  #### Resumen General
  - **Total de ventas**:
    - Contador de transacciones
    - Comparativa con período anterior
    - Tendencia diaria/semanal/mensual
    - Distribución por tienda
    - Gráfico de evolución
  
  - **Ingresos totales**:
    - Monto total en moneda local
    - Desglose por método de pago
    - Comparativa con objetivos
    - Tendencia temporal
    - Proyección de cierre
  
  - **Ticket promedio**:
    - Valor medio por transacción
    - Evolución histórica
    - Comparativa entre tiendas
    - Distribución por hora del día
    - Factores de influencia
  
  - **Productos vendidos**:
    - Cantidad total de unidades
    - Productos más vendidos
    - Categorías principales
    - Rotación de inventario
    - Alertas de stock bajo
  
  #### Tendencias
  - **Comparación con período anterior**:
    - Variación porcentual
    - Análisis día a día
    - Factores estacionales
    - Eventos especiales
    - Análisis de causas
  
  - **Indicadores de crecimiento**:
    - Tasa de crecimiento
    - Velocidad de cambio
    - Patrones recurrentes
    - Proyecciones futuras
    - Alertas de desviación
  
  ### 2. Análisis de Métodos de Pago
  
  #### Distribución de Ventas
  - **Ventas en efectivo**:
    - Monto total
    - Porcentaje del total
    - Tendencia temporal
    - Denominaciones recibidas
    - Cambio entregado
  
  - **Ventas con tarjeta**:
    - Desglose por tipo (crédito/débito)
    - Distribución por entidad bancaria
    - Transacciones aprobadas/rechazadas
    - Comisiones bancarias
    - Tiempo de procesamiento
  
  #### Visualización
  - **Barras de progreso**:
    - Representación visual de proporciones
    - Código de colores por método
    - Comparativa con períodos anteriores
    - Objetivos y metas
    - Indicadores de rendimiento
  
  - **Porcentajes**:
    - Distribución porcentual
    - Variación respecto a la media
    - Tendencias de preferencia
    - Impacto en flujo de caja
    - Optimización de métodos
  
  - **Montos totales**:
    - Valores absolutos
    - Agrupación por períodos
    - Filtros dinámicos
    - Exportación de datos
    - Informes detallados
  
  ### 3. Historial de Ventas
  
  #### Filtros Avanzados
  - **Por período**:
    - Hoy
    - Ayer
    - Esta semana
    - Este mes
    - Rango personalizado
    - Comparativa entre períodos
  
  - **Por método de pago**:
    - Efectivo
    - Tar��eta de crédito
    - Tarjeta de débito
    - Transferencia
    - Crédito interno
    - Múltiples métodos
  
  - **Búsqueda por texto**:
    - Número de factura
    - Nombre de cliente
    - Producto específico
    - Vendedor
    - Notas de venta
    - Búsqueda avanzada
  
  #### Ordenamiento
  - **Por fecha**:
    - Más recientes primero
    - Más antiguos primero
    - Agrupación por día/semana/mes
    - Visualización en calendario
    - Patrones temporales
  
  - **Por monto**:
    - Mayor a menor
    - Menor a mayor
    - Rangos de valor
    - Transacciones atípicas
    - Análisis de outliers
  
  ### 4. Detalle de Transacciones
  
  #### Información de Venta
  - **Datos generales**:
    - Número de transacción
    - Fecha y hora
    - Tienda/Terminal
    - Vendedor
    - Estado de la transacción
  
  - **Cliente**:
    - Nombre/Identificación
    - Tipo de cliente
    - Historial de compras
    - Programa de fidelidad
    - Notas específicas
  
  - **Productos**:
    - Lista detallada
    - Cantidades
    - Precios unitarios
    - Descuentos aplicados
    - Impuestos
  
  - **Totales**:
    - Subtotal
    - Descuentos
    - Impuestos
    - Total final
    - Método(s) de pago
  
  #### Acciones Disponibles
  - **Reimpresión**:
    - Factura/boleta
    - Comprobante de pago
    - Garantía
    - Formato para cliente
    - Formato interno
  
  - **Devolución/Cambio**:
    - Proceso guiado
    - Políticas aplicables
    - Motivo de devolución
    - Reembolso/Cambio
    - Afectación a inventario
  
  - **Notas y comentarios**:
    - Observaciones de venta
    - Incidencias registradas
    - Solicitudes especiales
    - Seguimiento postventa
    - Retroalimentación del cliente
  
  ### 5. Reportes Avanzados
  
  #### Reportes Predefinidos
  - **Ventas por período**:
    - Diario
    - Semanal
    - Mensual
    - Trimestral
    - Anual
    - Comparativas interanuales
  
  - **Ventas por categoría**:
    - Distribución por familia de productos
    - Tendencias por categoría
    - Estacionalidad
    - Rentabilidad por categoría
    - Oportunidades de crecimiento
  
  - **Ventas por vendedor**:
    - Ranking de vendedores
    - Objetivos vs. resultados
    - Ticket promedio por vendedor
    - Productos más vendidos
    - Comisiones generadas
  
  - **Análisis de horarios**:
    - Distribución por hora del día
    - Días de mayor venta
    - Patrones semanales
    - Horas pico
    - Optimización de personal
  
  #### Reportes Personalizados
  - **Constructor de reportes**:
    - Selección de campos
    - Filtros avanzados
    - Agrupaciones personalizadas
    - Cálculos específicos
    - Guardado de plantillas
  
  - **Visualización**:
    - Tablas dinámicas
    - Gráficos interactivos
    - Mapas de calor
    - Indicadores clave
    - Exportación multiformato
  
  ### 6. Análisis de Rentabilidad
  
  #### Márgenes de Ganancia
  - **Por producto**:
    - Costo vs. precio de venta
    - Margen unitario
    - Volumen de ventas
    - Contribución total
    - Optimización de precios
  
  - **Por categoría**:
    - Rentabilidad comparativa
    - Tendencias de margen
    - Productos destacados
    - Productos problemáticos
    - Estrategias de mejora
  
  - **Por cliente**:
    - Rentabilidad por segmento
    - Costo de servicio
    - Frecuencia de compra
    - Valor del tiempo de vida
    - Estrategias de fidelización
  
  #### Análisis de Descuentos
  - **Impacto en ventas**:
    - Incremento de volumen
    - Afectación al margen
    - Efectividad por tipo
    - Temporalidad óptima
    - Recomendaciones
  
  - **Políticas de descuento**:
    - Evaluación de estrategias
    - Descuentos automáticos
    - Descuentos manuales
    - Autorizaciones requeridas
    - Mejores prácticas
  
  ### 7. Integración con Inventario
  
  #### Control de Stock
  - **Actualización automática**:
    - Descuento en tiempo real
    - Verificación previa
    - Alertas de stock bajo
    - Reposición automática
    - Trazabilidad completa
  
  - **Análisis de rotación**:
    - Velocidad de venta
    - Días de inventario
    - Productos sin movimiento
    - Estacionalidad
    - Optimización de compras
  
  #### Alertas y Notificaciones
  - **Stock crítico**:
    - Productos agotados
    - Próximos a agotarse
    - Impacto en ventas
    - Sugerencias de pedido
    - Priorización de reposición
  
  - **Discrepancias**:
    - Diferencias de inventario
    - Ventas anómalas
    - Posibles errores
    - Necesidad de conteo
    - Procedimientos de ajuste
  
  ## Funcionalidades Específicas
  
  ### Cierre de Caja
  
  #### Proceso de Cierre
  - **Verificación de transacciones**:
    - Conteo de operaciones
    - Totalización por método de pago
    - Conciliación con sistema
    - Identificación de discrepancias
    - Registro de diferencias
  
  - **Arqueo de efectivo**:
    - Conteo por denominación
    - Cálculo automático
    - Registro de sobrantes/faltantes
    - Justificación de diferencias
    - Firma de responsables
  
  - **Informes de cierre**:
    - Resumen de ventas
    - Desglose por método de pago
    - Transacciones especiales
    - Devoluciones y anulaciones
    - Firma digital/física
  
  #### Análisis de Cierre
  - **Tendencias diarias**:
    - Comparativa con días anteriores
    - Patrones semanales
    - Factores de variación
    - Proyecciones futuras
    - Recomendaciones operativas
  
  - **Indicadores de rendimiento**:
    - Ventas por hora
    - Ticket promedio
    - Eficiencia de terminal
    - Tiempo de atención
    - Satisfacción del cliente
  
  ### Gestión de Devoluciones
  
  #### Proceso de Devolución
  - **Registro detallado**:
    - Venta original
    - Productos devueltos
    - Motivo de devolución
    - Estado del producto
    - Reembolso/cambio realizado
  
  - **Políticas aplicadas**:
    - Tiempo desde la compra
    - Estado del producto
    - Documentación requerida
    - Excepciones autorizadas
    - Registro de aprobaciones
  
  #### Análisis de Devoluciones
  - **Estadísticas**:
    - Tasa de devolución
    - Productos más devueltos
    - Motivos frecuentes
    - Impacto financiero
    - Acciones correctivas
  
  - **Mejora continua**:
    - Identificación de patrones
    - Problemas de calidad
    - Ajustes de descripción
    - Capacitación de personal
    - Modificación de políticas
  
  ### Ventas a Crédito
  
  #### Gestión de Créditos
  - **Aprobación de crédito**:
    - Verificación de cliente
    - Límite disponible
    - Historial crediticio
    - Términos acordados
    - Documentación requerida
  
  - **Seguimiento de pagos**:
    - Calendario de vencimientos
    - Recordatorios automáticos
    - Registro de abonos
    - Saldo pendiente
    - Estado de cuenta
  
  #### Análisis de Crédito
  - **Salud de cartera**:
    - Antigüedad de saldos
    - Cumplimiento de pagos
    - Clientes en mora
    - Riesgo crediticio
    - Provisiones necesarias
  
  - **Estrategias de cobro**:
    - Segmentación de cartera
    - Acciones por segmento
    - Efectividad de cobro
    - Optimización de términos
    - Políticas de incentivos
  
  ## Mejores Prácticas
  
  ### Gestión de Ventas
  1. **Registro inmediato**: Procesar todas las ventas en tiempo real
  2. **Verificación de datos**: Validar información de cliente y productos
  3. **Documentación completa**: Incluir todos los detalles relevantes
  4. **Seguimiento postventa**: Contacto para verificar satisfacción
  5. **Análisis regular**: Revisar indicadores clave semanalmente
  
  ### Análisis de Datos
  - **Enfoque en tendencias**: Identificar patrones y cambios significativos
  - **Comparativas contextuales**: Evaluar resultados en su contexto adecuado
  - **Accionabilidad**: Derivar acciones concretas de los análisis
  - **Comunicación efectiva**: Compartir insights con el equipo
  - **Mejora continua**: Implementar cambios basados en datos
  
  ### Optimización de Ventas
  - **Promociones dirigidas**: Diseñar ofertas basadas en datos de compra
  - **Capacitación continua**: Formar al equipo en técnicas de venta
  - **Experiencia del cliente**: Mejorar constantemente el proceso de compra
  - **Gestión de inventario**: Asegurar disponibilidad de productos populares
  - **Fidelización**: Implementar estrategias de retención basadas en datos
  
  > **💼 Consejo profesional**: El análisis regular del historial de ventas no solo te permite entender el pasado, sino también predecir tendencias futuras y tomar decisiones proactivas para maximizar los ingresos.
  
  ## Configuración Inicial
  
  ### Configuración de Reportes
  \`\`\`
  1. Definir KPIs principales
  2. Establecer períodos de análisis
  3. Configurar filtros frecuentes
  4. Crear plantillas personalizadas
  5. Programar reportes automáticos
  \`\`\`
  
  ### Configuración de Alertas
  \`\`\`
  1. Definir umbrales críticos
  2. Configurar notificaciones
  3. Asignar responsables
  4. Establecer protocolos de acción
  5. Revisar periódicamente criterios
  \`\`\`
  
  ## Solución de Problemas Comunes
  
  ### Problemas de Datos
  - **Ventas no registradas**: Verificar configuración de terminales
  - **Discrepancias en totales**: Revisar cálculos de impuestos y descuentos
  - **Duplicidad de registros**: Validar proceso de sincronización
  - **Datos incompletos**: Asegurar campos obligatorios
  - **Inconsistencias**: Conciliar diferentes fuentes de datos
  
  ### Problemas de Reportes
  - **Lentitud en generación**: Optimizar consultas y filtros
  - **Información incorrecta**: Verificar fuentes de datos y cálculos
  - **Visualización deficiente**: Ajustar formatos y presentación
  - **Exportación fallida**: Comprobar formatos y tamaños de archivo
  - **Acceso restringido**: Revisar permisos de usuario`,
  
    horarios: `# Módulo de Horarios y Nómina
  
  ## Descripción General
  El módulo de Horarios y Nómina proporciona una solución completa para la gestión de horarios de trabajo, control de horas, cálculo de nómina y administración de vacaciones. Este módulo está diseñado para cumplir con las regulaciones laborales y optimizar la gestión del personal.
  
  ## Características Principales
  
  ### 1. Gestión de Horarios
  
  #### Calendario de Horarios
  - **Vista mensual de horarios**:
    - Visualización completa del mes
    - Código de colores por tipo de turno
    - Indicadores de días festivos
    - Marcadores de ausencias
    - Vista por empleado o departamento
  
  - **Asignación de turnos**:
    - Creación de turnos personalizados
    - Asignación individual o masiva
    - Rotación automática de turnos
    - Restricciones de horas consecutivas
    - Validación de descansos obligatorios
  
  - **Control de horas trabajadas**:
    - Registro automático de entrada/salida
    - Cálculo de horas regulares
    - Identificación de horas extras
    - Pausas y descansos
    - Excepciones y ajustes manuales
  
  - **Gestión de días festivos**:
    - Calendario de festivos nacional
    - Festivos regionales
    - Días especiales de la empresa
    - Impacto en cálculo de horas
    - Compensaciones aplicables
  
  - **Visualización de carga de trabajo**:
    - Distribución de personal por hora
    - Identificación de picos de trabajo
    - Detección de déficit de personal
    - Optimización de cobertura
    - Alertas de sobrecarga
  
  #### Plantillas de Horarios
  
  - **Categorías predefinidas**:
    - Seguridad (turnos 24/7)
    - Limpieza (turnos parciales)
    - Mantenimiento (horarios especiales)
    - Recepción (turnos rotativos)
    - Administración (horario regular)
  
  - **Turnos personalizados**:
    - Hora de inicio y fin
    - Días de la semana aplicables
    - Pausas programadas
    - Rotación específica
    - Requisitos de personal
  
  - **Cálculo automático de horas**:
    - Horas regulares
    - Horas extras
    - Horas nocturnas
    - Horas en días festivos
    - Acumulados semanales/mensuales
  
  - **Duplicación de plantillas**:
    - Copia rápida de configuraciones
    - Modificación de parámetros específicos
    - Versiones alternativas
    - Plantillas estacionales
    - Plantillas para eventos especiales
  
  - **Aplicación masiva de horarios**:
    - Selección múltiple de empleados
    - Períodos extendidos
    - Validación de conflictos
    - Notificaciones automáticas
    - Confirmación de cambios
  
  ### 2. Control de Horas
  
  #### Tipos de Horas
  
  - **Horas regulares**:
    - Jornada ordinaria
    - Límites legales
    - Distribución semanal
    - Cálculo automático
    - Reportes de cumplimiento
  
  - **Horas extras (25% recargo)**:
    - Diurnas en días hábiles
    - Autorización previa
    - Límites permitidos
    - Justificación requerida
    - Cálculo automático de recargo
  
  - **Horas nocturnas (75% recargo)**:
    - Definición de horario nocturno
    - Identificación automática
    - Cálculo de recargo
    - Límites recomendados
    - Reportes específicos
  
  - **Horas dominicales (75% recargo)**:
    - Trabajo en día de descanso
    - Autorización especial
    - Compensación alternativa
    - Rotación equitativa
    - Control de frecuencia
  
  - **Horas festivas (100% recargo)**:
    - Trabajo en días feriados
    - Doble remuneración
    - Compensación alternativa
    - Prioridad de asignación
    - Histórico de asignaciones
  
  - **Incapacidades (67% del salario)**:
    - Registro de incapacidades
    - Carga de certificados médicos
    - Cálculo de compensación
    - Seguimiento de días
    - Reportes para seguridad social
  
  - **Vacaciones**:
    - Días acumulados
    - Días disfrutados
    - Programación anticipada
    - Aprobación de solicitudes
    - Cálculo de liquidación
  
  #### Registro de Tiempo
  
  - **Métodos de registro**:
    - Reloj biométrico
    - Aplicación móvil
    - Portal web
    - Registro manual
    - Integración con accesos
  
  - **Validación de registros**:
    - Verificación de ubicación
    - Confirmación biométrica
    - Aprobación de supervisor
    - Detección de anomalías
    - Corrección de errores
  
  - **Excepciones y ajustes**:
    - Olvidos de marcación
    - Trabajo fuera de sede
    - Permisos especiales
    - Compensación de tiempo
    - Registro de justificaciones
  
  ### 3. Gestión de Vacaciones
  
  #### Solicitudes de Vacaciones
  
  - **Creación de solicitudes**:
    - Selección de fechas
    - Verificación de saldo disponible
    - Comentarios adicionales
    - Documentos de respaldo
    - Envío a aprobación
  
  - **Aprobación/Rechazo**:
    - Flujo de aprobación configurable
    - Notificaciones automáticas
    - Justificación de rechazo
    - Propuesta de fechas alternativas
    - Registro de decisiones
  
  - **Cálculo de días hábiles**:
    - Exclusión automática de festivos
    - Consideración de medio día
    - Políticas específicas de la empresa
    - Acumulación de períodos
    - Validación de límites legales
  
  - **Control de saldo**:
    - Acumulación automática
    - Vencimiento de días
    - Alertas de caducidad
    - Proyección de disponibilidad
    - Políticas de acumulación
  
  - **Historial de solicitudes**:
    - Registro completo
    - Estado de cada solicitud
    - Fechas de aprobación
    - Comentarios y observaciones
    - Documentación asociada
  
  #### Planificación de Ausencias
  
  - **Calendario de ausencias**:
    - Vista consolidada del equipo
    - Identificación de conflictos
    - Cobertura por departamento
    - Períodos de alta demanda
    - Restricciones de fechas
  
  - **Políticas de aprobación**:
    - Antelación requerida
    - Límites por departamento
    - Períodos restringidos
    - Priorización por antigüedad
    - Excepciones autorizadas
  
  - **Sustituciones**:
    - Asignación de reemplazos
    - Transferencia de responsabilidades
    - Capacitación previa
    - Documentación de procesos
    - Seguimiento de efectividad
  
  ### 4. Cálculo de Nómina
  
  #### Componentes Salariales
  
  - **Salario base**:
    - Monto fijo mensual
    - Pago por hora
    - Salario mínimo legal
    - Ajustes periódicos
    - Histórico de cambios
  
  - **Horas extras y recargos**:
    - Cálculo automático según tipo
    - Validación de autorizaciones
    - Límites legales
    - Reportes detallados
    - Proyección de costos
  
  - **Bonificaciones**:
    - Por desempeño
    - Por cumplimiento de metas
    - Por antigüedad
    - Especiales (navidad, vacaciones)
    - Extraordinarias
  
  - **Comisiones**:
    - Porcentaje sobre ventas
    - Escalas progresivas
    - Metas individuales/grupales
    - Liquidación periódica
    - Reportes de productividad
  
  #### Deducciones
  
  - **Seguridad social**:
    - Salud (4%)
    - Pensión (4%)
    - Cálculo automático
    - Topes máximos
    - Reportes para declaración
  
  - **Impuestos**:
    - Retención en la fuente
    - Cálculo según normativa
    - Certificados anuales
    - Proyección anual
    - Optimización fiscal
  
  - **Préstamos y anticipos**:
    - Control de saldos
    - Cuotas mensuales
    - Intereses aplicables
    - Liquidación anticipada
    - Políticas de otorgamiento
  
  - **Otras deducciones**:
    - Embargos judiciales
    - Aportes voluntarios
    - Seguros
    - Fondos de empleados
    - Convenios empresariales
  
  #### Proceso de Nómina
  
  - **Períodos de pago**:
    - Quincenal
    - Mensual
    - Especiales
    - Calendario anual
    - Ajustes por festivos
  
  - **Pre-liquidación**:
    - Cálculo preliminar
    - Verificación de novedades
    - Validación de inconsistencias
    - Ajustes manuales
    - Aprobación previa
  
  - **Liquidación definitiva**:
    - Procesamiento final
    - Generación de comprobantes
    - Transferencia bancaria
    - Registro contable
    - Archivo histórico
  
  - **Reportes de nómina**:
    - Resumen ejecutivo
    - Detalle por empleado
    - Consolidado por conceptos
    - Comparativo mensual
    - Proyección de costos
  
  ### 5. Gestión de Ausentismo
  
  #### Tipos de Ausencias
  
  - **Incapacidades médicas**:
    - Enfermedad general
    - Accidente laboral
    - Licencia de maternidad/paternidad
    - Carga de certificados
    - Seguimiento de días
  
  - **Permisos remunerados**:
    - Calamidad doméstica
    - Matrimonio
    - Fallecimiento familiar
    - Citas médicas
    - Diligencias personales
  
  - **Permisos no remunerados**:
    - Solicitud formal
    - Aprobación requerida
    - Impacto en nómina
    - Límites anuales
    - Políticas específicas
  
  - **Licencias especiales**:
    - Estudio
    - Luto
    - Paternidad/Maternidad
    - Cargos públicos
    - Comisiones de servicio
  
  #### Análisis de Ausentismo
  
  - **Indicadores clave**:
    - Tasa de ausentismo
    - Frecuencia
    - Duración media
    - Costo asociado
    - Impacto en productividad
  
  - **Reportes por categoría**:
    - Por tipo de ausencia
    - Por departamento
    - Por empleado
    - Por período
    - Tendencias temporales
  
  - **Acciones preventivas**:
    - Identificación de patrones
    - Programas de bienestar
    - Seguimiento médico
    - Mejoras ergonómicas
    - Clima laboral
  
  ## Reportes y Análisis
  
  ### Reportes Operativos
  
  - **Control de asistencia**:
    - Puntualidad
    - Ausencias
    - Horas trabajadas
    - Excepciones
    - Tendencias
  
  - **Horas extras**:
    - Por empleado
    - Por departamento
    - Justificación
    - Costo asociado
    - Comparativa histórica
  
  - **Vacaciones y ausencias**:
    - Calendario consolidado
    - Saldos disponibles
    - Programación futura
    - Cobertura departamental
    - Alertas de acumulación
  
  ### Reportes Gerenciales
  
  - **Costos de personal**:
    - Salarios base
    - Horas extras
    - Bonificaciones
    - Prestaciones sociales
    - Costo total por área
  
  - **Productividad**:
    - Horas productivas
    - Ausentismo
    - Rotación
    - Eficiencia por departamento
    - Benchmarking interno
  
  - **Proyecciones**:
    - Incrementos salariales
    - Vacaciones programadas
    - Contrataciones previstas
    - Presupuesto anual
    - Escenarios de crecimiento
  
  ## Configuración del Sistema
  
  ### Parámetros Generales
  
  - **Jornadas laborales**:
    - Horario diurno
    - Horario nocturno
    - Jornada máxima
    - Descansos obligatorios
    - Turnos especiales
  
  - **Políticas de horas extras**:
    - Límites diarios
    - Límites semanales
    - Proceso de autorización
    - Compensación alternativa
    - Restricciones legales
  
  - **Calendario laboral**:
    - Días laborables
    - Festivos nacionales
    - Festivos empresariales
    - Horarios especiales
    - Cierres programados
  
  ### Configuración de Nómina
  
  - **Conceptos salariales**:
    - Definición de componentes
    - Fórmulas de cálculo
    - Periodicidad
    - Afectación tributaria
    - Reportes asociados
  
  - **Parámetros legales**:
    - Salario mínimo
    - Auxilio de transporte
    - Porcentajes de seguridad social
    - Factores prestacionales
    - Tablas de retención
  
  - **Integración contable**:
    - Cuentas asociadas
    - Centros de costo
    - Distribución de gastos
    - Provisiones automáticas
    - Reportes financieros
  
  ## Mejores Prácticas
  
  ### Gestión de Horarios
  1. **Planificación anticipada**: Publicar horarios con al menos una semana de antelación
  2. **Equidad en asignación**: Distribuir turnos difíciles de manera equitativa
  3. **Consideración de preferencias**: Permitir cierta flexibilidad cuando sea posible
  4. **Cumplimiento legal**: Respetar descansos obligatorios y límites de jornada
  5. **Comunicación clara**: Notificar cambios con suficiente anticipación
  
  ### Control de Tiempo
  - **Precisión en registros**: Fomentar marcaciones puntuales y precisas
  - **Verificación regular**: Revisar registros anómalos oportunamente
  - **Políticas claras**: Establecer reglas sobre tardanzas y ausencias
  - **Automatización**: Minimizar registros manuales para evitar errores
  - **Transparencia**: Permitir a empleados verificar sus propios registros
  
  ### Gestión de Vacaciones
  - **Planificación anual**: Fomentar programación anticipada
  - **Distribución equilibrada**: Evitar concentración en períodos específicos
  - **Priorización justa**: Establecer criterios claros para aprobación
  - **Documentación completa**: Mantener registros detallados de solicitudes
  - **Comunicación oportuna**: Notificar decisiones con suficiente antelación
  
  > **⏰ Consejo importante**: La gestión efectiva de horarios no solo impacta la productividad, sino también la satisfacción y retención del personal. Un sistema justo y transparente reduce conflictos y mejora el clima laboral.
  
  ## Configuración Inicial
  
  ### Configuración de Horarios
  \`\`\`
  1. Definir jornadas estándar
  2. Establecer turnos especiales
  3. Configurar días festivos
  4. Crear plantillas por departamento
  5. Definir políticas de rotación
  \`\`\`
  
  ### Configuración de Nómina
  \`\`\`
  1. Definir períodos de pago
  2. Configurar conceptos salariales
  3. Establecer deducciones estándar
  4. Configurar parámetros legales
  5. Validar cálculos con casos de prueba
  \`\`\`
  
  ## Solución de Problemas Comunes
  
  ### Problemas de Registro
  - **Marcaciones faltantes**: Implementar proceso de justificación
  - **Errores en cálculo de horas**: Verificar configuración de turnos
  - **Conflictos de horario**: Revisar asignaciones superpuestas
  - **Exceso de horas extras**: Analizar causas y optimizar planificación
  - **Ausentismo elevado**: Identificar patrones y causas subyacentes
  
  ### Problemas de Nómina
  - **Cálculos incorrectos**: Verificar fórmulas y parámetros
  - **Inconsistencias en pagos**: Revisar novedades aplicadas
  - **Reclamos frecuentes**: Mejorar comunicación de conceptos
  - **Retrasos en procesamiento**: Optimizar flujo de trabajo
  - **Errores en deducciones**: Validar bases de cálculo y porcentajes`,
  
    agencia: `# Manual de Usuario: Creación de una Agencia
  
  Este manual explica cómo crear una nueva agencia en el sistema. Asegúrate de estar logueado antes de iniciar el proceso.
  
  ## ¿Qué es una Agencia?
  Una agencia es la entidad principal dentro del sistema, desde la cual se gestionan los diferentes módulos y usuarios. La agencia funciona como el contenedor organizacional para todas las operaciones, tiendas, usuarios y configuraciones.
  
  ## Requisitos previos
  - Debes tener una cuenta activa y estar logueado en el sistema.
  - Necesitas tener los datos fiscales y comerciales de tu empresa a mano.
  - Es recomendable contar con el logo de tu agencia en formato digital (PNG o JPG).
  
  ## Pasos para crear una Agencia
  
  ### 1. Acceso al sistema
  - **Inicia sesión** en la plataforma con tu usuario y contraseña.
  - Una vez logueado, serás dirigido automáticamente al apartado de creación de agencia si aún no tienes una.
  - Si ya tienes una agencia y deseas crear otra, navega a **Configuración > Agencias > Nueva Agencia**.
  
  ### 2. Formulario de creación
  Completa todos los campos del formulario de creación de agencia:
  
  #### Información básica
  - **Logo de la Agencia**: Sube una imagen representativa de tu agencia, organización o empresa.
    - Formatos aceptados: JPG, PNG
    - Tamaño recomendado: 512x512 píxeles
    - Peso máximo: 2MB
    - Preferiblemente con fondo transparente
  
  - **Nombre de la Agencia**: Escribe el nombre oficial de tu agencia.
    - Este nombre aparecerá en documentos oficiales
    - Evita usar caracteres especiales
    - Máximo 100 caracteres
  
  - **Correo de la Agencia**: Ingresa el correo electrónico principal de la agencia.
    - Debe ser un correo válido y activo
    - Se utilizará para notificaciones importantes
    - Preferiblemente un correo corporativo
  
  - **Teléfono de la Agencia**: Proporciona un número de contacto válido.
    - Incluye el código de país
    - Formato: +57 300 123 4567
    - Será utilizado para verificaciones y contacto
  
  #### Ubicación física
  - **Dirección**: Escribe la dirección física de la agencia.
    - Incluye número de edificio, oficina o local
    - Sé específico para facilitar ubicación
    - Máximo 200 caracteres
  
  - **Ciudad**: Indica la ciudad donde se ubica la agencia.
    - Escribe el nombre completo de la ciudad
    - No uses abreviaturas
  
  - **Estado/Provincia**: Especifica el estado o provincia correspondiente.
    - Nombre completo del departamento o estado
    - Consistente con el país seleccionado
  
  - **Código Postal**: Ingresa el código postal de la ubicación de la agencia.
    - Formato numérico sin espacios
    - Debe corresponder a la dirección proporcionada
  
  - **País**: Selecciona o escribe el país donde opera la agencia.
    - Selecciona de la lista desplegable
    - Determina configuraciones fiscales y legales
  
  #### Configuración avanzada
  - **Agencia marca blanca**: Activa esta opción si deseas que la agencia funcione en modo white label (marca blanca).
    - Permite personalizar completamente la apariencia
    - Oculta referencias a la plataforma principal
    - Ideal para agencias que ofrecen servicios a terceros
  
  ### 3. Verificación y envío
  - Revisa que todos los campos estén correctamente llenados.
  - Verifica especialmente la información legal y de contacto.
  - Haz clic en el botón **Crear Agencia**.
  
  ### 4. Confirmación
  - Si toda la información es válida y el proceso es exitoso, la agencia será creada y serás redirigido automáticamente al dashboard principal de la agencia.
  - Recibirás un correo electrónico de confirmación con los detalles de la agencia creada.
  - Si ocurre algún error, revisa los mensajes de advertencia en pantalla y corrige los campos indicados.
  
  ## Configuración posterior a la creación
  
  ### Configuración básica
  Una vez creada la agencia, es recomendable completar la configuración inicial:
  
  1. **Información fiscal**:
     - Navega a **Configuración > Información Fiscal**
     - Completa los datos tributarios (NIT, régimen fiscal)
     - Configura la información para facturación electrónica
  
  2. **Usuarios y permisos**:
     - Crea usuarios adicionales en **Configuración > Usuarios**
     - Asigna roles y permisos según las responsabilidades
     - Envía invitaciones a los miembros de tu equipo
  
  3. **Tiendas/Sucursales**:
     - Configura las tiendas o sucursales en **Configuración > Tiendas**
     - Asigna usuarios a cada tienda
     - Establece parámetros específicos por tienda
  
  4. **Personalización**:
     - Ajusta la apariencia en **Configuración > Personalización**
     - Configura colores, estilos y elementos de marca
     - Personaliza plantillas de documentos
  
  ### Verificación de funcionalidades
  Antes de comenzar a utilizar el sistema completamente, verifica:
  
  - **Conexión DIAN**: Si utilizarás facturación electrónica
  - **Integración de pagos**: Si procesarás pagos electrónicos
  - **Configuración de inventario**: Para gestión de productos
  - **Permisos de usuarios**: Para garantizar la seguridad
  
  ## Mejores prácticas
  
  ### Organización inicial
  1. **Estructura clara**: Define claramente la jerarquía de tiendas y departamentos
  2. **Nomenclatura consistente**: Usa nombres descriptivos y coherentes
  3. **Documentación**: Mantén un registro de configuraciones importantes
  4. **Capacitación**: Asegúrate de que todos los usuarios conozcan sus funciones
  
  ### Seguridad
  - **Contraseñas robustas**: Exige contraseñas seguras para todos los usuarios
  - **Permisos específicos**: Asigna solo los permisos necesarios para cada rol
  - **Revisión periódica**: Audita regularmente los accesos y permisos
  - **Copias de seguridad**: Configura respaldos automáticos de información crítica
  
  ### Optimización
  - **Configuración por fases**: Implementa módulos gradualmente
  - **Pruebas iniciales**: Valida operaciones básicas antes de uso completo
  - **Retroalimentación**: Recopila comentarios de usuarios iniciales
  - **Ajustes continuos**: Refina la configuración según necesidades emergentes
  
  > **💡 Consejo importante**: Dedica tiempo suficiente a la configuración inicial de tu agencia. Una base sólida facilitará la operación futura y evitará problemas de consistencia de datos.
  
  ## Solución de problemas comunes
  
  ### Durante la creación
  - **Error de validación de correo**: Verifica que el formato sea correcto y el dominio exista
  - **Logo rechazado**: Comprueba el formato y tamaño de la imagen
  - **Duplicidad de nombre**: Intenta con una variación si el nombre ya está registrado
  - **Campos incompletos**: Revisa todos los campos marcados como obligatorios
  
  ### Después de la creación
  - **No puedo invitar usuarios**: Verifica tu plan y límites de usuarios
  - **Problemas de configuración fiscal**: Contacta a soporte para validar datos
  - **Error en creación de tiendas**: Comprueba que no excedas el límite de tu plan
  - **Personalización limitada**: Revisa las opciones disponibles según tu tipo de suscripción
  
  ## Recursos adicionales
  - **Centro de ayuda**: Accede a artículos detallados en la sección de Ayuda
  - **Tutoriales en video**: Disponibles en la sección de Capacitación
  - **Soporte técnico**: Contacta a nuestro equipo de soporte para asistencia personalizada
  - **Comunidad de usuarios**: Participa en foros para compartir experiencias y soluciones
  
  ## Glosario de términos
  
  - **Agencia**: Entidad principal que agrupa todas las operaciones y configuraciones.
  - **Tienda/Sucursal**: Punto de venta o unidad operativa dentro de una agencia.
  - **Usuario**: Persona con acceso al sistema con permisos específicos.
  - **Rol**: Conjunto de permisos predefinidos para un tipo de usuario.
  - **White Label**: Modalidad que permite personalizar completamente la apariencia sin referencias a la plataforma original.
  - **Dashboard**: Panel principal con indicadores y accesos rápidos.
  - **Módulo**: Componente funcional específico del sistema (inventario, ventas, etc.).`,
  
    equipo: `# Módulo de Gestión de Equipo
  
  ## Descripción General
  El módulo de gestión de equipo proporciona una solución completa para administrar los miembros del equipo, sus roles y permisos dentro de la agencia y sus tiendas asociadas. Este módulo permite un control granular de los accesos y responsabilidades de cada usuario en el sistema.
  
  ## Características Principales
  
  ### 1. Gestión de Usuarios
  
  #### Vista de Equipo
  - **Lista completa de miembros**:
    - Visualización en formato de tabla o tarjetas
    - Foto de perfil y datos básicos
    - Rol asignado y permisos
    - Estado de la cuenta (activo/inactivo)
    - Fecha de último acceso
  
  - **Información detallada de cada usuario**:
    - Datos personales
    - Información de contacto
    - Historial de actividad
    - Permisos asignados
    - Tiendas con acceso
  
  - **Estado de acceso y permisos**:
    - Nivel de acceso actual
    - Restricciones específicas
    - Módulos habilitados
    - Capacidades de edición/visualización
    - Historial de cambios de permisos
  
  - **Tiendas asignadas**:
    - Lista de tiendas con acceso
    - Nivel de permiso por tienda
    - Rol específico por tienda
    - Restricciones particulares
    - Capacidad de gestión múltiple
  
  #### Información del Usuario
  
  - **Nombre y foto de perfil**:
    - Nombre completo
    - Avatar personalizable
    - Iniciales automáticas (alternativa)
    - Indicador de estado (online/offline)
    - Última conexión
  
  - **Correo electrónico**:
    - Email principal de contacto
    - Verificación de email
    - Opciones de notificación
    - Comunicaciones recibidas
    - Historial de envíos
  
  - **Rol asignado**:
    - Tipo de rol (predefinido o personalizado)
    - Descripción de responsabilidades
    - Nivel jerárquico
    - Permisos incluidos
    - Restricciones específicas
  
  - **Tiendas con acceso**:
    - Lista completa de tiendas asignadas
    - Nivel de acceso por tienda
    - Capacidad de gestión
    - Restricciones específicas
    - Historial de asignaciones
  
  - **Estado de la cuenta**:
    - Activo/Inactivo/Suspendido
    - Razón de estado actual
    - Historial de cambios de estado
    - Bloqueos temporales
    - Opciones de reactivación
  
  ### 2. Roles y Permisos
  
  #### Tipos de Roles
  
  - **AGENCY_OWNER: Propietario de la agencia**:
    - Acceso completo a todas las funcionalidades
    - Control total sobre usuarios y permisos
    - Gestión de facturación y suscripción
    - Configuración global del sistema
    - No puede ser eliminado del sistema
  
  - **AGENCY_ADMIN: Administrador de agencia**:
    - Acceso amplio a funcionalidades
    - Gestión de usuarios (excepto propietario)
    - Configuración de parámetros generales
    - Acceso a reportes globales
    - Gestión de tiendas y sucursales
  
  - **SUBACCOUNT_USER: Usuario de tienda**:
    - Acceso limitado a tiendas asignadas
    - Funcionalidades operativas
    - Permisos específicos por módulo
    - Capacidad de gestión diaria
    - Reportes específicos de su ámbito
  
  - **SUBACCOUNT_GUEST: Invitado de tienda**:
    - Acceso de solo lectura
    - Visualización limitada de información
    - Sin capacidad de modificación
    - Reportes básicos
    - Acceso temporal configurable
  
  #### Niveles de Acceso
  
  - **Acceso completo a la agencia**:
    - Control total de configuraciones
    - Gestión de todas las tiendas
    - Administración de usuarios
    - Reportes globales
    - Configuración fiscal y legal
  
  - **Acceso limitado a tiendas específicas**:
    - Gestión de tiendas asignadas
    - Operaciones dentro de su ámbito
    - Reportes de sus tiendas
    - Usuarios de su equipo
    - Configuraciones específicas
  
  - **Permisos de solo lectura**:
    - Visualización sin modificación
    - Reportes predefinidos
    - Consultas limitadas
    - Sin acceso a información sensible
    - Duración configurable
  
  - **Permisos administrativos**:
    - Gestión de usuarios
    - Configuración de parámetros
    - Aprobaciones y autorizaciones
    - Reportes avanzados
    - Auditoría de actividades
  
  ### 3. Invitaciones y Onboarding
  
  #### Proceso de Invitación
  
  - **Envío de invitaciones por correo**:
    - Formulario de invitación
    - Personalización de mensaje
    - Selección de rol inicial
    - Asignación de tiendas
    - Fecha de expiración
  
  - **Selección de rol al invitar**:
    - Roles predefinidos
    - Roles personalizados
    - Descripción de responsabilidades
    - Vista previa de permisos
    - Ajustes específicos
  
  - **Validación de correos duplicados**:
    - Verificación automática
    - Alertas de duplicidad
    - Opciones de resolución
    - Fusión de cuentas existentes
    - Prevención de conflictos
  
  - **Seguimiento de invitaciones pendientes**:
    - Estado actual (enviada, vista, aceptada)
    - Tiempo restante de validez
    - Opción de reenvío
    - Cancelación de invitación
    - Recordatorios automáticos
  
  #### Configuración Inicial
  
  - **Asignación de tiendas**:
    - Selección múltiple de tiendas
    - Nivel de acceso por tienda
    - Roles específicos por tienda
    - Restricciones particulares
    - Período de validez
  
  - **Definición de permisos**:
    - Selección de módulos
    - Nivel de acceso por módulo
    - Capacidades específicas
    - Restricciones temporales
    - Aprobaciones requeridas
  
  - **Configuración de preferencias**:
    - Idioma predeterminado
    - Zona horaria
    - Notificaciones
    - Vista inicial
    - Reportes favoritos
  
  - **Activación de cuenta**:
    - Proceso de primer acceso
    - Cambio de contraseña inicial
    - Verificación de datos
    - Aceptación de términos
    - Tutorial de bienvenida
  
  ### 4. Gestión de Permisos Avanzados
  
  #### Permisos por Módulo
  
  - **Inventario**:
    - Creación de productos
    - Modificación de precios
    - Ajustes de stock
    - Categorización
    - Reportes específicos
  
  - **Ventas**:
    - Creación de ventas
    - Aplicación de descuentos
    - Anulaciones
    - Devoluciones
    - Cierre de caja
  
  - **Clientes**:
    - Registro de clientes
    - Edición de información
    - Historial de compras
    - Créditos y saldos
    - Comunicaciones
  
  - **Reportes**:
    - Visualización general
    - Reportes financieros
    - Exportación de datos
    - Reportes personalizados
    - Análisis avanzados
  
  #### Restricciones Específicas
  
  - **Límites monetarios**:
    - Monto máximo de venta
    - Descuento máximo permitido
    - Crédito máximo otorgable
    - Ajustes de inventario limitados
    - Devoluciones con aprobación
  
  - **Restricciones temporales**:
    - Horario permitido de acceso
    - Días de la semana habilitados
    - Bloqueo en fechas específicas
    - Acceso temporal para eventos
    - Caducidad automática
  
  - **Restricciones geográficas**:
    - Acceso solo desde ubicaciones aprobadas
    - Verificación de IP
    - Restricción por país/región
    - Dispositivos autorizados
    - Alertas de acceso inusual
  
  ### 5. Monitoreo y Auditoría
  
  #### Registro de Actividades
  
  - **Historial de acciones**:
    - Usuario responsable
    - Acción realizada
    - Fecha y hora
    - IP y dispositivo
    - Detalles específicos
  
  - **Filtros de auditoría**:
    - Por usuario
    - Por tipo de acción
    - Por módulo
    - Por período
    - Por resultado (éxito/error)
  
  - **Alertas de seguridad**:
    - Intentos fallidos de acceso
    - Cambios en permisos críticos
    - Accesos desde ubicaciones inusuales
    - Actividad fuera de horario
    - Acciones sensibles
  
  #### Análisis de Uso
  
  - **Estadísticas de actividad**:
    - Usuarios más activos
    - Módulos más utilizados
    - Horas pico de uso
    - Duración de sesiones
    - Patrones de uso
  
  - **Reportes de productividad**:
    - Transacciones por usuario
    - Tiempo de procesamiento
    - Eficiencia operativa
    - Comparativa entre usuarios
    - Tendencias temporales
  
  - **Optimización de accesos**:
    - Identificación de permisos no utilizados
    - Sugerencias de ajuste de roles
    - Detección de cuellos de botella
    - Mejoras de rendimiento
    - Recomendaciones de capacitación
  
  ## Flujos de Trabajo
  
  ### Creación de Nuevo Usuario
  
  #### Proceso Paso a Paso
  1. **Acceder al módulo**: Navegar a **Equipo > Usuarios**
  2. **Iniciar creación**: Hacer clic en **"Invitar Usuario"**
  3. **Información básica**:
     - Nombre completo
     - Correo electrónico
     - Teléfono (opcional)
     - Mensaje personalizado
  4. **Asignación inicial**:
     - Seleccionar rol
     - Asignar tiendas
     - Definir permisos específicos
  5. **Enviar invitación**:
     - Revisar datos
     - Confirmar envío
     - Notificación de estado
  
  #### Seguimiento de Invitación
  - **Monitoreo de estado**:
    - Pendiente de aceptación
    - Vista por el usuario
    - Aceptada y completada
    - Expirada
    - Rechazada
  - **Acciones disponibles**:
    - Reenviar invitación
    - Modificar permisos
    - Cancelar invitación
    - Extender validez
    - Enviar recordatorio
  
  ### Gestión de Roles Existentes
  
  #### Modificación de Permisos
  1. **Seleccionar usuario**: En la lista de equipo
  2. **Acceder a permisos**: Sección de roles y permisos
  3. **Ajustar accesos**:
     - Modificar rol principal
     - Ajustar permisos específicos
     - Cambiar acceso a tiendas
  4. **Guardar cambios**:
     - Confirmar modificaciones
     - Notificar al usuario (opcional)
     - Registro en auditoría
  
  #### Desactivación de Usuario
  1. **Seleccionar usuario**: En la lista de equipo
  2. **Cambiar estado**: Opción "Desactivar cuenta"
  3. **Especificar motivo**:
     - Cese de relación laboral
     - Ausencia temporal
     - Reorganización de funciones
     - Motivo personalizado
  4. **Confirmar acción**:
     - Verificación de seguridad
     - Fecha efectiva
     - Notificación automática
     - Registro en sistema
  
  ## Mejores Prácticas
  
  ### Gestión de Usuarios
  1. **Principio de mínimo privilegio**: Asignar solo los permisos necesarios
  2. **Revisión periódica**: Auditar regularmente roles y accesos
  3. **Documentación clara**: Mantener descripciones actualizadas de roles
  4. **Capacitación adecuada**: Entrenar usuarios según sus responsabilidades
  5. **Proceso de salida**: Establecer protocolo para desvinculaciones
  
  ### Seguridad de Accesos
  - **Autenticación robusta**: Implementar verificación en dos pasos
  - **Políticas de contraseñas**: Exigir contraseñas seguras y cambios periódicos
  - **Monitoreo continuo**: Revisar regularmente el registro de actividades
  - **Segregación de funciones**: Evitar concentración de permisos críticos
  - **Respuesta a incidentes**: Plan claro para vulneraciones de seguridad
  
  ### Optimización Organizacional
  - **Estructura clara**: Definir jerarquía y líneas de reporte
  - **Roles estandarizados**: Crear plantillas para posiciones comunes
  - **Escalabilidad**: Diseñar estructura que soporte crecimiento
  - **Flexibilidad operativa**: Permitir ajustes según necesidades cambiantes
  - **Evaluación continua**: Revisar efectividad de la estructura organizacional
  
  > **👥 Consejo importante**: La gestión efectiva del equipo no solo implica asignar permisos técnicos, sino también establecer claramente responsabilidades, líneas de comunicación y expectativas de desempeño.
  
  ## Configuración Inicial
  
  ### Configuración de Roles Básicos
  \`\`\`
  1. Definir roles esenciales (administrador, vendedor, inventario, etc.)
  2. Establecer permisos por defecto para cada rol
  3. Crear descripciones claras de responsabilidades
  4. Configurar restricciones apropiadas
  5. Documentar estructura de roles
  \`\`\`
  
  ### Configuración de Seguridad
  \`\`\`
  1. Establecer política de contraseñas
  2. Configurar opciones de autenticación
  3. Definir restricciones de acceso
  4. Activar registro de auditoría
  5. Configurar alertas de seguridad
  \`\`\`
  
  ## Solución de Problemas Comunes
  
  ### Problemas de Acceso
  - **Usuario no puede ingresar**: Verificar estado de cuenta y credenciales
  - **Permisos insuficientes**: Revisar asignación de rol y permisos específicos
  - **Acceso denegado a módulo**: Comprobar restricciones y requisitos
  - **Invitación expirada**: Generar nueva invitación con plazo extendido
  - **Conflicto de permisos**: Verificar jerarquía de roles y restricciones
  
  ### Problemas Organizacionales
  - **Estructura confusa**: Simplificar jerarquía y clarificar responsabilidades
  - **Sobrecarga de permisos**: Auditar y ajustar según principio de mínimo privilegio
  - **Cuellos de botella**: Identificar procesos que requieren múltiples aprobaciones
  - **Duplicidad de funciones**: Consolidar roles con responsabilidades similares
  - **Escalabilidad limitada**: Rediseñar estructura para soportar crecimiento`,
  
    terminal: `# Sistema POS Terminal
  
  ## Descripción General
  El Sistema POS Terminal es una solución completa para la gestión de ventas en tiempo real, diseñada para agencias y sus tiendas asociadas. Permite realizar ventas, gestionar inventario, y procesar pagos de manera eficiente.
  
  ## Características Principales
  
  ### 1. Gestión de Tiendas
  
  #### Selección de Tienda
  - **Alternancia entre tiendas**:
    - Selector de tienda en la interfaz principal
    - Cambio rápido entre diferentes ubicaciones
    - Visualización de tiendas favoritas
    - Búsqueda por nombre o código
    - Historial de tiendas recientes
  
  - **Productos por tienda**:
    - Filtrado automático por tienda seleccionada
    - Visualización de inventario específico
    - Precios y promociones por ubicación
    - Disponibilidad en tiempo real
    - Transferencias entre tiendas
  
  #### Vista de Tienda Activa
  - **Indicador visual**:
    - Nombre de tienda destacado
    - Código de colores por tienda
    - Icono representativo
    - Dirección abreviada
    - Horario de operación
  
  - **Información contextual**:
    - Vendedor asignado
    - Caja/terminal activa
    - Turno actual
    - Estado de operación
    - Notificaciones específicas
  
  #### Cambio de Tienda
  - **Proceso de cambio**:
    - Selección de nueva tienda
    - Verificación de permisos
    - Carga de configuración específica
    - Actualización de catálogo
    - Sincronización de datos
  
  - **Restricciones**:
    - Validación de acceso
    - Verificación de horario operativo
    - Bloqueo durante transacciones
    - Notificación de cambio a usuarios
    - Registro en bitácora
  
  ### 2. Gestión de Productos
  
  #### Búsqueda de Productos
  - **Búsqueda en tiempo real**:
    - Por nombre de producto
    - Por código/SKU
    - Por código de barras
    - Por categoría
    - Resultados instantáneos
  
  - **Métodos de búsqueda**:
    - Campo de texto con autocompletado
    - Escaneo de código de barras
    - Búsqueda por voz
    - Historial de búsquedas recientes
    - Productos favoritos
  
  #### Filtros Avanzados
  - **Por categoría**:
    - Árbol de categorías navegable
    - Subcategorías desplegables
    - Categorías destacadas
    - Filtros múltiples
    - Guardado de filtros favoritos
  
  - **Ordenamiento**:
    - Por nombre (A-Z/Z-A)
    - Por precio (ascendente/descendente)
    - Por popularidad
    - Por disponibilidad
    - Por fecha de actualización
  
  #### Visualización de Productos
  - **Imagen del producto**:
    - Visualización principal
    - Galería de imágenes
    - Zoom en imagen
    - Indicador de variantes
    - Marcador de promoción
  
  - **Nombre y descripción**:
    - Nombre completo
    - Descripción breve
    - Especificaciones técnicas
    - Características destacadas
    - Información adicional
  
  - **Precio y descuentos**:
    - Precio regular
    - Precio con descuento
    - Porcentaje de ahorro
    - Promociones aplicables
    - Precios por volumen
  
  - **Stock disponible**:
    - Cantidad en inventario
    - Indicador visual (disponible/bajo/agotado)
    - Disponibilidad en otras tiendas
    - Tiempo estimado de reposición
    - Opción de reserva
  
  - **Información adicional**:
    - Marca y modelo
    - Número de serie
    - Fechas de vencimiento
    - Estado del producto (nuevo/usado)
    - Garantía aplicable
  
  ### 3. Carrito de Compras
  
  #### Gestión de Productos
  - **Agregar/eliminar productos**:
    - Adición con un clic
    - Selección de cantidad
    - Eliminación individual
    - Vaciado completo
    - Ajuste rápido de cantidades
  
  - **Ajustar cantidades**:
    - Incremento/decremento unitario
    - Ingreso directo de cantidad
    - Validación contra inventario
    - Actualización automática de totales
    - Alertas de stock insuficiente
  
  - **Ver subtotales**:
    - Precio unitario
    - Cantidad seleccionada
    - Subtotal por producto
    - Descuentos aplicados
    - Impuestos desglosados
  
  #### Guardado de Estado
  - **Guardado automático**:
    - Persistencia entre sesiones
    - Recuperación tras desconexión
    - Sincronización entre dispositivos
    - Historial de carritos
    - Respaldo en servidor
  
  - **Recuperación de ventas**:
    - Listado de ventas guardadas
    - Filtrado por fecha/cliente
    - Vista previa de contenido
    - Restauración completa
    - Modificación antes de finalizar
  
  #### Validaciones
  - **Control de stock**:
    - Verificación en tiempo real
    - Bloqueo de cantidades excesivas
    - Reserva temporal de inventario
    - Liberación automática
    - Notificación de cambios
  
  - **Prevención de ventas sin productos**:
    - Validación de carrito vacío
    - Alerta antes de procesar
    - Verificación de cantidades
    - Comprobación de precios
    - Validación de cliente
  
  ### 4. Gestión de Clientes
  
  #### Selección de Cliente
  - **Cliente general**:
    - Venta rápida sin registro
    - Datos mínimos requeridos
    - Facturación simplificada
    - Opción de registro posterior
    - Límites de compra
  
  - **Clientes registrados**:
    - Búsqueda por nombre/ID
    - Historial de compras
    - Información completa
    - Condiciones especiales
    - Programas de fidelidad
  
  - **Creación de nuevos clientes**:
    - Formulario rápido
    - Campos obligatorios mínimos
    - Validación de duplicados
    - Categorización automática
    - Sincronización con CRM
  
  #### Información del Cliente
  - **Nombre**:
    - Nombre completo/Razón social
    - Nombre comercial
    - Contacto principal
    - Alias/Apodo
    - Tipo de cliente
  
  - **ID**:
    - Tipo de identificación
    - Número de documento
    - Verificación de validez
    - Digitalización de documento
    - Historial de verificaciones
  
  - **Email**:
    - Correo principal
    - Correo alternativo
    - Preferencias de comunicación
    - Verificación de formato
    - Historial de comunicaciones
  
  - **Teléfono**:
    - Número principal
    - Número alternativo
    - WhatsApp asociado
    - Preferencia de contacto
    - Horario de contacto
  
  - **Dirección**:
    - Dirección principal
    - Direcciones alternativas
    - Geolocalización
    - Referencias de ubicación
    - Zona de entrega
  
  ### 5. Proceso de Pago
  
  #### Métodos de Pago
  - **Efectivo**:
    - Ingreso de monto recibido
    - Cálculo automático de cambio
    - Denominaciones recibidas
    - Apertura automática de caja
    - Comprobante específico
  
  - **Tarjeta de crédito**:
    - Integración con POS físico
    - Procesamiento manual
    - Selección de franquicia
    - Número de cuotas
    - Comprobante de transacción
  
  - **Tarjeta de débito**:
    - Procesamiento inmediato
    - Verificación de fondos
    - Comprobante específico
    - Registro de autorización
    - Conciliación automática
  
  - **Transferencia bancaria**:
    - Datos de cuenta
    - Código de referencia
    - Verificación de recepción
    - Comprobante de transferencia
    - Estado de confirmación
  
  - **Crédito interno**:
    - Verificación de límite
    - Plazo de pago
    - Autorización requerida
    - Plan de pagos
    - Documentación de respaldo
  
  #### Cálculo de Totales
  - **Subtotal**:
    - Suma de productos
    - Antes de impuestos
    - Agrupación por categorías
    - Productos exentos
    - Productos gravados
  
  - **Descuentos**:
    - Descuentos por producto
    - Descuentos generales
    - Cupones aplicados
    - Promociones automáticas
    - Descuentos por volumen
  
  - **IVA (19%)**:
    - Cálculo automático
    - Desglose por tasa
    - Productos exentos
    - Base gravable
    - Redondeo legal
  
  - **Total final**:
    - Monto a pagar
    - Conversión a otras monedas
    - Redondeo aplicado
    - Visualización destacada
    - Confirmación verbal
  
  #### Proceso de Efectivo
  - **Ingreso de monto recibido**:
    - Campo numérico destacado
    - Validación de monto mínimo
    - Sugerencias de denominaciones
    - Calculadora integrada
    - Historial de montos frecuentes
  
  - **Cálculo automático de cambio**:
    - Diferencia exacta
    - Sugerencia de denominaciones
    - Validación de disponibilidad
    - Alerta de cambio insuficiente
    - Registro de transacción
  
  ### 6. Finalización de Venta
  
  #### Generación de Documentos
  - **Factura electrónica**:
    - Generación automática
    - Numeración consecutiva
    - Firma digital
    - Envío por email
    - Representación gráfica
  
  - **Ticket de venta**:
    - Formato personalizable
    - Información promocional
    - Código QR para seguimiento
    - Políticas de devolución
    - Información de contacto
  
  - **Comprobante de pago**:
    - Desglose de métodos
    - Autorización de tarjetas
    - Referencia de transferencias
    - Firma del cliente
    - Copia para archivo
  
  #### Confirmación de Venta
  - **Verificación final**:
    - Resumen de productos
    - Confirmación de totales
    - Validación de cliente
    - Verificación de pago
    - Autorización de descuentos
  
  - **Procesamiento**:
    - Actualización de inventario
    - Registro contable
    - Notificación a cliente
    - Actualización de CRM
    - Generación de reportes
  
  ### 7. Funcionalidades Especiales
  
  #### Ventas Especiales
  - **Ventas a crédito**:
    - Verificación de límite crediticio
    - Documentación requerida
    - Plan de pagos
    - Garantías necesarias
    - Seguimiento de cartera
  
  - **Ventas por catálogo**:
    - Productos no disponibles
    - Pedidos especiales
    - Tiempo de entrega
    - Anticipo requerido
    - Notificación de llegada
  
  - **Ventas mayoristas**:
    - Precios especiales
    - Cantidades mínimas
    - Descuentos por volumen
    - Condiciones especiales
    - Documentación fiscal
  
  #### Devoluciones y Cambios
  - **Proceso de devolución**:
    - Búsqueda de venta original
    - Verificación de políticas
    - Selección de productos
    - Motivo de devolución
    - Autorización requerida
  
  - **Tipos de devolución**:
    - Reembolso en efectivo
    - Nota crédito
    - Cambio por otro producto
    - Reparación/Garantía
    - Devolución parcial
  
  #### Promociones y Descuentos
  - **Aplicación automática**:
    - Promociones vigentes
    - Descuentos por volumen
    - Ofertas especiales
    - Cupones digitales
    - Programas de fidelidad
  
  - **Descuentos manuales**:
    - Autorización requerida
    - Límites por usuario
    - Justificación obligatoria
    - Registro de responsable
    - Validación de políticas
  
  ## Configuración del Terminal
  
  ### Configuración Básica
  - **Información de terminal**:
    - Número de terminal
    - Ubicación física
    - Responsable asignado
    - Horario de operación
    - Configuración de red
  
  - **Parámetros de venta**:
    - Moneda principal
    - Redondeo aplicado
    - Impuestos por defecto
    - Métodos de pago habilitados
    - Límites de transacción
  
  ### Personalización
  - **Interfaz de usuario**:
    - Tema visual
    - Tamaño de fuente
    - Distribución de elementos
    - Accesos rápidos
    - Información mostrada
  
  - **Flujo de trabajo**:
    - Pasos obligatorios
    - Validaciones requeridas
    - Confirmaciones necesarias
    - Documentos a imprimir
    - Notificaciones automáticas
  
  ## Mejores Prácticas
  
  ### Operación Eficiente
  1. **Preparación diaria**: Verificar funcionamiento de equipos y conectividad
  2. **Organización del espacio**: Mantener área de trabajo ordenada y funcional
  3. **Conocimiento de productos**: Familiarizarse con catálogo y promociones
  4. **Atención al cliente**: Brindar servicio amable y profesional
  5. **Registro preciso**: Asegurar exactitud en todas las transacciones
  
  ### Gestión de Inventario
  - **Verificación constante**: Revisar disponibilidad antes de ofrecer productos
  - **Actualización inmediata**: Reportar discrepancias de inventario
  - **Rotación adecuada**: Promover productos próximos a vencer
  - **Control de mermas**: Registrar productos dañados o perdidos
  - **Reposición oportuna**: Solicitar productos con stock bajo
  
  ### Seguridad y Control
  - **Manejo de efectivo**: Seguir protocolos de seguridad para dinero
  - **Verificación de pagos**: Validar autenticidad de billetes y tarjetas
  - **Protección de datos**: Mantener confidencialidad de información de clientes
  - **Respaldo de información**: Realizar copias de seguridad regulares
  - **Acceso controlado**: Usar credenciales personales únicamente
  
  > **🛒 Consejo operativo**: La eficiencia en el POS no solo mejora la experiencia del cliente, sino que también optimiza el flujo de trabajo y reduce errores. Mantén siempre actualizada tu información de productos y precios.
  
  ## Configuración Inicial
  
  ### Configuración del Terminal
  \`\`\`
  1. Configurar información básica del terminal
  2. Establecer métodos de pago aceptados
  3. Configurar impresoras y dispositivos
  4. Definir flujo de trabajo de ventas
  5. Probar funcionamiento completo
  \`\`\`
  
  ### Configuración de Productos
  \`\`\`
  1. Sincronizar catálogo de productos
  2. Verificar precios y promociones
  3. Configurar categorías y filtros
  4. Establecer alertas de stock
  5. Validar información fiscal
  \`\`\`
  
  ## Solución de Problemas Comunes
  
  ### Problemas Técnicos
  - **Lentitud del sistema**: Verificar conectividad y recursos del dispositivo
  - **Error en impresión**: Comprobar estado de impresoras y papel
  - **Problemas de sincronización**: Verificar conexión a internet y servidor
  - **Fallos en lectura de códigos**: Limpiar escáner y verificar códigos
  - **Errores de cálculo**: Revisar configuración de impuestos y descuentos
  
  ### Problemas Operativos
  - **Producto no encontrado**: Verificar código y disponibilidad en inventario
  - **Precio incorrecto**: Validar configuración de precios y promociones
  - **Cliente no registrado**: Crear nuevo cliente o usar cliente general
  - **Pago rechazado**: Verificar método de pago y autorización
  - **Descuento no aplicado**: Comprobar vigencia y condiciones de promoción`,
  }
  