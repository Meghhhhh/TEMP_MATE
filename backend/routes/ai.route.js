import express from "express";
import { comparator, getIntvQues } from "../controllers/ai.controller.js"; 
import { chatbot } from "../controllers/ai.controller.js";

const router = express.Router();
router.route("/mock-intv").post(getIntvQues);
router.route("/chatbot").post(chatbot);
router.route("/comparator").post(comparator);

export default router;
