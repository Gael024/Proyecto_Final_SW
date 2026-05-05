# Usa una imagen ligera de Node.js
FROM node:22-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias desde la raíz del monorepo
# (Se asume que el contexto del build es la raíz del proyecto)
COPY backend/ms_periodos/package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente del microservicio
COPY backend/ms_periodos ./

# Copia los archivos proto necesarios
COPY proto ./proto

# Compila el proyecto NestJS
RUN npm run build

# Expone el puerto que definiste en main.ts
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["node", "dist/main.js"]
