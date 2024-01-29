
import { Consumer as KafkaConsumer, ConsumerSubscribeTopics, EachBatchPayload, Kafka, EachMessagePayload } from 'kafkajs'

class Consumer {
  
  private consumer: KafkaConsumer
  private messageProcessor: any

  constructor(options?: any, messageProcessor?: any) {
    //this.messageProcessor = messageProcessor
    this.consumer = this.create(options);
  }

  public async start(): Promise<void> {

    try {
      await this.consumer.connect();
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

  public async subscribe(topic: ConsumerSubscribeTopics): Promise<void> {
    try {
      await this.consumer.subscribe(topic);
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

  private create(options): KafkaConsumer {
    const { brokers, clientId, groupId } = options
    const kafka = new Kafka({ 
      clientId: clientId,
      brokers: brokers
    })
    const consumer = kafka.consumer({ groupId: groupId ? groupId : 'consumer-group' });
    consumer.on('consumer.connect', async () => {console.log('consumer connected')})
    return consumer;
  }
}

export default Consumer;