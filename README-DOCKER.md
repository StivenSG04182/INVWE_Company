# Instrucciones para Docker - INVWE Company

Este documento contiene las instrucciones para ejecutar el proyecto INVWE Company utilizando Docker, lo que permite una fácil portabilidad entre diferentes entornos.

## Requisitos previos

- [Docker](https://www.docker.com/products/docker-desktop/) instalado en tu sistema
- [Docker Compose](https://docs.docker.com/compose/install/) (generalmente viene incluido con Docker Desktop)

## Configuración inicial

1. Asegúrate de que el archivo `.env` contenga todas las variables de entorno necesarias:
   - Credenciales de Clerk para autenticación
   - URL de la base de datos PostgreSQL
   - Configuración de UploadThing
   - URL de MongoDB
   - Credenciales de PayPal
   - Otras variables específicas de la aplicación

## Construir y ejecutar con Docker

### Opción 1: Usando Docker Compose (recomendado)

1. Abre una terminal en la carpeta raíz del proyecto
2. Ejecuta el siguiente comando para construir y iniciar los contenedores:

```bash
docker-compose up --build
```

3. Para ejecutar en segundo plano (modo detached):

```bash
docker-compose up -d
```

4. Para detener los contenedores:

```bash
docker-compose down
```

### Opción 2: Usando Docker directamente

1. Construye la imagen:

```bash
docker build -t invwe-app .
```

2. Ejecuta el contenedor:

```bash
docker run -p 3000:3000 --env-file .env invwe-app
```

## Acceso a la aplicación

Una vez que los contenedores estén en ejecución, puedes acceder a la aplicación en:

- http://localhost:3000

## Solución de problemas comunes

### Problemas de conexión a la base de datos

Si experimentas problemas de conexión a la base de datos, verifica:

1. Que las variables `DATABASE_URL` y `DIRECT_URL` en el archivo `.env` sean correctas
2. Que la base de datos PostgreSQL esté accesible desde el contenedor

### Problemas con las variables de entorno

Si algunas funcionalidades no están disponibles, verifica que todas las variables de entorno necesarias estén correctamente configuradas en el archivo `.env`.

## Despliegue en producción

Para entornos de producción, considera:

1. Cambiar `NEXT_PUBLIC_SCHEME` a `https://` en el archivo `.env`
2. Configurar un servidor proxy inverso como Nginx para manejar SSL
3. Ajustar la configuración de seguridad según sea necesario

## Notas adicionales

- La imagen Docker está configurada para usar Node.js 18 en Alpine para un tamaño reducido
- La aplicación se ejecuta en modo producción dentro del contenedor
- Se utiliza un usuario no-root (nextjs) por razones de seguridad