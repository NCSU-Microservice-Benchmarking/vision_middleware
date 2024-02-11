import { Service as Microservice, kafkaOptions } from '../types/service';
import Kafka, { Producer as RdKafkaProducer, LibrdKafkaError, ProducerGlobalConfig, TopicConfig } from 'node-rdkafka';

interface CustomMessageFormat {
  a: string;
}

class Producer implements Microservice.Producer {

  public name: string;
  private producer: RdKafkaProducer;
  private topic: string;

  constructor(name: string, options: kafkaOptions) {
    this.name = name;
    this.producer = this.create(options);
    if (options.topics.producer) this.topic = options.topics.producer;
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
    return new Promise<void>(async (resolve, reject) => {
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

  private addEventListeners(producer: RdKafkaProducer): RdKafkaProducer {
    // set event listeners
    producer
      .on('ready', () => {
        console.log(`${this.name} producer connected.`);
      })
      .on('event.error', (err: LibrdKafkaError) => {
        console.error(`Error in ${this.name} producer:`, err);
      })
      .on('connection.failure', (err: LibrdKafkaError) => {
        console.error(`Connection failure in ${this.name} producer:`, err);
      });
    return producer;
  }

  private create(options: any): RdKafkaProducer {
    const { brokers, clientId } = options;

    const producerOptions: ProducerGlobalConfig = {
      "client.id": clientId,
      "metadata.broker.list": brokers[0],
      'message.send.max.retries': 10,
      'socket.keepalive.enable': true,
      'queue.buffering.max.messages': 100000,
      'queue.buffering.max.ms': 1000,
      'batch.num.messages': 1000000,
    };

    const producer = this.addEventListeners(new Kafka.Producer(producerOptions));
    
    producer.setPollInterval(100);

    return producer;
  }

}

export default Producer;