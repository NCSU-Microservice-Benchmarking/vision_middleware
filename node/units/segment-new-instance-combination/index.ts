import { Service as Microservice } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

const config: Microservice.Config = {
  port: 8082,
  router: router,
  kafkaOptions: {
    clientId: 'kafka',
    brokers: ['localhost:9092'],
    topics: {
      consumer: 'segment-bombination',
      producer: 'instance-replacement'
    },
    groupId: 'vision-middleware-units',
    messageProcessor: () => {}
  }
}

const metadata: Microservice.Metadata = {
  id: '0001',
  name: 'Segment-Combination'
}

const segmentService = new Service(config, metadata);

(async function main() { 
  try {
    await segmentService.start(); 
  } catch (error) {
    console.error(error);
  }
  return;
})();