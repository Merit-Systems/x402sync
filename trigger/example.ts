import { createManyTransferEvents } from "@/db/services";
import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { BITQUERY_API_URL, FACILITATORS } from "./constants";

export const syncNewTransfers = schedules.task({
  id: "sync-new-transfers",
  // Every hour
  cron: "*/5 * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run

    try {
      // Calculate time range - get transfers from last run or last 5 minutes
      const now = new Date();
      const since = payload.lastTimestamp 
        ? new Date(payload.lastTimestamp) 
        : new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000); // 6 months ago

      // Fetch transfers from Bitquery
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${process.env.BITQUERY_API_KEY}`);

      const raw = JSON.stringify({
        "query": "{\n  solana(network: solana) {\n    sent: transfers(\n      options: {desc: \"block.height\", limit: 20000, offset: 0}\n      time: {\n        since: \"" + since.toISOString() + "\"\n        till: \"" + now.toISOString() + "\"\n      }\n      amount: {gt: 0}\n      signer: {\n        in: " + JSON.stringify(FACILITATORS) + "\n      }\n    ) {\n      block {\n        timestamp {\n          time(format: \"%Y-%m-%d %H:%M:%S\")\n        }\n        height\n      }\n      sender {\n        address\n      }\n      receiver {\n        address\n      }\n      amount\n      currency {\n        name\n        address\n        symbol\n      }\n      transaction {\n        feePayer\n        signature\n      }\n    }\n  }\n}\n",
        "variables": "{\n  \"limit\": 20000,\n  \"offset\": 0,\n  \"network\": \"solana\",\n  \"from\": \"" + since.toISOString() + "\",\n  \"till\": \"" + now.toISOString() + "\",\n  \"dateFormat\": \"%Y-%m-%d\"\n}"
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(BITQUERY_API_URL, requestOptions);
      const result = await response.json();

      logger.log("Bitquery response:", result);

      // Parse and transform the transfers
      const transfers = result.data.solana.sent.map((transfer: any) => ({
        address: transfer.currency.address,
        transaction_from: transfer.transaction.feePayer,
        sender: transfer.sender.address,
        recipient: transfer.receiver.address,
        amount: parseFloat(transfer.amount),
        block_timestamp: new Date(transfer.block.timestamp.time),
        tx_hash: transfer.transaction.signature,
        chain: "solana",
      }));

      logger.log(`Found ${transfers.length} transfers to sync from facilitators`);

      // Insert all transfers into database (skips duplicates)
      if (transfers.length > 0) {
        const result = await createManyTransferEvents(transfers);
        logger.log(`Successfully synced ${result.count} new transfers`);
      }

    } catch (error) {
      logger.error("Error syncing transfers:", { error: String(error) });
      throw error;
    }

    // Wait for 5 seconds
    await wait.for({ seconds: 5 });

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });

    logger.log(formatted);
  },
});
