import { Router } from "express";

interface ssl {
  cert: string,
  key: string,
}

interface kafkaOptions {
  clientId: string,
  brokers: string[],
  producer: typeof Producer,
  consumer: typeof Consumer,
  topic: {
    topics: string[],
    fromBeginning?: boolean
  },
  groupId: string
}

export namespace Service {

  export interface Config {
    port: number,
    router: Router
    kafka: kafkaOptions
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

