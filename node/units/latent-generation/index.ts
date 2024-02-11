import { Service as Microservice } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

import generateLatent from './utils/generateLatent';

const config: Microservice.Config = {
  port: 8080,
  router: router,
  kafkaOptions: {
    clientId: 'kafka',
    brokers: ['localhost:9092'],
    topics: {
      consumer: 'latent-generation'
    },
    groupId: 'vision-middleware-units',
    messageProcessor: generateLatent,
  }
}

const metadata: Microservice.Metadata = {
  id: '0001',
  name: 'Latent-Generation'
}

const latentService = new Service(config, metadata);


(async function main() { 
  try {
    await latentService.start(); 
  } catch (error) {
    console.error(error);
  }
  return;
})();