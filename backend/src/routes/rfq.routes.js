import { Router } from "express";
import { createRFQ, getRFQDetails } from "../controllers/rfq.controller.js";
import { submitQuote } from "../controllers/quote.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Import middleware

const router = Router();

// Protect these routes!
router.route("/create").post(verifyJWT, createRFQ);
router.route("/bid").post(verifyJWT, submitQuote);

// This one can be public or protected depending on your needs
router.route("/:rfqId").get(verifyJWT, getRFQDetails);

export default router;