import { Router } from "express";
import { VendorService } from "../../../services/vendor";
import { SwedishBusinessVerificationService } from "../../../services/swedish-business-verification";

const router = Router();

export default (app: Router) => {
  app.use("/vendors", router);

  // Get all vendors with filtering and pagination
  router.get("/", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      
      const {
        page = 1,
        limit = 20,
        vendor_type,
        cuisine_type,
        city,
        postal_code,
        accepts_online_orders,
        offers_delivery,
        is_open_now,
        search,
        lat,
        lng,
        radius = 10
      } = req.query;

      const filters = {
        vendor_type,
        cuisine_type,
        city,
        postal_code,
        accepts_online_orders: accepts_online_orders === 'true',
        offers_delivery: offers_delivery === 'true',
        is_open_now: is_open_now === 'true',
        search: search as string,
        location: lat && lng ? { lat: parseFloat(lat as string), lng: parseFloat(lng as string), radius: parseFloat(radius as string) } : undefined
      };

      const result = await vendorService.listVendors({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters
      });

      res.json({
        vendors: result.vendors,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get vendor by ID
  router.get("/:id", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      const vendor = await vendorService.getVendor(req.params.id);
      
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      res.json({ vendor });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new vendor
  router.post("/", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      const verificationService = req.scope.resolve("swedishBusinessVerificationService") as SwedishBusinessVerificationService;
      
      const vendorData = req.body;

      // Validate Swedish business information
      if (vendorData.certifications?.organization_number?.number) {
        const orgValidation = await verificationService.verifyOrganizationNumber(
          vendorData.certifications.organization_number.number
        );
        
        if (!orgValidation.valid) {
          return res.status(400).json({ 
            error: "Invalid organization number", 
            details: orgValidation.error 
          });
        }

        vendorData.certifications.organization_number.verified = true;
        vendorData.certifications.organization_number.verified_at = new Date();
      }

      // Validate phone number
      if (vendorData.contact_info?.phone) {
        const phoneValidation = verificationService.validateSwedishPhoneNumber(vendorData.contact_info.phone);
        if (!phoneValidation.valid) {
          return res.status(400).json({ 
            error: "Invalid Swedish phone number format" 
          });
        }
      }

      // Validate postal code
      if (vendorData.address?.postal_code) {
        const postalValidation = verificationService.validateSwedishPostalCode(vendorData.address.postal_code);
        if (!postalValidation) {
          return res.status(400).json({ 
            error: "Invalid Swedish postal code format" 
          });
        }
      }

      const vendor = await vendorService.createVendor(vendorData);
      res.status(201).json({ vendor });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update vendor
  router.put("/:id", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      const vendor = await vendorService.updateVendor(req.params.id, req.body);
      
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      res.json({ vendor });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete vendor
  router.delete("/:id", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      await vendorService.deleteVendor(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get vendor menu (for QR code ordering)
  router.get("/:id/menu", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      const { lang = 'sv' } = req.query;
      
      const menu = await vendorService.getVendorMenu(req.params.id, lang as string);
      
      if (!menu) {
        return res.status(404).json({ error: "Menu not found" });
      }

      res.json({ menu });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate QR code for vendor
  router.post("/:id/qr-code", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      const qrCodeUrl = await vendorService.generateQRCode(req.params.id);
      
      res.json({ qr_code_url: qrCodeUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search vendors by location
  router.post("/search/location", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      const { lat, lng, radius = 10, filters = {} } = req.body;
      
      const vendors = await vendorService.searchByLocation(lat, lng, radius, filters);
      
      res.json({ vendors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get featured vendors
  router.get("/featured/list", async (req, res) => {
    try {
      const vendorService = req.scope.resolve("vendorService") as VendorService;
      const { limit = 10 } = req.query;
      
      const vendors = await vendorService.getFeaturedVendors(parseInt(limit as string));
      
      res.json({ vendors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
