import { Kafka, Message, Producer as KafkaProducer, ProducerBatch, TopicMessages } from 'kafkajs'

interface CustomMessageFormat { a: string }

class Producer {
  private producer: KafkaProducer

  constructor() {
    this.producer = this.create();
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

  public async sendBatch(messages: Array<CustomMessageFormat>): Promise<void> {
    const kafkaMessages: Array<Message> = messages.map((message) => {
      return {
        value: JSON.stringify(message)
      }
    })

    const topicMessages: TopicMessages = {
      topic: 'producer-topic',
      messages: kafkaMessages
    }

    const batch: ProducerBatch = {
      topicMessages: [topicMessages]
    }

    await this.producer.sendBatch(batch)
  }

  private create() : KafkaProducer {
    const kafka = new Kafka({
      clientId: 'producer-client',
      brokers: ['localhost:9092'],
    })

    return kafka.producer();
  }
}

export default Producer;