
import { Router } from "express"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/institutes", route)

  // Route to create a new institute
  route.post("/", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const instituteService = req.scope.resolve("instituteService")
    const institute = await instituteService.create(req.body)
    res.json({ institute })
  }))

  // Route to update an institute
  route.put("/:id", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const instituteService = req.scope.resolve("instituteService")
    const institute = await instituteService.update(req.params.id, req.body)
    res.json({ institute })
  }))

  // Route to delete an institute
  route.delete("/:id", wrapHandler(async (req, res) => {
    const instituteService = req.scope.resolve("instituteService")
    await instituteService.delete(req.params.id)
    res.sendStatus(204)
  }))

  return app
}
