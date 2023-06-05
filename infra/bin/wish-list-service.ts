#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProdStage } from '../lib/stages/prod-stage';

const app = new cdk.App();

new ProdStage(app, 'prod');
