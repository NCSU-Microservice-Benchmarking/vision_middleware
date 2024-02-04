import { Service as Microservice } from '../../shared/types/service';
import Kafka, { Producer as RdKafkaProducer, LibrdKafkaError, ProducerGlobalConfig, TopicConfig } from 'node-rdkafka';

interface CustomMessageFormat {
  a: string;
}

class Producer implements Microservice.Producer {

  public name: string;
  private producer: RdKafkaProducer;
  private topic: any;

  constructor(options?: any) {
    this.producer = this.create(options);
    this.topic = options.topic;
    this.name = options.topic.topics[0];
  }

  public async start(): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.producer.connect({}, (err: LibrdKafkaError) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`Error connecting ${this.name} producer:`, error);
    }
  }

  public async shutdown(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.producer.disconnect((err: Error) => {
        if (err) {
          console.error(`Error disconnecting ${this.name} producer:`, err);
          reject(err);
        } else {
          console.log(`${this.name} producer disconnected.`);
          resolve();
        }
      });
    });
  }

  public async send(message: CustomMessageFormat): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.producer.produce(
        this.topic,
        null,
        Buffer.from(JSON.stringify(message)),
        null,
        Date.now(),
        (err: LibrdKafkaError, offset: any) => {
          if (err) {
            console.error(`Error sending message from ${this.name} producer:`, err);
            reject(err);
          } else {
            console.log(`Message sent to ${this.name} at offset ${offset}`);
            resolve();
          }
        }
      );
    });
  }

  // Additional method for sending batches
  public async sendBatch(messages: Array<CustomMessageFormat>): Promise<void> {
    // Implement batch sending logic here
    // Note: The node-rdkafka library doesn't have a direct equivalent for batch sending as in kafkajs
  }

  private create(options: any): RdKafkaProducer {
    const { brokers, clientId, topic } = options;

    const producerOptions: ProducerGlobalConfig = {
      "client.id": clientId,
      "metadata.broker.list": brokers,
      'message.send.max.retries': 10,
      'socket.keepalive.enable': true,
      'queue.buffering.max.messages': 100000,
      'queue.buffering.max.ms': 1000,
      'batch.num.messages': 1000000,
    };

    const producer = new Kafka.Producer(producerOptions);

    // set event listeners
    producer
      .on('ready', () => {
        console.log(`${this.name} producer connected.`);
      })
      .on('event.error', (err: LibrdKafkaError) => {
        console.error(`Error in ${this.name} producer:`, err);
      });

    producer.setPollInterval(100);

    return producer;
  }
}

export default Producer;