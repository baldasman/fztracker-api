# BUILD stage.
FROM node:11.15-alpine as buildStage

RUN apk --no-cache add --virtual builds-deps build-base python

WORKDIR /app

# Copy only relevant files and install dependencies.
COPY package.json package-lock.json ./
RUN npm ci

# Copy all local files into the image. # src/ src/ maybe?
COPY . .

# Build the project.
RUN npm run build


# PUBLISH stage.
FROM node:11.15-alpine as publishStage

COPY --from=buildStage /app/dist         /app
COPY --from=buildStage /app/node_modules /app/node_modules

ARG BUILD=latest
ENV BUILD=$BUILD

WORKDIR /app

CMD ["node", "/app/main.js"]
