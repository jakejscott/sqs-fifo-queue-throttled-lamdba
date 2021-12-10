import { SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event, context) => {
  console.log(`Received ${event.Records.length} events`);

  for (const record of event.Records) {
    console.log("Processing", JSON.stringify(record));
  }
};
