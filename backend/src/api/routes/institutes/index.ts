import { Router } from "express"
import * as cors from "cors"
import { projectConfig } from "../../../../medusa-config"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/institutes", route)

  const storeCors = cors(projectConfig.store_cors)

  // Route to list all institutes
  route.get("/", storeCors, transformQuery({}, {}), wrapHandler(async (req, res) => {
    const instituteService = req.scope.resolve("instituteService")
    const institutes = await instituteService.list()
    res.json({ institutes })
  }))

  // Route to get a single institute by id
  route.get("/:id", storeCors, wrapHandler(async (req, res) => {
    const instituteService = req.scope.resolve("instituteService")
    const institute = await instituteService.findById(req.params.id)
    res.json({ institute })
  }))

  return app
}