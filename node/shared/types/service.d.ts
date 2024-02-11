import { Router } from "express";

interface ssl {
  cert: string,
  key: string,
}

interface kafkaOptions {
  clientId: string,
  brokers: string[],
  topics: {
    consumer: string,
    producer?: string
  }
  groupId: string,
  messageProcessor: any
}

export namespace Service {

  export interface Config {
    port: number,
    router: Router
    kafkaOptions: kafkaOptions
    ssl?: any
  }
  
  export interface Metadata {
    id: string,
    name: string,
  }
  
  export interface Producer {
    start: () => Promise<void>,
    shutdown: () => Promise<void>,
    send: (message: CustomMessageFormat) => Promise<void>
  }

  export interface Consumer {
    start: () => Promise<void>,
    shutdown: () => Promise<void>,
    subscribe: () => Promise<void>,
  }

}

