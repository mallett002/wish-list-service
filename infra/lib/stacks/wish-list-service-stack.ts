import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Role, Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { WishListHandler } from '../constructs/functions/handler';
import { WishListRestApi } from '../constructs/rest-api';
import { Auth } from './auth';

interface WishListServiceProps extends cdk.StackProps {
  wishListTable: dynamodb.Table
}

export class WishListServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WishListServiceProps) {
    super(scope, id, props);

    const auth = new Auth(this, 'WishListAuth');

    const postGift = this.createLambdaHandler( 'post-gift', props.wishListTable, 'write', {userPoolId: auth.userPoolId, appClientId: auth.appClientId});
    const getGift = this.createLambdaHandler('get-gift', props.wishListTable, 'read', {userPoolId: auth.userPoolId, appClientId: auth.appClientId});

    new WishListRestApi(this, 'WishListRestApi', {
      postGiftLambda: postGift.handler,
      getGiftLambda: getGift.handler,
      appClientId: auth.appClientId,
      userPoolId: auth.userPoolId
    });
  }

  private createLambdaHandler(
    functionName: string,
    table: dynamodb.Table,
    access: string,
    authCreds: {appClientId: string; userPoolId: string;}
  ): WishListHandler {
    return new WishListHandler(this, `${functionName}-handler`, {
      functionName,
      wishListTable: table,
      access,
      appClientId: authCreds.appClientId,
      userPoolId: authCreds.userPoolId
    });
  }
}
