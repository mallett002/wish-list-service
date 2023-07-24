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
    createInvitationLambda: lambda.Function,
    searchMemberLambda: lambda.Function,
    handleInvitationLambda: lambda.Function,
    deleteInvitationLambda: lambda.Function,
    appClientId: string,
    userPoolId: string,
}


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

        const families = api.root.addResource('families');  // /families
        const rootMembers = api.root.addResource('members'); // /members
        const member = rootMembers.addResource('{email}'); // /members/{email}
        const memberFamilies = member.addResource('families'); // /members/{email}/families
        const family = families.addResource('{familyId}');  // /families/{familyId}
        const members = family.addResource('members');      // /families/{familyId}/members
        const invitations = family.addResource('invitations'); // /families/{familyId}/invitations
        const board = family.addResource('board');          // /families/{familyId}/board
        const familyMember = members.addResource('{email}'); // /families/{id}/members/{email}
        const gifts = familyMember.addResource('gifts'); // /families/{id}/members/{email}/gifts
        const gift = gifts.addResource('{giftId}'); // /families/{id}/members/{email}/gifts/{giftId}
        const invitation = invitations.addResource('{email}'); // /families/{familyId}/invitations/{email}

        // Create family: POST /families
        const createFamilyIntegration = new apigateway.LambdaIntegration(props.createFamilyLambda, { proxy: true, });
        families.addMethod('POST', createFamilyIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        authLambda.grantInvoke(props.createFamilyLambda);

        // Create gift: POST /families/{id}/members/{email}/gifts/
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
        // Get gift: GET /families/{id}/members/{email}/gifts/{giftId}
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

        // Get families for member: GET /members/{email}/families
        const getFamiliesForMemberIntegration = new apigateway.LambdaIntegration(props.getFamiliesForMemberLambda, { proxy: true });
        memberFamilies.addMethod('GET', getFamiliesForMemberIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        memberFamilies.addCorsPreflight({
            allowOrigins: ['localhost']
        });
        authLambda.grantInvoke(props.getFamiliesForMemberLambda);

        // Create invitation: POST /families/{familyId}/invitations
        const createInvitationIntegration = new apigateway.LambdaIntegration(props.createInvitationLambda, {
            proxy: true
        });
        invitations.addMethod('POST', createInvitationIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        invitations.addCorsPreflight({
            allowOrigins: ['localhost']
        });
        authLambda.grantInvoke(props.createInvitationLambda);

        // Search member: GET /members?email=<email>
        const searchMemberIntegration = new apigateway.LambdaIntegration(props.searchMemberLambda, { 
            proxy: true,
            requestParameters: {
                "integration.request.querystring.email":
                "method.request.querystring.email", 
            }
         });
        rootMembers.addMethod('GET', searchMemberIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
            requestParameters: {
                "method.request.querystring.email": true,
            }
        });
        rootMembers.addCorsPreflight({
            allowOrigins: ['localhost']
        });
        authLambda.grantInvoke(props.searchMemberLambda);


        // Update invitation: PUT /families/{familyId}/invitations/{email}
        const handleInvitationIntegration = new apigateway.LambdaIntegration(props.handleInvitationLambda, {
            proxy: true
        });
        invitation.addMethod('PUT', handleInvitationIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        invitation.addCorsPreflight({
            allowOrigins: ['localhost']
        });
        authLambda.grantInvoke(props.handleInvitationLambda);

        // Delete invitation: DELETE /families/{familyId}/invitations/{email}
        const deleteInvitationIntegration = new apigateway.LambdaIntegration(props.deleteInvitationLambda, {
            proxy: true
        });
        invitation.addMethod('DELETE', deleteInvitationIntegration, {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
        });
        authLambda.grantInvoke(props.deleteInvitationLambda);
    }
}
