import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { WishListHandler } from '../constructs/functions/handler';
import { WishListRestApi } from '../constructs/rest-api';
import { Auth } from './auth';

interface WishListServiceProps extends cdk.StackProps {
  wishListTable: dynamodb.Table
}

export class WishListServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WishListServiceProps) {
    super(scope, id, props);

    const auth = new Auth(this, 'WishListAuth', {table: props.wishListTable});

    const createFamily = this.createLambdaHandler( 'create-family', props.wishListTable, 'readWrite');
    const postGift = this.createLambdaHandler( 'post-gift', props.wishListTable, 'write');
    const getGift = this.createLambdaHandler('get-gift', props.wishListTable, 'read');
    const getFamilyBoard = this.createLambdaHandler('get-family-board', props.wishListTable, 'read');

    new WishListRestApi(this, 'WishListRestApi', {
      postGiftLambda: postGift.handler,
      getGiftLambda: getGift.handler,
      createFamilyLambda: createFamily.handler,
      getFamilyBoardLambda: getFamilyBoard.handler,
      appClientId: auth.appClientId,
      userPoolId: auth.userPoolId
    });
  }

  private createLambdaHandler(
    functionName: string,
    table: dynamodb.Table,
    access: string,
  ): WishListHandler {
    return new WishListHandler(this, `${functionName}-handler`, {
      functionName,
      wishListTable: table,
      access
    });
  }
}
