
import { Router } from "express"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/promotions", route)

  // Route to create a new promotion
  route.post("/", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const promotionService = req.scope.resolve("promotionService")
    const promotion = await promotionService.create(req.body)
    res.json({ promotion })
  }))

  // Route to update a promotion
  route.put("/:id", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const promotionService = req.scope.resolve("promotionService")
    const promotion = await promotionService.update(req.params.id, req.body)
    res.json({ promotion })
  }))

  // Route to delete a promotion
  route.delete("/:id", wrapHandler(async (req, res) => {
    const promotionService = req.scope.resolve("promotionService")
    await promotionService.delete(req.params.id)
    res.sendStatus(204)
  }))

  return app
}
