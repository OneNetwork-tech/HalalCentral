
import { Router } from "express"
import { transformQuery, wrapHandler } from "@medusajs/medusa"

const route = Router()

export default (app) => {
  app.use("/claim-requests", route)

  // Route to list all claim requests
  route.get("/", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const claimRequestService = req.scope.resolve("claimRequestService")
    const claimRequests = await claimRequestService.list()
    res.json({ claimRequests })
  }))

  // Route to update a claim request
  route.put("/:id", transformQuery({}, {}), wrapHandler(async (req, res) => {
    const claimRequestService = req.scope.resolve("claimRequestService")
    const claimRequest = await claimRequestService.update(req.params.id, req.body)
    res.json({ claimRequest })
  }))

  return app
}
