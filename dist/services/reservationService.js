"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationService = exports.ReservationService = void 0;
const supabaseClient_1 = require("../database/supabaseClient");
class ReservationService {
    constructor() {
        this.EXPIRY_MINUTES = 15;
    }
    async createReservation(reservationData) {
        const { item_id, customer_id, quantity } = reservationData;
        // Check if item exists
        const { data: item, error: itemError } = await supabaseClient_1.supabase
            .from("items")
            .select("total_quantity")
            .eq("id", item_id)
            .single();
        if (itemError || !item) {
            throw new Error("Item not found");
        }
        // Calculate available quantity
        const { data: activeReservations, error: reservationsError } = await supabaseClient_1.supabase
            .from("reservations")
            .select("quantity")
            .eq("item_id", item_id)
            .in("status", ["PENDING"]);
        if (reservationsError) {
            throw new Error(`Failed to check availability: ${reservationsError.message}`);
        }
        const reservedQuantity = activeReservations?.reduce((sum, r) => sum + Number(r.quantity), 0) || 0;
        const availableQuantity = Number(item.total_quantity) - reservedQuantity;
        // Check if sufficient quantity is available
        if (availableQuantity < quantity) {
            const error = new Error("Insufficient available quantity");
            error.statusCode = 409;
            throw error;
        }
        // Create reservation with expiry time
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.EXPIRY_MINUTES);
        const { data, error } = await supabaseClient_1.supabase
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
    async getAllReservations() {
        const { data, error } = await supabaseClient_1.supabase
            .from("reservations")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            throw new Error(`Failed to fetch reservations: ${error.message}`);
        }
        return data;
    }
    async confirmReservation(id) {
        // Get reservation
        const { data: reservation, error: fetchError } = await supabaseClient_1.supabase
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
            const error = new Error("Cannot confirm expired reservation");
            error.statusCode = 400;
            throw error;
        }
        // cannot confirm if not pending
        if (reservation.status !== "PENDING") {
            const error = new Error(`Cannot confirm reservation with status: ${reservation.status}`);
            error.statusCode = 400;
            throw error;
        }
        // Get current item to deduct from total_quantity
        const { data: item, error: itemError } = await supabaseClient_1.supabase
            .from("items")
            .select("total_quantity")
            .eq("id", reservation.item_id)
            .single();
        if (itemError || !item) {
            throw new Error("Item not found");
        }
        // Deduct quantity permanently
        const newTotalQuantity = Number(item.total_quantity) - Number(reservation.quantity);
        if (newTotalQuantity < 0) {
            const error = new Error("Insufficient inventory to confirm");
            error.statusCode = 409;
            throw error;
        }
        // Update item quantity and reservation status in a transaction-like manner
        const { error: updateItemError } = await supabaseClient_1.supabase
            .from("items")
            .update({ total_quantity: newTotalQuantity })
            .eq("id", reservation.item_id);
        if (updateItemError) {
            throw new Error(`Failed to update item: ${updateItemError.message}`);
        }
        const { data: updatedReservation, error: updateError } = await supabaseClient_1.supabase
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
    async cancelReservation(id) {
        // Get reservation
        const { data: reservation, error: fetchError } = await supabaseClient_1.supabase
            .from("reservations")
            .select("*")
            .eq("id", id)
            .single();
        if (fetchError || !reservation) {
            throw new Error("Reservation not found");
        }
        // Idempotency: if already cancelled, return as-is
        if (reservation.status === "CANCELLED") {
            return reservation;
        }
        // Cannot cancel if already confirmed (quantity already deducted)
        if (reservation.status === "CONFIRMED") {
            const error = new Error("Cannot cancel confirmed reservation");
            error.statusCode = 400;
            throw error;
        }
        // Update status to CANCELLED
        const { data: updatedReservation, error: updateError } = await supabaseClient_1.supabase
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
    async expireReservations() {
        const now = new Date().toISOString();
        // Find all PENDING reservations that have expired
        const { data: expiredReservations, error: fetchError } = await supabaseClient_1.supabase
            .from("reservations")
            .select("id")
            .eq("status", "PENDING")
            .lt("expires_at", now);
        if (fetchError) {
            throw new Error(`Failed to fetch expired reservations: ${fetchError.message}`);
        }
        if (!expiredReservations || expiredReservations.length === 0) {
            return { expired_count: 0 };
        }
        // Mark them as EXPIRED
        const ids = expiredReservations.map((r) => r.id);
        const { error: updateError } = await supabaseClient_1.supabase
            .from("reservations")
            .update({ status: "EXPIRED" })
            .in("id", ids);
        if (updateError) {
            throw new Error(`Failed to expire reservations: ${updateError.message}`);
        }
        return { expired_count: expiredReservations.length };
    }
    async getReservationById(id) {
        const { data, error } = await supabaseClient_1.supabase
            .from("reservations")
            .select("*")
            .eq("id", id)
            .single();
        if (error) {
            if (error.code === "PGRST116")
                return null;
            throw new Error(`Failed to fetch reservation: ${error.message}`);
        }
        return data;
    }
}
exports.ReservationService = ReservationService;
exports.reservationService = new ReservationService();
