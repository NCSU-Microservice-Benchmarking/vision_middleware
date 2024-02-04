import { Service as Microservice } from '../../shared/types/service';
import { Kafka, Message, Producer as KafkaProducer, ProducerBatch, TopicMessages, ProducerConfig } from 'kafkajs'

interface CustomMessageFormat { 
  a: string 
}

class Producer implements Microservice.Producer {

  private producer: KafkaProducer
  private topic: any

  constructor(options?: any) {
    this.producer = this.create(options);
    this.topic = options.topic;
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (error) {
      console.log('Error connecting the producer: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer.disconnect()
  }

  public async send(message: CustomMessageFormat): Promise<void> {
    const kafkaMessage: Message = {
      value: JSON.stringify(message),
    };

    await this.producer.send({
      topic: this.topic,
      messages: [kafkaMessage],
    });
  }

  public async sendBatch(messages: Array<CustomMessageFormat>): Promise<void> {
    const kafkaMessages: Array<Message> = messages.map((message) => {
      return {
        value: JSON.stringify(message)
      }
    })

    const topicMessages: TopicMessages = {
      topic: this.topic,
      messages: kafkaMessages
    }

    const batch: ProducerBatch = {
      topicMessages: [topicMessages]
    }

    await this.producer.sendBatch(batch)
  }

  private create(options: any) : KafkaProducer {

    const { brokers, clientId, topic } = options;
    
    const kafka = new Kafka({ 
      clientId: clientId,
      brokers: brokers
    })

    const config: ProducerConfig = {
      
    }

    const producer = kafka.producer(config);
    producer.on('producer.connect', async () => {console.log(`${topic.topics[0]} producer connected.`)})
    return producer;
  }
}

export default Producer;