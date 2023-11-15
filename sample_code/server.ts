import express from 'express'
import { resolve } from 'path'
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
import { sequelize } from './src/models/sequelize';
const bodyParser = require('body-parser')
import { startGRPServer } from './src/util/grpc'
import { default as v1indexRoutes } from './src/v1/routes/index'
import rabbitMQService from './src/util/rabbitmqcon'
import {LiquibaseConfig, Liquibase, POSTGRESQL_DEFAULT_CONFIG, LiquibaseLogLevels} from "liquibase";
// localzation
const i18next = require('i18next')
const locales = resolve(__dirname, '../locales')
const i18nextMiddleware = require('i18next-http-middleware')
const Backend = require('i18next-fs-backend')
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocumentV1 from './docs/v1/swagger.json'
import axios from 'axios';
const app = express() // initialize the express server
i18next
  .use(i18nextMiddleware.LanguageDetector)
  .use(Backend)
  .init({
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: locales + '/{{lng}}/{{ns}}.json',
    },
    debug: false,
    detection: {
      order: ['querystring', 'cookie'],
      caches: ['cookie'],
    },
    preload: ['en', 'ar'],
    saveMissing: false,
    fallbackLng: 'ar',
  })

app.use(i18nextMiddleware.handle(i18next))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/v1', v1indexRoutes)

app.use('/v1/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocumentV1))

// Start Rabbit MQ
rabbitMQService.consumeMessageFromQueue();
startGRPServer();

// Define the port to run the server. this could either be defined // in the environment variables or directly as shown below
app.listen(process.env.PORT || 4000, () => {
  console.log(`Property Service is running fine on ${process.env.PORT || 4000}`)
})


// Define the liquibase setup files and config

async function exitHandler(options: any, exitCode: any) {
  await sequelize.query('update databasechangeloglock set locked=false')
  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

var NODE_ENV = process.env.NODE_ENV || "development";
const config = require(resolve(__dirname, "../config/config.json"))[
  NODE_ENV
];

const myConfig: LiquibaseConfig = {
  ...POSTGRESQL_DEFAULT_CONFIG,
  changeLogFile: 'liquibaseDbChangelog.xml',
  url: `jdbc:postgresql://${config.host || config.replication.write.host}:5432/${config.database}?reconnect=true`,
  username: `${config.username || config.replication.write.username}`,
  password: `${config.password || config.replication.write.password}`,
logLevel: LiquibaseLogLevels.Off
};
const instance = new Liquibase(myConfig);

const liquibase = async() =>{
  let params={
    labels:"Changes from Server",
    contexts:"1"
  }

  try {
    // await instance.status();
  } catch (error) {
    console.log("Liquibase status fail");
  }

  try {
    await instance.update({});
  } catch (error :any) {
    axios({
        method: 'post',
        url: `${process.env.BACKEND_API_URL}misc/v2/liquibaseErrorNotification`,
        data: {error: error.message},
        headers:{
            'Content-Type': 'application/json'
          }
      });
    console.log('Liquibase update fail');
}
}
liquibase();

