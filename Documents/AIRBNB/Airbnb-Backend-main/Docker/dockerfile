# Etapa 1: Construcción
FROM node:22.14.0-alpine AS builder

# Instalar npm específico (v10.9.2)
RUN npm install -g npm@10.9.2

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar TypeScript)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Producción
FROM node:22.14.0-alpine AS production

# Instalar npm específico (v10.9.2)
RUN npm install -g npm@10.9.2

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar archivos compilados desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Exponer el puerto (ajusta según tu configuración)
EXPOSE 5000

# Variable de entorno para Node.js
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "start"]

