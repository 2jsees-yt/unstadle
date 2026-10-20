import fs from "node:fs/promises";

const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
  console.error("Missing YOUTUBE_API_KEY secret.");
  process.exit(1);
}

const channels = JSON.parse(await fs.readFile("youtube-channels.json", "utf8"));
const previous = JSON.parse(await fs.readFile("subscribers.json", "utf8").catch(() => '{"subscribers":{}}'));
const subscribers = { ...(previous.subscribers || {}) };
const failures = [];

for (const [characterName, handle] of Object.entries(channels)) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "statistics");
  url.searchParams.set("forHandle", handle);
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || `HTTP ${response.status}`);
    const channel = payload.items?.[0];
    if (!channel) throw new Error(`No channel found for handle ${handle}`);
    if (channel.statistics?.hiddenSubscriberCount) throw new Error("Subscriber count is hidden");
    const count = Number(channel.statistics?.subscriberCount);
    if (!Number.isFinite(count)) throw new Error("Subscriber count missing");
    subscribers[characterName] = count;
    console.log(`${characterName}: ${count.toLocaleString("en-US")}`);
  } catch (error) {
    failures.push(`${characterName} (${handle}): ${error.message}`);
    console.error(`Could not update ${characterName}: ${error.message}`);
  }
}

const output = {
  updatedAt: new Date().toISOString(),
  subscribers
};
await fs.writeFile("subscribers.json", JSON.stringify(output, null, 2) + "\n", "utf8");

if (failures.length) {
  console.error("\nSome channels could not be updated. Previous values were kept where possible:");
  for (const failure of failures) console.error("- " + failure);
  // Keep the workflow green so valid channel updates can still be published.
}
