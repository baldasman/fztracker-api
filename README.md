# FZTracker
FZTracker Rest API is a **NestJS** project. It supports all endpoints related with FZTracker application.


## Installation
Create .env file in the root.
```
MONGO_DB_HOST=localhost
MONGO_DB_PORT=27017
MONGO_DB_DATABASE=fztracker
MONGO_DB_INITIAL_CONNECTION_ATTEMPTS=10
MONGO_DB_INITIAL_CONNECTION_INTERVAL=1000
PORT=8000
TOKEN_TTL=172800
LOG_LEVEL=api:LOG|WARNING|ERROR|DEBUG
DEFAULT_TIMEOUT=90
```
Allowed log levels: LOG|WARNING|ERROR|DEBUG


Run the following commands:
```
$ npm install
```

## Running the app
### Development mode
```
npm run build
npm run dev
```

### Production mode
```
npm run build
npm run build-documentation
npm start:prod
```


TODO:
leitura de condutor após leitura de uma viatura
associar movimentos
usar cardNumber para mostrar visualmente

possibilidade de introduzir o cardNumber para gerar um movimento com confirmação visual

ecra para gestão de leitores

SITE:
dashboard com acesso publico
consultas para não admin
edição para admin

tipo de user para os leitores
usar TTL diferente para os leitores: infinito

mudar para node 10.16.3

```javascript

```
