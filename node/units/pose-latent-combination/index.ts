import { ServiceConfig, ServiceMetadata } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

import Consumer from "../../shared/kafka/consumer";
import Producer from "../../shared/kafka/producer";


const config: ServiceConfig = {
  port: 8081,
  router: router,
  kafka: {
    clientId: 'kafka',
    brokers: ['localhost:9092'],
    producer: Producer,
    consumer: Consumer,
    topic: {
      topics: ['pose-estimation'],
      fromBeginning: false
    },
  }
}

const metadata: ServiceMetadata = {
  id: '0001',
  name: 'Pose-Estimation'
}

const poseService = new Service(config, metadata);
export default poseService;