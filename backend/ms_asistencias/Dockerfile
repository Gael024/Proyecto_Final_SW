FROM node:22-alpine

WORKDIR /app

COPY backend/ms_asistencias/package*.json ./

RUN npm install

COPY backend/ms_asistencias ./

COPY proto ./proto

RUN npm run build

EXPOSE 3005

EXPOSE 50055

CMD ["node", "dist/main.js"]