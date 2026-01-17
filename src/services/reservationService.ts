import { supabase } from "../database/supabaseClient";
import { CreateReservationInput } from "../schemas/reservationSchema";
import { Reservation } from "../types";

export class ReservationService {
  private readonly EXPIRY_MINUTES = 15;

  async createReservation(
    reservationData: CreateReservationInput
  ): Promise<Reservation> {
    const { item_id, customer_id, quantity } = reservationData;

    // check if item exists
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("total_quantity")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      throw new Error("Item not found");
    }

    // calculate currently reserved quantity
    const { data: activeReservations, error: reservationsError } =
      await supabase
        .from("reservations")
        .select("quantity")
        .eq("item_id", item_id)
        .in("status", ["PENDING"]);

    if (reservationsError) {
      throw new Error(
        `Failed to check availability: ${reservationsError.message}`
      );
    }

    const reservedQuantity =
      activeReservations?.reduce((sum, r) => sum + Number(r.quantity), 0) || 0;
    const availableQuantity = Number(item.total_quantity) - reservedQuantity;

    //check if quantity is available
    if (availableQuantity < quantity) {
      const error: any = new Error("Insufficient available quantity");
      error.statusCode = 409;
      throw error;
    }

    //create reservation with expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.EXPIRY_MINUTES);

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        item_id,
        customer_id,
        customer_name: customer_id,
        quantity,
        status: "PENDING",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create reservation: ${error.message}`);
    }

    return data;
  }

  // get all reservations
  async getAllReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reservations: ${error.message}`);
    }

    return data;
  }

  // confirm reservation
  async confirmReservation(id: string): Promise<Reservation> {
    // get reservation
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reservation) {
      throw new Error("Reservation not found");
    }

    // as - is
    if (reservation.status === "CONFIRMED") {
      return reservation;
    }

    // no confirmation if expired
    if (new Date(reservation.expires_at) < new Date()) {
      const error: any = new Error("Cannot confirm expired reservation");
      error.statusCode = 400;
      throw error;
    }

    // cannot confirm if not pending
    if (reservation.status !== "PENDING") {
      const error: any = new Error(
        `Cannot confirm reservation with status: ${reservation.status}`
      );
      error.statusCode = 400;
      throw error;
    }

    // get current item to be deducted
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("total_quantity")
      .eq("id", reservation.item_id)
      .single();

    if (itemError || !item) {
      throw new Error("Item not found");
    }

    // then we deduct the quantity
    const newTotalQuantity =
      Number(item.total_quantity) - Number(reservation.quantity);

    if (newTotalQuantity < 0) {
      const error: any = new Error("Insufficient inventory to confirm");
      error.statusCode = 409;
      throw error;
    }

    // we update the item quantity now with the new total quantity
    const { error: updateItemError } = await supabase
      .from("items")
      .update({ total_quantity: newTotalQuantity })
      .eq("id", reservation.item_id);

    if (updateItemError) {
      throw new Error(`Failed to update item: ${updateItemError.message}`);
    }

    const { data: updatedReservation, error: updateError } = await supabase
      .from("reservations")
      .update({ status: "CONFIRMED" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to confirm reservation: ${updateError.message}`);
    }

    return updatedReservation;
  }

  async cancelReservation(id: string): Promise<Reservation> {
    //get reservation
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reservation) {
      throw new Error("Reservation not found");
    }

    // as is
    if (reservation.status === "CANCELLED") {
      return reservation;
    }

    // cannot cancel if already confirmed (quantity already deducted)
    if (reservation.status === "CONFIRMED") {
      const error: any = new Error("Cannot cancel confirmed reservation");
      error.statusCode = 400;
      throw error;
    }

    // update status to CANCELLED
    const { data: updatedReservation, error: updateError } = await supabase
      .from("reservations")
      .update({ status: "CANCELLED" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to cancel reservation: ${updateError.message}`);
    }

    return updatedReservation;
  }

  async expireReservations(): Promise<{ expired_count: number }> {
    const now = new Date().toISOString();

    // find all expired PENDING reservations
    const { data: expiredReservations, error: fetchError } = await supabase
      .from("reservations")
      .select("id")
      .eq("status", "PENDING")
      .lt("expires_at", now);

    if (fetchError) {
      throw new Error(
        `Failed to fetch expired reservations: ${fetchError.message}`
      );
    }

    if (!expiredReservations || expiredReservations.length === 0) {
      return { expired_count: 0 };
    }

    // mark them as EXPIRED
    const ids = expiredReservations.map((r) => r.id);
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "EXPIRED" })
      .in("id", ids);

    if (updateError) {
      throw new Error(`Failed to expire reservations: ${updateError.message}`);
    }

    return { expired_count: expiredReservations.length };
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch reservation: ${error.message}`);
    }

    return data;
  }
}

export const reservationService = new ReservationService();

/*  // create reservation
check if item exists -> calculate available quantity -> if available, create reservation with PENDING status and expiry time -> only create if sufficient quantity available -> 
set a 15 minute expiry and return 409 conflict if insufficient quantity


// confirm reservation -> idempotent operation (can be called multiple times safely) -> if confirmed return the existing reservation withou deducting quantity again -> validates reservation
-> only pending reservations -> deduc fromt total quantity

// cancel reservation -> cannot cancel confirmed reservations -> only pending reservations can be cancelled -> set status to CANCELLED
*/
