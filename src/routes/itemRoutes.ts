import { Router } from "express";
import * as itemsController from "../controllers/itemController";
import {
  createItemSchema,
  updateItemSchema,
  getItemSchema,
  deleteItemSchema,
} from "../schemas/itemSchema";
import { validate } from "../middleware/validateReq";

const router = Router();

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     responses:
 *       200:
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/", itemsController.getAllItems);

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 */
router.post("/", validate(createItemSchema), itemsController.createItem);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 */
router.get("/:id", validate(getItemSchema), itemsController.getItemById);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
router.put("/:id", validate(updateItemSchema), itemsController.updateItem);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Item deleted successfully
 */
router.delete("/:id", validate(deleteItemSchema), itemsController.deleteItem);

//debug route
router.post("/debug", (req, res) => {
  res.json({
    body: req.body,
    headers: req.headers,
  });
});

export default router;
