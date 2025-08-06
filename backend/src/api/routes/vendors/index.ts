import { Router } from "express"
import * as cors from "cors"
import { projectConfig } from "../../../../medusa-config"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/vendors", route)

  const storeCors = cors(projectConfig.store_cors)

  // Route to list all vendors
  route.get("/", storeCors, transformQuery({}, {}), wrapHandler(async (req, res) => {
    const vendorService = req.scope.resolve("vendorService")
    const vendors = await vendorService.list()
    res.json({ vendors })
  }))

  // Route to get a single vendor by id
  route.get("/:id", storeCors, wrapHandler(async (req, res) => {
    const vendorService = req.scope.resolve("vendorService")
    const vendor = await vendorService.findById(req.params.id)
    res.json({ vendor })
  }))

  return app
}