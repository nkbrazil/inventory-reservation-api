import { supabase } from "./supabaseClient";
// sample generated seed
async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    console.log("Clearing existing data...");
    await supabase
      .from("reservations")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Seed Items
    console.log("Seeding items...");
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .insert([
        {
          name: "Laptop - Dell XPS 15",
          total_quantity: 50,
        },
        {
          name: "Wireless Mouse - Logitech MX Master",
          total_quantity: 100,
        },
        {
          name: "Mechanical Keyboard - Keychron K8",
          total_quantity: 75,
        },
        {
          name: "USB-C Hub - Anker 7-in-1",
          total_quantity: 200,
        },
        {
          name: "Monitor - LG UltraWide 34 inch",
          total_quantity: 30,
        },
        {
          name: "Webcam - Logitech C920",
          total_quantity: 60,
        },
        {
          name: "Headphones - Sony WH-1000XM5",
          total_quantity: 40,
        },
        {
          name: "Standing Desk - FlexiSpot E7",
          total_quantity: 20,
        },
      ])
      .select();

    if (itemsError) {
      throw new Error(`Failed to seed items: ${itemsError.message}`);
    }

    console.log(`✅ Created ${items?.length} items`);

    // Seed Reservations (using the first few items)
    if (items && items.length >= 4) {
      console.log("Seeding reservations...");

      const now = new Date();
      const futureExpiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      const pastExpiry = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago

      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .insert([
          // PENDING reservation (not expired)
          {
            item_id: items[0].id,
            customer_id: "CUST001",
            customer_name: "Alice Johnson",
            quantity: 5,
            status: "PENDING",
            expires_at: futureExpiry.toISOString(),
          },
          // PENDING reservation (expired - for testing expiration)
          {
            item_id: items[1].id,
            customer_id: "CUST002",
            customer_name: "Bob Smith",
            quantity: 10,
            status: "PENDING",
            expires_at: pastExpiry.toISOString(),
          },
          // CONFIRMED reservation
          {
            item_id: items[2].id,
            customer_id: "CUST003",
            customer_name: "Charlie Davis",
            quantity: 8,
            status: "CONFIRMED",
            expires_at: futureExpiry.toISOString(),
          },
          // CANCELLED reservation
          {
            item_id: items[0].id,
            customer_id: "CUST004",
            customer_name: "Diana Wilson",
            quantity: 3,
            status: "CANCELLED",
            expires_at: pastExpiry.toISOString(),
          },
          // Another PENDING reservation
          {
            item_id: items[3].id,
            customer_id: "CUST005",
            customer_name: "Ethan Brown",
            quantity: 15,
            status: "PENDING",
            expires_at: futureExpiry.toISOString(),
          },
          // EXPIRED reservation
          {
            item_id: items[1].id,
            customer_id: "CUST006",
            customer_name: "Fiona Martinez",
            quantity: 7,
            status: "EXPIRED",
            expires_at: pastExpiry.toISOString(),
          },
          // Multiple reservations for same item
          {
            item_id: items[0].id,
            customer_id: "CUST007",
            customer_name: "George Taylor",
            quantity: 2,
            status: "PENDING",
            expires_at: futureExpiry.toISOString(),
          },
          {
            item_id: items[0].id,
            customer_id: "CUST008",
            customer_name: "Hannah Anderson",
            quantity: 4,
            status: "CONFIRMED",
            expires_at: futureExpiry.toISOString(),
          },
        ])
        .select();

      if (reservationsError) {
        throw new Error(
          `Failed to seed reservations: ${reservationsError.message}`
        );
      }

      console.log(`✅ Created ${reservations?.length} reservations`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Items: ${items?.length || 0}`);
    console.log(`   - Reservations: 8`);
    console.log(
      "\n💡 Note: Some reservations are already expired for testing purposes"
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("\n✨ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
