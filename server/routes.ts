import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
  
  // Explicitly serve static files from public directory
  app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

  const httpServer = createServer(app);

  return httpServer;
}
