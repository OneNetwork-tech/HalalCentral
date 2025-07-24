import { Router } from "express";
import { InstituteService } from "../../../services/institute";
import { SwedishBusinessVerificationService } from "../../../services/swedish-business-verification";

const router = Router();

export default (app: Router) => {
  app.use("/institutes", router);

  // Get all institutes with filtering and pagination
  router.get("/", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      
      const {
        page = 1,
        limit = 20,
        institute_type,
        city,
        postal_code,
        accepts_donations,
        has_friday_prayer,
        search,
        lat,
        lng,
        radius = 10
      } = req.query;

      const filters = {
        institute_type,
        city,
        postal_code,
        accepts_donations: accepts_donations === 'true',
        has_friday_prayer: has_friday_prayer === 'true',
        search: search as string,
        location: lat && lng ? { lat: parseFloat(lat as string), lng: parseFloat(lng as string), radius: parseFloat(radius as string) } : undefined
      };

      const result = await instituteService.listInstitutes({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters
      });

      res.json({
        institutes: result.institutes,
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

  // Get institute by ID
  router.get("/:id", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const institute = await instituteService.getInstitute(req.params.id);
      
      if (!institute) {
        return res.status(404).json({ error: "Institute not found" });
      }

      res.json({ institute });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new institute
  router.post("/", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const verificationService = req.scope.resolve("swedishBusinessVerificationService") as SwedishBusinessVerificationService;
      
      const instituteData = req.body;

      // Validate Swedish business information
      if (instituteData.certifications?.organization_number?.number) {
        const orgValidation = await verificationService.verifyOrganizationNumber(
          instituteData.certifications.organization_number.number
        );
        
        if (!orgValidation.valid) {
          return res.status(400).json({ 
            error: "Invalid organization number", 
            details: orgValidation.error 
          });
        }

        instituteData.certifications.organization_number.verified = true;
        instituteData.certifications.organization_number.verified_at = new Date();
      }

      // Validate phone number
      if (instituteData.contact_info?.phone) {
        const phoneValidation = verificationService.validateSwedishPhoneNumber(instituteData.contact_info.phone);
        if (!phoneValidation.valid) {
          return res.status(400).json({ 
            error: "Invalid Swedish phone number format" 
          });
        }
      }

      // Validate postal code
      if (instituteData.address?.postal_code) {
        const postalValidation = verificationService.validateSwedishPostalCode(instituteData.address.postal_code);
        if (!postalValidation) {
          return res.status(400).json({ 
            error: "Invalid Swedish postal code format" 
          });
        }
      }

      const institute = await instituteService.createInstitute(instituteData);
      res.status(201).json({ institute });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update institute
  router.put("/:id", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const institute = await instituteService.updateInstitute(req.params.id, req.body);
      
      if (!institute) {
        return res.status(404).json({ error: "Institute not found" });
      }

      res.json({ institute });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete institute
  router.delete("/:id", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      await instituteService.deleteInstitute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get prayer times for institute
  router.get("/:id/prayer-times", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const { date } = req.query;
      
      const prayerTimes = await instituteService.calculatePrayerTimes(
        req.params.id, 
        date ? new Date(date as string) : undefined
      );
      
      if (!prayerTimes) {
        return res.status(404).json({ error: "Prayer times not available" });
      }

      res.json({ prayer_times: prayerTimes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get upcoming events for institute
  router.get("/:id/events", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const { limit = 10 } = req.query;
      
      const events = await instituteService.getUpcomingEvents(
        req.params.id, 
        parseInt(limit as string)
      );
      
      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Register for event
  router.post("/:id/events/:eventId/register", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const { userId } = req.body; // In real implementation, this would come from auth middleware
      
      const success = await instituteService.registerForEvent(
        req.params.id,
        req.params.eventId,
        userId
      );
      
      if (!success) {
        return res.status(400).json({ error: "Unable to register for event" });
      }

      res.json({ message: "Successfully registered for event" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get educational programs
  router.get("/:id/programs", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const { lang = 'sv' } = req.query;
      
      const programs = await instituteService.getEducationalPrograms(
        req.params.id,
        lang as string
      );
      
      res.json({ programs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enroll in educational program
  router.post("/:id/programs/:programId/enroll", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const studentInfo = req.body;
      
      const result = await instituteService.enrollInProgram(
        req.params.id,
        req.params.programId,
        studentInfo
      );
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ message: "Successfully enrolled in program" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Process donation
  router.post("/:id/donate", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const { amount, category, isZakat = false, donorInfo } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid donation amount" });
      }

      const result = await instituteService.processDonation(
        req.params.id,
        amount,
        category,
        isZakat,
        donorInfo
      );
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ 
        message: "Donation processed successfully",
        reference: result.reference
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get volunteer opportunities
  router.get("/:id/volunteer", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      
      const opportunities = await instituteService.getVolunteerOpportunities(req.params.id);
      
      res.json({ opportunities });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Apply for volunteer position
  router.post("/:id/volunteer/:opportunityId/apply", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const applicantInfo = req.body;
      
      const result = await instituteService.applyForVolunteerPosition(
        req.params.id,
        req.params.opportunityId,
        applicantInfo
      );
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ message: "Volunteer application submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Friday prayer information
  router.get("/:id/friday-prayer", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      
      const fridayInfo = await instituteService.getFridayPrayerInfo(req.params.id);
      
      if (!fridayInfo) {
        return res.status(404).json({ error: "Friday prayer information not available" });
      }

      res.json({ friday_prayer: fridayInfo });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search institutes by location
  router.post("/search/location", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const { lat, lng, radius = 10, filters = {} } = req.body;
      
      const institutes = await instituteService.searchByLocation(lat, lng, radius, filters);
      
      res.json({ institutes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get institutes by type
  router.get("/type/:type", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const { limit = 20 } = req.query;
      
      const institutes = await instituteService.getInstitutesByType(
        req.params.type as any,
        parseInt(limit as string)
      );
      
      res.json({ institutes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Claim institute
  router.post("/:id/claim", async (req, res) => {
    try {
      const instituteService = req.scope.resolve("instituteService") as InstituteService;
      const { userId } = req.body; // In real implementation, this would come from auth middleware
      
      const success = await instituteService.claimInstitute(req.params.id, userId);
      
      if (!success) {
        return res.status(400).json({ error: "Unable to claim institute" });
      }

      res.json({ message: "Institute claim submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
