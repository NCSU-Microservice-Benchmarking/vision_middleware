import { Service as Microservice, kafkaOptions } from '../types/service';
import { requestProcessor } from '../types/request';
import Kafka, { KafkaConsumer as RdKafkaConsumer, ConsumerGlobalConfig } from 'node-rdkafka';

import { request } from '../types/request';

class Consumer implements Microservice.Consumer {

  private name: string;
  private consumer: RdKafkaConsumer;
  private topic: string;
  private requestProcessor: requestProcessor;

  private producerCallback?: (topic: string, message: any) => Promise<void>;
  private producerTopic?: string;

  constructor(name: string, options: kafkaOptions, producerCallback: any) {
    const { topics, requestProcessor } = options;
    this.name = name;
    this.topic = topics.consumer;
    this.consumer = this.create(options);
    // set a producer callback to send response from request processor
    if (topics.producer) {
      this.producerCallback = producerCallback;
      this.producerTopic = topics.producer
    }
    this.requestProcessor = requestProcessor;
  }

  public async start(): Promise<void> {
    try {
      this.consumer.connect({}, async () => {
        await this.subscribe();
        this.consumer.consume();
      });
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  public async subscribe(): Promise<void> {
    try {
      this.consumer.subscribe([this.topic]);
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  private async handleMessage(message: Kafka.Message): Promise<void> {
    try {

      // log message
      const { topic, partition, value, offset, key, timestamp } = message;
      const prefix = `${topic}[${partition} | ${offset}] / ${timestamp}`
      console.log(`- ${prefix} ${key}#${value}`);

      // parse message for the request
      const request: request = JSON.parse(value!.toString());

      // get a response
      const response: boolean | request = await this.requestProcessor(request);

      // produce the message to the correct topic if it wasn't just handled by cache (that would return true)
      response && this.producerTopic && response !== true && 
        await this.producerCallback!(this.producerTopic, response);
      return;

    } catch (error) {
      console.error('Error handling message:', error);
      return;
    }
  }

  public async shutdown(): Promise<void> {
    await new Promise(() => this.consumer.unsubscribe());
    await new Promise((resolve) => this.consumer.disconnect(resolve));
  }

  private addEventListeners(consumer: RdKafkaConsumer): RdKafkaConsumer {
    consumer
      .on('ready', () => {
        console.log(`${this.name} consumer connected.`);
      })
      .on('data', async (messagePayload: Kafka.Message) => {
        await this.handleMessage(messagePayload);
        return;
      })
      .on('subscribed', async (topics: Kafka.SubscribeTopicList) => {
        topics.map((topic: Kafka.SubscribeTopic) => {
          console.log(`${this.name} consumer subscribed to topic '${topic}'.`);
        })
        return;
      })
      .on('unsubscribed', () => {
        console.log(`${this.name} unsubscribed.`);
        return;
      })
      .on('event.error', (err) => {
        console.error(`Error in ${this.name} producer:`, err);
      })
      ;
    return consumer;
  }

  private create(options: any): RdKafkaConsumer {

    const { brokers, clientId, groupId } = options;

    const config: ConsumerGlobalConfig = {
      'metadata.broker.list': brokers[0],
      'group.id': groupId,
      'client.id': clientId,
    };

    const consumer = this.addEventListeners(new Kafka.KafkaConsumer(config, {}));
    return consumer;
  }
}

export default Consumer;