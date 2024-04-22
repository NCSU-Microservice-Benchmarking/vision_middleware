import { Service as Microservice, kafkaOptions } from '../types/service';
import { request, requestProcessor } from '../types/request';
import { Consumer as KafkaConsumer, ConsumerSubscribeTopics, EachBatchPayload, Kafka, EachMessagePayload, ConsumerConfig } from 'kafkajs'

class Consumer implements Microservice.Consumer {
  
  private name: string;
  private consumer: KafkaConsumer;
  private topic: string;
  private requestProcessor: requestProcessor;

  private producerCallback?: (topic: string, message: any) => Promise<void>;
  private producerTopic?: string;

  constructor(name: string, options: kafkaOptions, producerCallback: any) {
    const { topics, requestProcessor } = options;
    this.name = name;
    this.topic = topics.consumer;
    this.consumer = this.create(options);
    if (topics.producer) {
      this.producerCallback = producerCallback;
      this.producerTopic = topics.producer;
    }
    this.requestProcessor = requestProcessor;
  }

  public async start(): Promise<void> {
    try {
      await this.subscribe();
      await this.consumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          await this.handleMessage(messagePayload);
          return;
        }
      });

    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async subscribe(): Promise<void> {
    try {
      const topic: ConsumerSubscribeTopics = {
        topics: [this.topic],
        fromBeginning: false
      }
      await this.consumer.subscribe(topic);
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  private async handleMessage(messagePayload: EachMessagePayload): Promise<void> {
    try {

      // log message
      const { topic, partition, message } = messagePayload;
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
      console.log(`- ${prefix} ${message.key}#${message.value}`);

      // parse message for params
      const request: request = JSON.parse(message.value!.toString());

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
    await this.consumer.disconnect();
  }

  private addEventListeners(consumer: KafkaConsumer): KafkaConsumer {
    consumer.on('consumer.connect', async () => {
      console.log(`${this.name} consumer connected.`)
    })
    return consumer;
  }

  private create(options: kafkaOptions): KafkaConsumer {

    const { brokers, clientId, groupId } = options;
    
    const kafka = new Kafka({ 
      clientId: clientId,
      brokers: brokers
    });

    const config: ConsumerConfig = {
      groupId: groupId
    }

    const consumer = this.addEventListeners(kafka.consumer(config));
    
    return consumer;
  }

}

export default Consumer;