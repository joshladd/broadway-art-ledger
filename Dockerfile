# Simple container for running the prototype so anyone can click through it.
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000
# Dev server keeps the click-through fast to iterate; swap for build+start for prod.
CMD ["npm", "run", "dev"]
