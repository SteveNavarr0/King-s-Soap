import express from 'express';
import multer from 'multer'; //Processes forms with uploaded files
import { getAllProducts, createProduct, addProductImages, deleteProductImage, deleteProduct } from '../controllers/productController.js'; //Controller functions for handling product-related requests

const router = express.Router(); //Creating a new router instance to define product-related routes like GET and POST requests (getAllProducts and createProduct)
const upload = multer({ storage: multer.memoryStorage() }); //Store file to send to Supabase

//Display all the products
router.get('/', getAllProducts); //When a GET request is made to the root path of this router, the getAllProducts function will be called to handle the request and send back a response with all products

//Create a new product
router.post('/', upload.array("images"), createProduct); //Listen for POST requests to the root path of this router, and when a request is received, the upload.array("images") middleware will process the uploaded image file, and then the createProduct function will be called to handle the request and create a new product in the database

//Add multiple images to an existing product
router.post("/:id/images", upload.array("images"), addProductImages);

//Delete an image from an existing product
router.delete("/:id/images/:imageId", deleteProductImage);

//Delete a product
router.delete('/:id', deleteProduct);


export default router; //Make completed router object available to other files