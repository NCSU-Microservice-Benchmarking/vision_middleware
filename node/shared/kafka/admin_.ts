import { kafkaOptions } from '../../shared/types/service';
import Kafka, { GlobalConfig, IAdminClient, AdminClient as KafkaAdmin } from 'node-rdkafka';

class Admin {
  
  private admin: KafkaAdmin

  constructor(options: kafkaOptions) {
    this.admin = this.create(options);
  }

  private create(options: kafkaOptions): KafkaAdmin {
    const { clientId, brokers } = options;

    const config: GlobalConfig = {
      'client.id': clientId,
      'metadata.broker.list': brokers.join(','), // Comma-separated list of broker endpoints
    };
    const admin: IAdminClient = Kafka.AdminClient.create(config);
    return admin;
  }

  public async shutdown(): Promise<void> {
    await this.admin.disconnect();
  }
}

export default Admin;
