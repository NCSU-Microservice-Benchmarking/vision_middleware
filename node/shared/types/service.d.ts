import { Router } from "express";

interface ssl {
  cert: string,
  key: string,
}

export interface ServiceConfig {
  port: number,
  router: Router
  kafka: any;
  ssl?: any
}

export interface ServiceMetadata {
  id: string,
  name: string,
}