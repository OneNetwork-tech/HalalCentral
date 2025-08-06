
import { Router } from "express"
import * as cors from "cors"
import { projectConfig } from "../../../../medusa-config"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/claim-requests", route)

  const storeCors = cors(projectConfig.store_cors)

  // Route to create a new claim request
  route.post("/", storeCors, transformQuery({}, {}), wrapHandler(async (req, res) => {
    const claimRequestService = req.scope.resolve("claimRequestService")
    const claimRequest = await claimRequestService.create(req.body)
    res.json({ claimRequest })
  }))

  return app
}
