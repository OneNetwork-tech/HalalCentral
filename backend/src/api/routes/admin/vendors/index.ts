
import { Router } from "express"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/vendors", route)

  // Route to create a new vendor
  route.post("/", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const vendorService = req.scope.resolve("vendorService")
    const vendor = await vendorService.create(req.body)
    res.json({ vendor })
  }))

  // Route to update a vendor
  route.put("/:id", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const vendorService = req.scope.resolve("vendorService")
    const vendor = await vendorService.update(req.params.id, req.body)
    res.json({ vendor })
  }))

  // Route to delete a vendor
  route.delete("/:id", wrapHandler(async (req, res) => {
    const vendorService = req.scope.resolve("vendorService")
    await vendorService.delete(req.params.id)
    res.sendStatus(204)
  }))

  return app
}
