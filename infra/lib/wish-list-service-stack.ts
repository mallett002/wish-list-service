import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Role, Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';


export class WishListServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const giftTable = new dynamodb.Table(this, 'Table', {
      tableName: 'wish-list-gift',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: {name: 'SK', type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // todo: vpc
    const lambdaRole = new Role(this, 'post-lambda-role', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for interacting with dynamoDB',
    });

    lambdaRole.addToPolicy(new PolicyStatement({
        resources: [giftTable.tableArn],
        effect: Effect.ALLOW,
        actions: ['dynamodb:PutItem'],
      }),
    );

    const postLambda = new lambda.DockerImageFunction(this, 'postGiftFunction', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', '..', 'functions', 'post-gift')),
      architecture: lambda.Architecture.ARM_64,
      role: lambdaRole
    });

  }
}
