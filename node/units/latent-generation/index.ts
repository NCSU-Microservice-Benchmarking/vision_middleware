import { Service as Microservice } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

import handleLatentRequest from './utils/handleLatentRequest';

const config: Microservice.Config = {
  port: 8080,
  router: router,
  kafkaOptions: {
    clientId: process.env.KAFKA_CLIENT_ID!,
    brokers: [process.env.KAKFA_BROKER_URL!],
    topics: {
      consumer: 'latent-generation'
    },
    groupId: 'vision-middleware-units',
    messageProcessor: handleLatentRequest,
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