FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./

COPY src/ ./src/

RUN npm run build

CMD [ "node", "./dist/main.js" ]
