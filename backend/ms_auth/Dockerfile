FROM node:22-alpine
WORKDIR /app
COPY backend/ms_auth/package*.json ./
RUN npm ci
COPY backend/ms_auth ./
COPY proto ./proto
RUN npm run build
EXPOSE 3001
EXPOSE 50051
CMD ["node", "dist/main.js"]