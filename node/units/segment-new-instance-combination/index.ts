import dotenv from 'dotenv';
dotenv.config();
import { Service as Microservice } from "../../shared/types/service";
import Service from "../../shared/Service";

import router from "./router";

import handleSegmentNewRequest from '../segment-new-instance-combination/utils/handleSegementNewRequest';

const config: Microservice.Config = {
  port: 7182,
  router: router,
  kafkaOptions: {
    clientId: process.env.KAFKA_CLIENT_ID!,
    brokers: [process.env.KAFKA_BROKER_URL!],
    topics: {
      consumer: 'segment-new-instance-combination',
      producer: 'instance-replacement'
    },
    groupId: 'vision-middleware-units',
    requestProcessor: handleSegmentNewRequest
  }
}

const metadata: Microservice.Metadata = {
  id: '0001',
  name: 'Segment-New-Instance-Combination'
}

const segmentNewService = new Service(config, metadata);

(async function main() { 
  try {
    await segmentNewService.start();
    return 0; 
  } catch (error) {
    console.error(error);
    return 1;
  }
})();