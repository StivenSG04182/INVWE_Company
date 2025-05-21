# Imagen base de Node.js
FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Capa de dependencias
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Capa de construcción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Capa de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Crear usuario no-root para producción
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Configurar permisos
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar archivos de construcción
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]