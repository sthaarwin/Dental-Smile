FROM node:slim

WORKDIR /app

COPY package*.json ./
RUN npm install


COPY . .


ENV NODE_ENV=development

EXPOSE 8000

CMD ["npm", "run", "start"]