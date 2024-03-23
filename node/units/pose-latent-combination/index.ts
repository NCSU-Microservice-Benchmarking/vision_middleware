import dotenv from 'dotenv';
dotenv.config();
import { Service as Microservice } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";
import handlePoseRequest from './utils/handlePoseRequest'

const config: Microservice.Config = {
  port: 7181,
  router: router,
  kafkaOptions: {
    clientId: process.env.KAFKA_CLIENT_ID!,
    brokers: [process.env.KAFKA_BROKER_URL!],
    topics: {
      consumer: 'pose-latent-combination',
      producer: 'instance-synthesis'
    },
    groupId: 'vision-middleware-units',
    requestProcessor: handlePoseRequest
  }
}

const metadata: Microservice.Metadata = {
  id: '0001',
  name: 'Pose-Latent-Combination'
}

const poseService = new Service(config, metadata);

(async function main() { 
  try {
    await poseService.start();
    return 0; 
  } catch (error) {
    console.error(error);
    return 1;
  }
})();
