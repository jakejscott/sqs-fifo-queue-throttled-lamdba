import { SQS } from "@aws-sdk/client-sqs";
import { readFileSync } from "fs";
import { chunk } from "lodash";
import cuid = require("cuid");

async function main() {
  try {
    await run();
  } catch (error) {
    console.log("error", error);
  }
}

export type Order = {
  id: string;
  total: number;
};

async function run() {
  const sqs = new SQS({});

  const stack = JSON.parse(readFileSync("./outputs.json").toString("utf-8"))[
    "sqs-fifo-throttled-processing-stack"
  ];

  const fifoQueueUrl = stack.FifoQueueUrl;
  if (!fifoQueueUrl) throw new Error("fifoQueueUrl missing");

  let orders: Order[] = [];
  for (let i = 0; i < 1000; i++) {
    const order: Order = {
      id: cuid(),
      total: 100,
    };
    orders.push(order);
  }

  const shards = 5;
  const batches = chunk(orders, 10);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const groupId = i % shards;

    console.log("Sending batch", {
      batch: i,
      batchSize: batch.length,
      groupId: groupId,
    });

    await sqs.sendMessageBatch({
      QueueUrl: fifoQueueUrl,
      Entries: batch.map((order) => ({
        Id: order.id,
        MessageBody: JSON.stringify(order),
        MessageGroupId: groupId.toString(),
      })),
    });
  }
}

main();
