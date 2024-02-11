import { Service as Microservice, kafkaOptions } from '../../shared/types/service';
import { Consumer as KafkaConsumer, ConsumerSubscribeTopics, EachBatchPayload, Kafka, EachMessagePayload, ConsumerConfig } from 'kafkajs'

class Consumer implements Microservice.Consumer {
  
  private name: string;
  private consumer: KafkaConsumer
  private topic: string;
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
      await this.subscribe();
      await this.consumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload;
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
          console.log(`- ${prefix} ${message.key}#${message.value}`);
          //parse message for params
          const request = JSON.parse(message.value!.toString());
          await this.handleMessage(request);
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
    await this.consumer.disconnect();
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

    const consumer = kafka.consumer(config);

    // add events
    consumer.on('consumer.connect', async () => {
      console.log(`${this.name} consumer connected.`)
    });

    return consumer;
  }

}

export default Consumer;