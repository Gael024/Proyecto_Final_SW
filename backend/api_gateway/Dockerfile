FROM node:22-alpine
WORKDIR /app
COPY backend/api_gateway/package*.json ./
RUN npm ci
COPY backend/api_gateway ./
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]