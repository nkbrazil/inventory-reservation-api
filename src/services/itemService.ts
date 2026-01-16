import { supabase } from "../database/supabaseClient";
import { CreateItemInput, UpdateItemInput } from "../schemas/itemSchema";
import { Item } from "../types";

export class ItemsService {
  async getAllItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch items: ${error.message}`);
    return data;
  }

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

  async createItem(itemData: CreateItemInput): Promise<Item> {
    const { data, error } = await supabase
      .from("items")
      .insert(itemData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create item: ${error.message}`);
    return data;
  }

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

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete item: ${error.message}`);
  }

  async checkAvailability(itemId: string, quantity: number): Promise<boolean> {
    const item = await this.getItemById(itemId);
    if (!item) throw new Error("Item not found");
    return Number(item.total_quantity) >= quantity;
  }
}

export const itemsService = new ItemsService();
