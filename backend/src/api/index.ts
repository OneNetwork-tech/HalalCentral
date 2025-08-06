import { Router } from "express"
import adminVendors from "./routes/admin/vendors"
import adminInstitutes from "./routes/admin/institutes"
import adminEvents from "./routes/admin/events"
import adminPromotions from "./routes/admin/promotions"
import adminClaimRequests from "./routes/admin/claim-requests"
import storeVendors from "./routes/vendors"
import storeInstitutes from "./routes/institutes"
import storeEvents from "./routes/events"
import storePromotions from "./routes/promotions"
import storeClaimRequests from "./routes/claim-requests"
import health from "./routes/health"

export default () => {
  const app = Router()

  adminVendors(app)
  adminInstitutes(app)
  adminEvents(app)
  adminPromotions(app)
  adminClaimRequests(app)
  storeVendors(app)
  storeInstitutes(app)
  storeEvents(app)
  storePromotions(app)
  storeClaimRequests(app)
  health(app)

  return app
}