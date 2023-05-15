#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WishListServiceStack } from '../lib/wish-list-service-stack';

const app = new cdk.App();
new WishListServiceStack(app, 'WishListServiceStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});