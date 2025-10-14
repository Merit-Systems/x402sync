import { createTransferEvent } from "@/db/services";
import { logger, schedules, wait } from "@trigger.dev/sdk/v3";

export const firstScheduledTask = schedules.task({
  id: "first-scheduled-task",
  // Every hour
  cron: "*/5 * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run

    await createTransferEvent({
      address: "0x1234567890123456789012345678901234567890",
      transaction_from: "0x1234567890123456789012345678901234567890",
      sender: "0x1234567890123456789012345678901234567890",
      recipient: "0x1234567890123456789012345678901234567890",
      amount: 100,
      block_timestamp: new Date(),
      tx_hash: "0x1234567890123456789012345678901234567890",
      chain: "ethereum",
    });

    // Wait for 5 seconds
    await wait.for({ seconds: 5 });

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });

    logger.log(formatted);
  },
});
