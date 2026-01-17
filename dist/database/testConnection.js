"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = require("./supabaseClient");
// testing connection
async function testConnection() {
    try {
        console.log("Testing inventory.items...");
        const { data: items, error: itemsError } = await supabaseClient_1.supabase
            .from("items")
            .select("*");
        if (itemsError) {
            console.error("❌ Error fetching items:", itemsError.message);
        }
        else {
            console.log("✅ Items fetched successfully:", items);
        }
        console.log("Testing inventory.reservations...");
        const { data: reservations, error: resError } = await supabaseClient_1.supabase
            .from("reservations")
            .select("*");
        if (resError) {
            console.error("❌ Error fetching reservations:", resError.message);
        }
        else {
            console.log("✅ Reservations fetched successfully:", reservations);
        }
    }
    catch (err) {
        console.error("Unexpected error:", err);
    }
}
testConnection();
