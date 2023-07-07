import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';


interface WishListRestApiProps {
    postGiftLambda: lambda.Function,
    getGiftLambda: lambda.Function,
    createFamilyLambda: lambda.Function,
    getFamilyBoardLambda: lambda.Function,
    getFamiliesForMemberLambda: lambda.Function,
    appClientId: string,
    userPoolId: string,
}


// Todo: Change users to members
// Going through this guide: https://aws-cdk.com/cognito-google
// hosted UI accessible at: https://wish-list.auth.us-east-1.amazoncognito.com/
// redirect URI for Google: https://wish-list.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
export class WishListRestApi extends Construct {
    public readonly appClientId: string;
    public readonly userPoolId: string;

    constructor(scope: Construct, id: string, props: WishListRestApiProps) {
        super(scope, id);

        const api = new apigateway.RestApi(this, 'wish-list-api', {
            endpointConfiguration: { types: [apigateway.EndpointType.REGIONAL] }
        });

        const authLambda = new lambda.DockerImageFunction(this, 'authorizer-lambda', {
            code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', '..', '..', 'functions', 'authorizer')),
            architecture: lambda.Architecture.ARM_64,
            environment: {
                APP_CLIENT_ID: props.appClientId,
                USER_POOL_ID: props.userPoolId
            }
        });

        const authorizer = new apigateway.RequestAuthorizer(this, 'wish-list-request-authorizer', {
            handler: authLambda,
            identitySources: [apigateway.IdentitySource.header('Authorization')],
            resultsCacheTtl: cdk.Duration.seconds(0),
        });

        const families = api.root.addResource('families');
        const family = families.addResource('{familyId}');
        const members = family.addResource('members');
        const board = family.addResource('board');
        const memberId = members.addResource('{memberId}');
        const gifts = memberId.addResource('gifts');
        const memberFamilies = memberId.addResource('families');
        const gift = gifts.addResource('{giftId}');

        // Create family: POST /families
        const createFamilyIntegration = new apigateway.LambdaIntegration(props.createFamilyLambda, { proxy: true, });
        families.addMethod('POST', createFamilyIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        authLambda.grantInvoke(props.createFamilyLambda);

        // Create gift: POST /families/{id}/members/{memberId}/gifts/
        const postGiftIntegration = new apigateway.LambdaIntegration(props.postGiftLambda, { proxy: true });
        gifts.addMethod('POST', postGiftIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        gifts.addCorsPreflight({
            allowOrigins: ['localhost']
        });
        authLambda.grantInvoke(props.postGiftLambda);

        // Todo: make this a PUT to update the gift
        // Get gift: GET /families/{id}/members/{memberId}/gifts/{giftId}
        // const getGiftIntegration = new apigateway.LambdaIntegration(props.getGiftLambda, { proxy: true });
        // gift.addMethod('GET', getGiftIntegration, {
        //     authorizer: authorizer,
        //     authorizationType: apigateway.AuthorizationType.CUSTOM,
        // });
        // gift.addCorsPreflight({
        //     allowOrigins: ['localhost']
        // });
        // authLambda.grantInvoke(props.getGiftLambda);

        // Get family board: GET /families/{id}/board
        const getFamilyBoardIntegration = new apigateway.LambdaIntegration(props.getFamilyBoardLambda, { proxy: true });
        board.addMethod('GET', getFamilyBoardIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        board.addCorsPreflight({
            allowOrigins: ['localhost']
        });
        authLambda.grantInvoke(props.getFamilyBoardLambda);

        // Get families for member: GET /members/{memberId}/families
        const getFamiliesForMemberIntegration = new apigateway.LambdaIntegration(props.getFamiliesForMemberLambda, { proxy: true });
        memberFamilies.addMethod('GET', getFamiliesForMemberIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        board.addCorsPreflight({
            allowOrigins: ['localhost']
        });
        authLambda.grantInvoke(props.getFamiliesForMemberLambda);
    }
}
