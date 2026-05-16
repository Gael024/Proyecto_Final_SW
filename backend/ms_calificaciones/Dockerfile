# Usa una imagen ligera de Node.js
FROM node:22-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias desde la raíz del monorepo
COPY backend/ms_calificaciones/package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente del microservicio
COPY backend/ms_calificaciones ./

# Copia los archivos proto a la ruta ABSOLUTA /proto/
# (fuera de /app, para que coincida con lo que busca NestJS)
COPY proto ./proto

# Compila el proyecto NestJS
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]