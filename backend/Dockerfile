FROM node:slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000

CMD ["npm", "run", "start"]