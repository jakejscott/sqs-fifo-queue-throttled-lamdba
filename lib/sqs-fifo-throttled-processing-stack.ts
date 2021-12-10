import * as cdk from "aws-cdk-lib";
import { Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class SqsFifoThrottledProcessingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fifoQueue = new sqs.Queue(this, "FifoQueue", {
      queueName: `${this.stackName}-fifo-queue.fifo`,
      visibilityTimeout: cdk.Duration.seconds(30),
      fifo: true,
      contentBasedDeduplication: true,
      deduplicationScope: sqs.DeduplicationScope.QUEUE,
      deadLetterQueue: {
        maxReceiveCount: 1,
        queue: new sqs.Queue(this, "FifoQueueDeadLetterQueue", {
          queueName: `${this.stackName}-fifo-queue-dead-letter-queue.fifo`,
          fifo: true,
        }),
      },
    });

    const processingFunction = new nodejs.NodejsFunction(
      this,
      "ProcessingFunction",
      {
        entry: "./src/processingFunction.ts",
        handler: "handler",
        timeout: cdk.Duration.seconds(10),
        runtime: lambda.Runtime.NODEJS_14_X,
      }
    );

    processingFunction.addEventSource(
      new eventSources.SqsEventSource(fifoQueue, {
        batchSize: 1,
        enabled: true,
      })
    );

    new cdk.CfnOutput(this, "FifoQueueUrl", {
      value: fifoQueue.queueUrl,
    });
  }
}
