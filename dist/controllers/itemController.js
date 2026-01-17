"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemStatus = exports.checkItemAvailability = exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getAllItems = void 0;
const itemService_1 = require("../services/itemService");
const getAllItems = async (req, res, next) => {
    const itemsService = new itemService_1.ItemsService();
    try {
        const items = await itemsService.getAllItems();
        res.status(200).json({ success: true, data: items });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllItems = getAllItems;
//get item by id
const getItemById = async (req, res, next) => {
    const itemsService = new itemService_1.ItemsService();
    try {
        const item = await itemsService.getItemById(req.params.id);
        if (!item) {
            return res
                .status(404)
                .json({ success: false, message: "Item not found" });
        }
        res.status(200).json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
exports.getItemById = getItemById;
//create item
const createItem = async (req, res, next) => {
    const itemsService = new itemService_1.ItemsService();
    try {
        const newItem = await itemsService.createItem(req.body);
        res.status(201).json({ success: true, data: newItem });
    }
    catch (error) {
        next(error);
    }
};
exports.createItem = createItem;
//update item
const updateItem = async (req, res, next) => {
    const itemsService = new itemService_1.ItemsService();
    const { id } = req.params;
    try {
        const updatedItem = await itemsService.updateItem(Array.isArray(id) ? id[0] : id, req.body);
        res.status(200).json({ success: true, data: updatedItem });
    }
    catch (error) {
        next(error);
    }
};
exports.updateItem = updateItem;
//delete item
const deleteItem = async (req, res, next) => {
    const itemsService = new itemService_1.ItemsService();
    const { id } = req.params;
    try {
        await itemsService.deleteItem(Array.isArray(id) ? id[0] : id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteItem = deleteItem;
const checkItemAvailability = async (req, res, next) => {
    const itemsService = new itemService_1.ItemsService();
    const { id } = req.params;
    const { quantity } = req.query;
    if (!quantity || isNaN(Number(quantity))) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid quantity parameter" });
    }
    try {
        const isAvailable = await itemsService.checkAvailability(Array.isArray(id) ? id[0] : id, Number(quantity));
        res.status(200).json({ success: true, data: { available: isAvailable } });
    }
    catch (error) {
        next(error);
    }
};
exports.checkItemAvailability = checkItemAvailability;
const getItemStatus = async (req, res, next) => {
    const itemsService = new itemService_1.ItemsService();
    try {
        const itemStatus = await itemsService.getItemStatus(req.params.id);
        if (!itemStatus) {
            return res
                .status(404)
                .json({ success: false, message: "Item not found" });
        }
        res.status(200).json({ success: true, data: itemStatus });
    }
    catch (error) {
        next(error);
    }
};
exports.getItemStatus = getItemStatus;
