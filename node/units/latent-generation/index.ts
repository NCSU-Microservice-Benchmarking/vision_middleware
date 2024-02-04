import { ServiceConfig, ServiceMetadata } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

import Consumer from "../../shared/kafka/consumer";
import Producer from "../../shared/kafka/producer";

const config: ServiceConfig = {
  port: 8080,
  router: router,
  kafka: {
    clientId: 'kafka',
    brokers: ['localhost:9092'],
    producer: Producer,
    consumer: Consumer,
    topic: {
      topics: ['latent-generation'],
      fromBeginning: false
    },
    groupId: 'vision-middleware-units'
  }
}

const metadata: ServiceMetadata = {
  id: '0001',
  name: 'Latent-Generation'
}

const latentService = new Service(config, metadata);

(async function () { 
  try {
    await latentService.start(); 
  } catch (error) {
    console.error(error);
  }
  return;
})();

export default latentService;