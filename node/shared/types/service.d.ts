import { Router } from "express";
import { request, requestProcessor } from "./request";

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
  requestProcessor: requestProcessor
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
    send: producerCallback
  }

  export namespace Consumer {
    export type producerCallback = (message: request, topic?: string) => Promise<void>
  }

  export interface Consumer {
    start: () => Promise<void>,
    shutdown: () => Promise<void>,
    subscribe: () => Promise<void>,
  }

  export interface Admin {
    start?: () => Promise<void>,
    shutdown: () => Promise<void>,
  }

}

