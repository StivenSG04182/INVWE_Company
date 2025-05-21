#!/bin/bash
# Limpia la caché de Next.js
rm -rf .next
# Regenera el cliente de Prisma
npx prisma generate
# Reinicia el servidor de desarrollo
npm run dev 