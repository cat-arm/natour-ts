import express, { Router } from "express";
import { getAllUsers, getUser, createUser, updateUser, deleteUser } from "../controller/userController";

const router: Router = express.Router();

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
