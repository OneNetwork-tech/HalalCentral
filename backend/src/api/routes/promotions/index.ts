
import { Router } from "express"
import * as cors from "cors"
import { projectConfig } from "../../../../medusa-config"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/promotions", route)

  const storeCors = cors(projectConfig.store_cors)

  // Route to list all promotions
  route.get("/", storeCors, transformQuery({}, {}), wrapHandler(async (req, res) => {
    const promotionService = req.scope.resolve("promotionService")
    const promotions = await promotionService.list()
    res.json({ promotions })
  }))

  // Route to get a single promotion by id
  route.get("/:id", storeCors, wrapHandler(async (req, res) => {
    const promotionService = req.scope.resolve("promotionService")
    const promotion = await promotionService.findById(req.params.id)
    res.json({ promotion })
  }))

  return app
}
