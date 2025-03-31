import express, { Router } from "express";
import { checkID, checkBody, getAllTours, getTour, createTour, updateTour, deleteTour } from "../controller/tourController";

const router: Router = express.Router();

// Middleware for tour routes
router.param("id", checkID);

router.route("/").get(getAllTours).post(checkBody, createTour);

router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

export default router;
