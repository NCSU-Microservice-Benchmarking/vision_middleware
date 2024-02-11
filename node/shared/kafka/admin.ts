import { Service as Microservice, kafkaOptions } from '../../shared/types/service';
import { Kafka, Admin as KafkaAdmin } from 'kafkajs';

class Admin {
  
  private admin: KafkaAdmin

  constructor(options: kafkaOptions) {
    this.admin = this.create(options);
  }

  private create(options: kafkaOptions) : KafkaAdmin {
    const { clientId, brokers } = options;
    const kafka = new Kafka({
      clientId: clientId,
      brokers: brokers,
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