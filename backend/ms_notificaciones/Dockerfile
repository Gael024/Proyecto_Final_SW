FROM node:22-alpine
WORKDIR /app
COPY backend/ms_notificaciones/package*.json ./
RUN npm ci
COPY backend/ms_notificaciones ./
COPY proto ./proto
RUN npm run build
EXPOSE 3006
EXPOSE 50056
CMD ["node", "dist/main.js"]