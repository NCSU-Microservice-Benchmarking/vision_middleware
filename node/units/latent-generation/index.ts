import dotenv from 'dotenv';
dotenv.config();
import { Service as Microservice } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

import handleLatentRequest from './utils/handleLatentRequest';

const config: Microservice.Config = {
  port: 8080,
  router: router,
  kafkaOptions: {
    clientId: process.env.KAFKA_CLIENT_ID!,
    brokers: [process.env.KAFKA_BROKER_URL!],
    topics: {
      consumer: 'latent_generation_request'
    },
    groupId: 'vision-middleware-units',
    requestProcessor: handleLatentRequest,
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
    return 0; 
  } catch (error) {
    console.error(error);
    return 1;
  }
})();