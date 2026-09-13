import express from 'express';
import multer from 'multer';
import { getAllProducts, createProduct, deleteProduct} from '../controllers/productController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAllProducts);
router.post('/', upload.single("image"), createProduct);
router.delete('/:id', deleteProduct);

export default router;