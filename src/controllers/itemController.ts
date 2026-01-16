import { Request, Response, NextFunction } from "express";
import { ItemsService } from "../services/itemService";
import { GetItemParams } from "../types";

export const getAllItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const itemsService = new ItemsService();
  try {
    const items = await itemsService.getAllItems();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// get item status
export const getItemStatus = async (
  req: Request<GetItemParams>,
  res: Response,
  next: NextFunction
) => {
  const itemsService = new ItemsService();

  try {
    const itemStatus = await itemsService.getItemStatus(req.params.id);

    if (!itemStatus) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, data: itemStatus });
  } catch (error) {
    next(error);
  }
};

//get item by id

export const getItemById = async (
  req: Request<GetItemParams>,
  res: Response,
  next: NextFunction
) => {
  const itemsService = new ItemsService();

  try {
    const item = await itemsService.getItemById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

//create item

export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const itemsService = new ItemsService();
  try {
    const newItem = await itemsService.createItem(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

//update item

export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const itemsService = new ItemsService();
  const { id } = req.params;
  try {
    const updatedItem = await itemsService.updateItem(
      Array.isArray(id) ? id[0] : id,
      req.body
    );
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    next(error);
  }
};

//delete item

export const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const itemsService = new ItemsService();
  const { id } = req.params;
  try {
    await itemsService.deleteItem(Array.isArray(id) ? id[0] : id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const checkItemAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const itemsService = new ItemsService();
  const { id } = req.params;
  const { quantity } = req.query;

  if (!quantity || isNaN(Number(quantity))) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid quantity parameter" });
  }

  try {
    const isAvailable = await itemsService.checkAvailability(
      Array.isArray(id) ? id[0] : id,
      Number(quantity)
    );
    res.status(200).json({ success: true, data: { available: isAvailable } });
  } catch (error) {
    next(error);
  }
};
