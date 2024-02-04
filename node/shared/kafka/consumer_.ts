import { Service as Microservice } from '../../shared/types/service';
import Kafka, { KafkaConsumer as RdKafkaConsumer, ConsumerGlobalConfig, Message } from 'node-rdkafka';

export default class Consumer implements Microservice.Consumer {

  private name: string;
  private consumer: RdKafkaConsumer;
  private topic: any;

  constructor(options?: any) {
    this.topic = options.topic;
    this.consumer = this.create(options);
    this.name = options.topic.topics[0];
  }

  public async start(): Promise<void> {
    try {
      await this.subscribe();
      this.consumer.consume();
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

  public async shutdown(): Promise<void> {
    await new Promise(() => this.consumer.unsubscribe());
    await new Promise((resolve) => this.consumer.disconnect(resolve));
  }

  private create(options: any): RdKafkaConsumer {

    const { brokers, clientId, groupId } = options;

    const config: ConsumerGlobalConfig = {
      'metadata.broker.list': brokers,
      'group.id': groupId,
      'client.id': clientId,
    };

    const consumer = new Kafka.KafkaConsumer(config, {});

    consumer
      .on('ready', () => {
        console.log(`${this.name} consumer connected.`);
      })
      .on('data', (message: Message) => {
        const prefix = `${message.topic}[${message.partition} | ${message.offset}] / ${message.timestamp}`;
        console.log(`- ${prefix} ${message.key ? message.key.toString() : ''}#${message.value ? message.value.toString() : ''}`);
      });
    
    consumer.connect();

    return consumer;
  }
}
