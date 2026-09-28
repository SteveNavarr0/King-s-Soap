import express from "express";
import multer from 'multer'; //Processes forms with uploaded files

import { changeUserAddress } from "../controllers/userController.js";

const router = express.Router();

router.put("/:id", changeUserAddress);

export default router;