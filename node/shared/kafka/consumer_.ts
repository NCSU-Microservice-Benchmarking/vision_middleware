import { Service as Microservice, kafkaOptions } from '../../shared/types/service';
import Kafka, { KafkaConsumer as RdKafkaConsumer, ConsumerGlobalConfig, Message } from 'node-rdkafka';

class Consumer implements Microservice.Consumer {

  private name: string;
  private consumer: RdKafkaConsumer;
  private topic: any;
  private messageProcessor: any;

  private producerCallback?: (topic: string, message: any) => Promise<void>;
  private producerTopic?: string;

  constructor(name: string, options: kafkaOptions, producerCallback: any) {
    const { topics, messageProcessor } = options;
    this.name = name;
    this.topic = topics.consumer;
    this.consumer = this.create(options);
    if (topics.producer) {
      this.producerCallback = producerCallback;
      this.producerTopic = topics.producer
    }
    this.messageProcessor = messageProcessor;
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

  /*public async startBatch(): Promise<void> {
    const consumerRunConfig: ConsumerRunConfig = {
      eachBatch: async (batch) => {
        for (const message of batch.messages) {
          const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
          console.log(`- ${prefix} ${message.key}#${message.value}`);
        }
      }
    };

    try {
      await this.subscribe();
      this.consumer.consume(consumerRunConfig);
    } catch (error) {
      console.log('Error: ', error);
    }
  }*/


  private async handleMessage(message: any): Promise<void> {
    try {
      // get a response
      const handled = await this.messageProcessor(message);
      // produce the message to the correct topic if it wasn't just handled by cache
      if (this.producerTopic && handled !== true) 
        await this.producerCallback!(this.producerTopic, handled);
      return;
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  public async shutdown(): Promise<void> {
    await new Promise(() => this.consumer.unsubscribe());
    await new Promise((resolve) => this.consumer.disconnect(resolve));
  }

  private create(options: any): RdKafkaConsumer {

    const { brokers, clientId, groupId } = options;

    const config: ConsumerGlobalConfig = {
      'metadata.broker.list': brokers[0],
      'group.id': groupId,
      'client.id': clientId,
    };

    const consumer = new Kafka.KafkaConsumer(config, {});

    consumer
      .on('ready', () => {
        console.log(`${this.name} consumer connected.`);
      })
      .on('data', async (messagePayload: Kafka.Message) => {
        const { topic, partition, value, offset, key, timestamp } = messagePayload;
        const prefix = `${topic}[${partition} | ${offset}] / ${timestamp}`
        console.log(`- ${prefix} ${key}#${value}`);
        //parse message for params
        const request = JSON.parse(value!.toString());
        await this.handleMessage(request);
      });

    return consumer;
  }
}

export default Consumer;