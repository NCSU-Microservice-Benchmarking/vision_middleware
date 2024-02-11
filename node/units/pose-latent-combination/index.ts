import { Service as Microservice } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

const config: Microservice.Config = {
  port: 8081,
  router: router,
  kafkaOptions: {
    clientId: 'kafka',
    brokers: ['localhost:9092'],
    topics: {
      consumer: 'pose-estimation',
      producer: 'instance-replacement'
    },
    groupId: 'vision-middleware-units',
    messageProcessor: () => {}
  }
}

const metadata: Microservice.Metadata = {
  id: '0001',
  name: 'Pose-Estimation'
}

const poseService = new Service(config, metadata);

(async function main() { 
  try {
    await poseService.start(); 
  } catch (error) {
    console.error(error);
  }
  return;
})();
