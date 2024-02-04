import { ServiceConfig, ServiceMetadata } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

import Consumer from "../../shared/kafka/consumer";
import Producer from "../../shared/kafka/producer";


const config: ServiceConfig = {
  port: 8082,
  router: router,
  kafka: {
    clientId: 'kafka',
    brokers: ['localhost:9092'],
    producer: Producer,
    consumer: Consumer,
    topic: {
      topics: ['segment-combination'],
      fromBeginning: false
    },
    groupId: 'vision-middleware-units'
  }
}

const metadata: ServiceMetadata = {
  id: '0001',
  name: 'Segment-Combination'
}

const segmentService = new Service(config, metadata);

(async function () { 
  try {
    await segmentService.start(); 
  } catch (error) {
    console.error(error);
  }
  return;
})();


export default segmentService;