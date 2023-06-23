import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Role, Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


interface HandlerProps {
  functionName: string;
  wishListTable: dynamodb.Table;
  access: string;
  appClientId: string;
  userPoolId: string;
}


export class WishListHandler extends Construct {

  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: HandlerProps) {
    super(scope, id);

    this.handler = new lambda.DockerImageFunction(this, props.functionName, {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', '..', '..', '..', 'functions', props.functionName)),
      architecture: lambda.Architecture.ARM_64,
      environment: {
        APP_CLIENT_ID: props.appClientId,
        USER_POOL_ID: props.userPoolId
      }
    });

    this.applyDBAccess(props.wishListTable, props.access);
  }

  private applyDBAccess(table: dynamodb.Table, access: string): void {
    if (access === 'write') {
      table.grantWriteData(this.handler);
    } else if (access === 'readWrite') {
      table.grantReadWriteData(this.handler);
    } else {
      table.grantReadData(this.handler);
    }
  }
}
