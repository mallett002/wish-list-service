import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Role } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';


export class WishListServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const giftTable = new dynamodb.Table(this, 'Table', {
      tableName: 'wish-list-gift',
      partitionKey: { name: 'gift_id', type: dynamodb.AttributeType.STRING },
      sortKey: {name: 'for_user', type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // dynamodb:PutItem 

    const postLambda = new lambda.DockerImageFunction(this, 'postGiftFunction', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', '..', 'functions', 'post-gift')),
      architecture: lambda.Architecture.ARM_64
    });

    giftTable.grantReadWriteData(postLambda);
  }
}
