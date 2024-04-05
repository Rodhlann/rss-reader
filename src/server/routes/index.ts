import { Express } from 'express'
import { registerAdminRoutes } from './admin'
import { registerPublicRoutes } from './public'

export const registerRoutes = (app: Express) => {
  registerPublicRoutes(app)
  registerAdminRoutes(app)
}