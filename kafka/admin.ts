import { Kafka, Admin as KafkaAdmin } from 'kafkajs'

class Admin {
  private admin: KafkaAdmin

  constructor() {
    this.admin = this.create();
  }

  private create() : KafkaAdmin {
    const kafka = new Kafka({
      clientId: 'producer-client',
      brokers: ['localhost:9092'],
    })
    return kafka.admin();
  }

  public async start(): Promise<void> {
    try {
      await this.admin.connect();
    } catch (error) {
      console.log('Error connecting the admin: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.admin.disconnect()
  }

}

export default Admin;