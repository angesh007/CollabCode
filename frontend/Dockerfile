# frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install
RUN npm install @vitejs/plugin-react --save-dev
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# Copy the Vite build output
COPY --from=build /app/dist ./
# Basic SPA fallback
RUN printf 'server { \
  listen 8080; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri /index.html; } \
  }' > /etc/nginx/conf.d/default.conf
ENV PORT=8080
EXPOSE 8080
CMD ["nginx","-g","daemon off;"]
