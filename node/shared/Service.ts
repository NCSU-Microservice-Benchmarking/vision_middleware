import express, { Application, Request, Response, NextFunction, Router } from 'express';
import http from 'http';
import https from 'https';
import fs from 'file-system';
import cors from 'cors';
import path from 'path';

import type { ServiceConfig, ServiceMetadata } from '../shared/types/service.d.ts';

export default class Service {

  public metadata: ServiceMetadata;

  // express server
  private app: Application;
  private port: number;
  private router: Router;
  private server: http.Server | https.Server;

  // kafka
  private producer: any; 
  private consumer: any;
  
  constructor(config: ServiceConfig, metadata: ServiceMetadata) {

    const { port, router, kafka } = config;

    this.app = express();
    this.port = port;
    this.router = router;
    this.metadata = metadata;

    this.configureMiddlewares();
    this.configureRoutes();
    this.configureKafka(kafka);
    this.createServer(config);
  }

  private configureMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(function (req: Request, res: Response, next: NextFunction) {
      res.setHeader('Access-Control-Allow-Origin', "*");
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      next();
    });
    this.app.use(cors());
    this.app.set('trust proxy', 1);
    this.app.disable('x-powered-by');
    this.app.use(require('cookie-parser')());
    this.app.use(require('body-parser').urlencoded({ extended: false }));
  }

  private configureRoutes(): void {
    const router = this.router; 
    this.app.use(router);
  }

  private configureKafka(kafka: any) {

    const { producer, consumer } = kafka;

    let options = kafka;
    delete options.producer; delete options.consumer;

    this.producer = new producer(options);
    this.consumer = new consumer(options);
  }

  public createServer(options: ServiceConfig): void {
    const { ssl } = options;
    if (ssl && process.env.NODE_ENV !== "production" && process.env.DOCKER !== 'true') {
      const httpsOptions: https.ServerOptions = {
        key: fs.readFileSync(path.resolve(__dirname, ssl.key)),
        cert: fs.readFileSync(path.resolve(__dirname, ssl.cert))
      }
      this.server = https.createServer(httpsOptions, this.app);
    } else {
      this.server = http.createServer(this.app);
    }
  }
  
  public start(): void {
    // start express server
    this.server.listen(this.port, () => {
      console.log(`${this.metadata.name} service listening on port ${this.port}`);
    });
    
    // start kafka
    const run = async () => {
      await this.producer.start();
      await this.consumer.start();
    };
    run().catch(console.error);
  }

  public stop(): void {
    // close express server
    this.server.close();
  
    // shutdown kafka
    const run = async () => {
      await this.producer.shutdown()
      await this.consumer.shutdown();
    };
    run().catch(console.error);
  }

}