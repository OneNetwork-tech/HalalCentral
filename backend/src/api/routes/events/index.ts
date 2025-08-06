
import { Router } from "express"
import * as cors from "cors"
import { projectConfig } from "../../../../medusa-config"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/events", route)

  const storeCors = cors(projectConfig.store_cors)

  // Route to list all events
  route.get("/", storeCors, transformQuery({}, {}), wrapHandler(async (req, res) => {
    const eventService = req.scope.resolve("eventService")
    const events = await eventService.list()
    res.json({ events })
  }))

  // Route to get a single event by id
  route.get("/:id", storeCors, wrapHandler(async (req, res) => {
    const eventService = req.scope.resolve("eventService")
    const event = await eventService.findById(req.params.id)
    res.json({ event })
  }))

  return app
}
