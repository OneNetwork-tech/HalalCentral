import { Router } from "express"

const route = Router()

export default (app) => {
  app.use("/health", route)

  route.get("/", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "HalalCentral API"
    })
  })

  return app
}