import express from 'express';
import multer from 'multer';
import { getAllProducts, createProduct } from '../controllers/productController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAllProducts);
router.post('/', upload.single("image"), createProduct);

export default router;