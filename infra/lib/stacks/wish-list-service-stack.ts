import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
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
    const getFamiliesForMember = this.createLambdaHandler('get-families', props.wishListTable, 'read');
    const createInvitation = this.createLambdaHandler('create-invitation', props.wishListTable, 'readWrite');
    const searchMember = this.createLambdaHandler('search-member', props.wishListTable, 'read');
    const handleInvitation = this.createLambdaHandler('handle-invitation', props.wishListTable, 'readWrite');
    const deleteInvitation = this.createLambdaHandler('delete-invitation', props.wishListTable, 'write');
    const updateGift = this.createLambdaHandler('update-gift', props.wishListTable, 'write');
    const deleteGift = this.createLambdaHandler('delete-gift', props.wishListTable, 'write');
    const imageUrlGenerator = this.createLambdaHandler('image-url-generator', props.wishListTable, 'readWrite');

    new WishListRestApi(this, 'WishListRestApi', {
      postGiftLambda: postGift.handler,
      getGiftLambda: getGift.handler,
      createFamilyLambda: createFamily.handler,
      getFamilyBoardLambda: getFamilyBoard.handler,
      getFamiliesForMemberLambda: getFamiliesForMember.handler,
      createInvitationLambda: createInvitation.handler,
      searchMemberLambda: searchMember.handler,
      handleInvitationLambda: handleInvitation.handler,
      deleteInvitationLambda: deleteInvitation.handler,
      updateGiftLambda: updateGift.handler,
      deleteGiftLambda: deleteGift.handler,
      imageUrlGeneratortLambda: imageUrlGenerator.handler,
      appClientId: auth.appClientId,
      userPoolId: auth.userPoolId
    });

    const familyImageBucket = new s3.Bucket(this, 'FamilyImageBucket', {
      bucketName: 'wish-list-family-image',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    familyImageBucket.grantReadWrite(imageUrlGenerator.handler);
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
