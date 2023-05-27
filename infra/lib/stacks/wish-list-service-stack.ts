import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Role, Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface WishListServiceProps extends cdk.StackProps {
  wishListTable: dynamodb.Table
}

export class WishListServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WishListServiceProps) {
    super(scope, id, props);

    const lambdaRole = new Role(this, 'post-lambda-role', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for interacting with dynamoDB',
    });

    lambdaRole.addToPolicy(new PolicyStatement({
      resources: [props.wishListTable.tableArn],
      effect: Effect.ALLOW,
      actions: ['dynamodb:PutItem'],
    }));

    const postLambda = new lambda.DockerImageFunction(this, 'postGiftFunction', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', '..', '..', 'functions', 'post-gift')),
      architecture: lambda.Architecture.ARM_64,
      role: lambdaRole
    });

    // props.wishListTable.grantWriteData(postLambda);
  }
}
