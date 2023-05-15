import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Role } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';



export class WishListServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // dynamoDb
    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'gift_id', type: dynamodb.AttributeType.STRING },
      sortKey: {name: 'for_user', type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // lambda role to call dynamoDb
    new lambda.DockerImageFunction(this, 'AssetFunction', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, 'docker-handler')),
    });

    // lambda
    // new lambda
  }
}
