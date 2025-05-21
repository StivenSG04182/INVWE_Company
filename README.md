# Proyecto SaaS

## Instrucciones para desarrollo

### Configuración inicial

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno:
   - Copia `.env.example` a `.env` y `.env.development`
   - Ajusta las variables según tu entorno

### Comandos disponibles

- `npm run dev`: Inicia el servidor de desarrollo con regeneración automática del cliente de Prisma
- `npm run dev:clean`: Limpia la caché y reinicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia la aplicación en modo producción
- `npm run prisma:generate`: Regenera el cliente de Prisma
- `npm run prisma:watch`: Observa cambios en el esquema de Prisma y regenera automáticamente
- `npm run prisma:push`: Actualiza la base de datos con el esquema actual
- `npm run prisma:studio`: Abre Prisma Studio para gestionar la base de datos

### Solución de problemas

Si encuentras problemas con Prisma:

1. Ejecuta `npm run prisma:generate` para regenerar el cliente
2. Si el problema persiste, ejecuta `npm run dev:clean` para limpiar la caché
3. En casos extremos, ejecuta `./cleanup.sh` (en sistemas Unix) o `npm run clean && npm install && npm run dev`

### Estructura del proyecto

- `/src`: Código fuente de la aplicación
- `/prisma`: Esquema de la base de datos y migraciones
- `/public`: Archivos estáticos

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
