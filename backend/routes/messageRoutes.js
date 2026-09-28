import express from 'express';

//Import controller function that handles new customer messages
import {createMessage, saveResponse,} from "../controllers/messageController.js";

//Router for message related backend requests
const router = express.Router();

//Send a new customer message
router.post("/", createMessage);

//Save admin response for one message. Find message by its db id
router.patch("/:id/response", saveResponse);

export default router;