
import { Router } from "express"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/events", route)

  // Route to create a new event
  route.post("/", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const eventService = req.scope.resolve("eventService")
    const event = await eventService.create(req.body)
    res.json({ event })
  }))

  // Route to update an event
  route.put("/:id", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const eventService = req.scope.resolve("eventService")
    const event = await eventService.update(req.params.id, req.body)
    res.json({ event })
  }))

  // Route to delete an event
  route.delete("/:id", wrapHandler(async (req, res) => {
    const eventService = req.scope.resolve("eventService")
    await eventService.delete(req.params.id)
    res.sendStatus(204)
  }))

  return app
}
