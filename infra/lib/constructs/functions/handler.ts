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
  roleActions: string[]
}


export class WishListHandler extends Construct {

  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: HandlerProps) {
    super(scope, id);

    // take these things in as props and make this a generic function construct
    const lambdaRole = new Role(this, `${props.functionName}-lambda-role`, {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    lambdaRole.addToPolicy(new PolicyStatement({
      resources: [props.wishListTable.tableArn],
      effect: Effect.ALLOW,
      actions: props.roleActions
    }));

    this.handler = new lambda.DockerImageFunction(this, props.functionName, {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', '..', '..', '..', 'functions', props.functionName)),
      architecture: lambda.Architecture.ARM_64,
      role: lambdaRole
    });

  }
}
