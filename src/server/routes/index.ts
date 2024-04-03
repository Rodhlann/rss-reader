import { Express } from 'express'
import { registerAuthRoutes } from './auth'
import { registerAdminRoutes } from './admin'
import { registerPublicRoutes } from './public'

export const registerRoutes = (app: Express) => {
  registerAuthRoutes(app)
  registerPublicRoutes(app)
  registerAdminRoutes(app)
}