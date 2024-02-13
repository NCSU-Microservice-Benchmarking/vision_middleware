import { Service as Microservice, kafkaOptions } from '../types/service';
import Kafka, { GlobalConfig, IAdminClient as RdKafkaAdmin, AdminClient } from 'node-rdkafka';

class Admin implements Microservice.Admin {
  
  private admin: RdKafkaAdmin

  constructor(options: kafkaOptions) {
    this.admin = this.create(options);
  }

  private create(options: kafkaOptions): RdKafkaAdmin {
    const { clientId, brokers } = options;

    const config: GlobalConfig = {
      'client.id': clientId,
      'metadata.broker.list': brokers.join(','), // Comma-separated list of broker endpoints
    };
    const admin: RdKafkaAdmin = AdminClient.create(config);
    return admin;
  }

  public async shutdown(): Promise<void> {
    this.admin.disconnect();
  }
}

export default Admin;
