import { Service as Microservice, kafkaOptions } from '../../shared/types/service';
import { Kafka, Message, Producer as KafkaProducer, ProducerBatch, TopicMessages, ProducerConfig } from 'kafkajs'

interface CustomMessageFormat { 
  a: string 
}

class Producer implements Microservice.Producer {

  private name: string
  private producer: KafkaProducer
  private topic: string

  constructor(name: string, options: kafkaOptions) {
    this.name = name;
    this.producer = this.create(options);
    if (options.topics.producer) this.topic = options.topics.producer;
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

  public async send(message: CustomMessageFormat, topic?: string): Promise<void> {
    const kafkaMessage: Message = {
      value: JSON.stringify(message),
    };

    await this.producer.send({
      topic: topic ? topic : this.topic,
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

  private create(options: kafkaOptions) : KafkaProducer {

    const { brokers, clientId, topics } = options;
    
    const kafka = new Kafka({ 
      clientId: clientId,
      brokers: brokers
    })

    const config: ProducerConfig = {
      
    }

    const producer = kafka.producer(config);
    producer.on('producer.connect', async () => {console.log(`${this.name} producer connected.`)})
    return producer;
  }
}

export default Producer;