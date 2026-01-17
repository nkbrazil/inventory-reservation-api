import { supabase } from "../database/supabaseClient";
import { CreateItemInput, UpdateItemInput } from "../schemas/itemSchema";
import { Item, ItemStatus, ReservationStatuses } from "../types";

export class ItemsService {
  // get all items
  async getAllItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch items: ${error.message}`);
    return data;
  }
  // get item by id
  async getItemById(id: string): Promise<Item | null> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch item: ${error.message}`);
    }
    return data;
  }

  // create item
  async createItem(itemData: CreateItemInput): Promise<Item> {
    const { data, error } = await supabase
      .from("items")
      .insert(itemData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create item: ${error.message}`);
    return data;
  }
  // update item
  async updateItem(id: string, itemData: UpdateItemInput): Promise<Item> {
    const { data, error } = await supabase
      .from("items")
      .update(itemData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update item: ${error.message}`);
    return data;
  }

  // delete item
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete item: ${error.message}`);
  }

  // checker of availability
  async checkAvailability(itemId: string, quantity: number): Promise<boolean> {
    const item = await this.getItemById(itemId);
    if (!item) throw new Error("Item not found");
    return Number(item.total_quantity) >= quantity;
  }

  async getItemStatus(id: string): Promise<ItemStatus | null> {
    const item = await this.getItemById(id);
    if (!item) return null;

    const { data: reservations, error } = await supabase
      .from("reservations")
      .select("quantity, status")
      .eq("item_id", id)
      .in("status", ["PENDING", "CONFIRMED"]);

    if (error) {
      throw new Error(`Failed to fetch reservations: ${error.message}`);
    }

    const reserved_quantity =
      reservations?.reduce((sum, r) => sum + Number(r.quantity), 0) || 0;
    console.log("reserved_quantity", reserved_quantity);

    const confirmed_quantity =
      reservations
        ?.filter((r) => r.status === "CONFIRMED")
        .reduce((sum, r) => sum + Number(r.quantity), 0) || 0;
    console.log("item.total_quantity", item.total_quantity);
    console.log("confirmed_quantity", confirmed_quantity);

    const available_quantity = Number(item.total_quantity) - reserved_quantity;

    if (available_quantity < 0) {
      throw new Error("Data inconsistency: reserved quantity exceeds total");
    }

    return {
      id: item.id,
      name: item.name,
      total_quantity: Number(item.total_quantity),
      available_quantity,
      reserved_quantity,
      confirmed_quantity,
    };
  }
}

export const itemsService = new ItemsService();
