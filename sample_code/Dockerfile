FROM node:12.18.3-alpine AS BUILD_IMAGE
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --update python make g++\
   && rm -rf /var/cache/apk/*
RUN npm install
RUN npm install pm2@latest -g
COPY . .
RUN npm run build

FROM node:12.18.3-alpine
WORKDIR /usr/src/app
COPY --from=BUILD_IMAGE /usr/src/app/build ./build
COPY --from=BUILD_IMAGE /usr/src/app/config ./config
COPY --from=BUILD_IMAGE /usr/src/app/docs ./docs
COPY --from=BUILD_IMAGE /usr/src/app/locales ./locales
COPY --from=BUILD_IMAGE /usr/src/app/models ./models
COPY --from=BUILD_IMAGE /usr/src/app/proto ./proto
COPY --from=BUILD_IMAGE /usr/src/app/.env.local ./.env.local
COPY --from=BUILD_IMAGE /usr/src/app/.env.development ./.env.development
COPY --from=BUILD_IMAGE /usr/src/app/.env.development2 ./.env.development2
COPY --from=BUILD_IMAGE /usr/src/app/.env.development3 ./.env.development3
COPY --from=BUILD_IMAGE /usr/src/app/.env.preprod ./.env.preprod
COPY --from=BUILD_IMAGE /usr/src/app/.env.preprod2 ./.env.preprod2
COPY --from=BUILD_IMAGE /usr/src/app/.env.preprod3 ./.env.preprod3
COPY --from=BUILD_IMAGE /usr/src/app/.env.qa ./.env.qa
COPY --from=BUILD_IMAGE /usr/src/app/.env.qa2 ./.env.qa2
COPY --from=BUILD_IMAGE /usr/src/app/.env.qa3 ./.env.qa3
COPY --from=BUILD_IMAGE /usr/src/app/.env.production ./.env.production
COPY --from=BUILD_IMAGE /usr/src/app/package.json ./package.json
COPY --from=BUILD_IMAGE /usr/src/app/package-lock.json ./package-lock.json
COPY --from=BUILD_IMAGE /usr/src/app/liquibaseDbChangelog.xml ./liquibaseDbChangelog.xml
COPY --from=BUILD_IMAGE /usr/src/app/src ./src
RUN npm ci --only=production

RUN npm install
RUN apk add --no-cache openjdk8
RUN apk add bash
RUN mkdir /usr/src/app/liquibase
RUN wget https://github.com/liquibase/liquibase/releases/download/v4.11.0/liquibase-4.11.0.tar.gz -P /usr/src/app/liquibase
RUN tar -xvf /usr/src/app/liquibase/liquibase-4.11.0.tar.gz -C /usr/src/app/liquibase
RUN export PATH=$PATH:/usr/src/app/liquibase/liquibase
RUN ln -s /usr/src/app/liquibase/liquibase /usr/bin/liquibase

EXPOSE 8000
CMD ["npm", "start"]