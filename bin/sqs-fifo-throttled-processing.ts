#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SqsFifoThrottledProcessingStack } from "../lib/sqs-fifo-throttled-processing-stack";

const app = new cdk.App();

new SqsFifoThrottledProcessingStack(
  app,
  "sqs-fifo-throttled-processing-stack",
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  }
);
