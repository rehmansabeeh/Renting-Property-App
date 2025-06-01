import express from "express";
import { createTenant, getTenant } from "../controllers/tenantControllers";
getTenant;
const router = express.Router();

router.get("/:cognitoId", getTenant);
router.post("/", createTenant);

export default router;
