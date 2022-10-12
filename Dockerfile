FROM node:14
WORKDIR frontend
COPY . .
RUN npm install
RUN npm start &
EXPOSE 4200
