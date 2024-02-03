
import { Consumer as KafkaConsumer, ConsumerSubscribeTopics, EachBatchPayload, Kafka, EachMessagePayload, ConsumerConfig } from 'kafkajs'

class Consumer {
  
  private consumer: KafkaConsumer
  private topic: ConsumerSubscribeTopics;
  //private messageProcessor: any

  constructor(options?: any, messageProcessor?: any) {
    this.topic = options.topic;
    this.consumer = this.create(options);
  }

  public async start(): Promise<void> {

    try {
      await this.subscribe();
      await this.consumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
          console.log(`- ${prefix} ${message.key}#${message.value}`)
        }
      });

    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async subscribe(): Promise<void> {
    try {
      await this.consumer.subscribe(this.topic);
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async startBatch(): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: ['example-topic'],
      fromBeginning: false
    }

    try {
      await this.consumer.connect()
      await this.consumer.subscribe(topic)
      await this.consumer.run({
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload
          for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`
            console.log(`- ${prefix} ${message.key}#${message.value}`) 
          }
        }
      })
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.consumer.disconnect();
  }

  private create(options: any): KafkaConsumer {
    const { brokers, clientId, groupId, topic } = options;
    const kafka = new Kafka({ 
      clientId: clientId,
      brokers: brokers
    });

    const config: ConsumerConfig = {
      groupId: groupId
    }
    const consumer = kafka.consumer(config);
    consumer.on('consumer.connect', async () => {console.log(`${topic.topics[0]} consumer connected.`)})
    return consumer;
  }
}

export default Consumer;