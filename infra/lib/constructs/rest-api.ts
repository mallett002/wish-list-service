import { Construct } from "constructs";
import { RemovalPolicy } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as secretsManager from "aws-cdk-lib/aws-secretsmanager";


interface WishListRestApiProps {
    postGiftLambda: lambda.Function,
    getGiftLambda: lambda.Function
}

export class WishListRestApi extends Construct {

    constructor(scope: Construct, id: string, props: WishListRestApiProps) {
        super(scope, id);


        const api = new apigateway.RestApi(this, 'wish-list-api', {
            endpointConfiguration: { types: [apigateway.EndpointType.REGIONAL] },
            //   defaultCorsPreflightOptions: {
            //     allowOrigins: ['*']
            //   }
            // defaultMethodOptions: {
            //     authorizationScopes: 
            // }
        });

        const userPool = new cognito.UserPool(this, 'wish-list-cognito-user-pool', {
            removalPolicy: RemovalPolicy.DESTROY,
            selfSignUpEnabled: true,
            autoVerify: {email: true}
        });

        // const fullAccessScope = new cognito.ResourceServerScope({
        //     scopeName: "*",
        //     scopeDescription: "Full access"
        // });

        // const userServer = userPool.addResourceServer("ResourceServer", {
        //     identifier: "WishListResourceServer",
        //     scopes: [fullAccessScope]
        // });

        userPool.addDomain('wish-list-domain', {
            cognitoDomain: {
                domainPrefix: 'wish-list',
            },
        });

        // Going through this guide: https://aws-cdk.com/cognito-google
        // hosted UI accessible at: https://wish-list.auth.us-east-1.amazoncognito.com/
        // redirect URI for Google: https://wish-list.auth.us-east-1.amazoncognito.com/oauth2/idpresponse

        // const appSecrets = secretsManager.Secret.fromSecretNameV2(this, 'wish-list-secrets', "wishlist/secrets");
        // const clientId = appSecrets.secretValueFromJson('CLIENT_ID').unsafeUnwrap();
        // const clientSecret = appSecrets.secretValueFromJson('CLIENT_SECRET');
        const googleClientId = '947556182196-7arnkmnq4q7rnb0bac1b1k6560iou6nu.apps.googleusercontent.com';
        const googleClientSecret = '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';

        const userPoolIdentityProviderGoogle = new cognito.UserPoolIdentityProviderGoogle(this, 'MyUserPoolIdentityProviderGoogle', {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            userPool: userPool,
            scopes: ['profile', 'email', 'openid'],
            attributeMapping: {
                email: cognito.ProviderAttribute.GOOGLE_EMAIL,
                familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
                givenName: cognito.ProviderAttribute.GOOGLE_NAME,
                profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE
            }
        });

        const callbackUrl = 'http://localhost:3000/api/auth/callback/cognito';

        const client = new cognito.UserPoolClient(this, "UserPoolClient", {
            userPool,
            generateSecret: true,
            supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.GOOGLE],
            oAuth: {
                callbackUrls: [callbackUrl],
                flows: { authorizationCodeGrant: true },
                scopes: [
                    //  cognito.OAuthScope.resourceServer(userServer, fullAccessScope), 
                     cognito.OAuthScope.OPENID,
                     cognito.OAuthScope.PHONE,
                     cognito.OAuthScope.EMAIL,
                     cognito.OAuthScope.PROFILE
                 ],
            },
        });

        client.node.addDependency(userPoolIdentityProviderGoogle);

        // const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'wish-list-cognito-authorizer', {
        //     cognitoUserPools: [userPool],
        // });

        const families = api.root.addResource('families');
        const family = families.addResource('{familyId}');
        const users = family.addResource('users');
        const username = users.addResource('{username}');
        const gifts = username.addResource('gifts');
        const gift = gifts.addResource('{giftId}');

        // Create gift: POST /families/{id}/users/{username}/gifts/
        const postGiftIntegration = new apigateway.LambdaIntegration(props.postGiftLambda, { proxy: true });
        gifts.addMethod('POST', postGiftIntegration, {
            // authorizer,
            // authorizationType: apigateway.AuthorizationType.COGNITO,
            // authorizationScopes: ["WishListResourceServer/*"]
        });
        gifts.addCorsPreflight({
            allowOrigins: ['localhost']
        });


        // Get gift: GET /families/{id}/users/{username}/gifts/{giftId}
        const getGiftIntegration = new apigateway.LambdaIntegration(props.getGiftLambda, { proxy: true });
        gift.addMethod('GET', getGiftIntegration, {
            // authorizer,
            // authorizationType: apigateway.AuthorizationType.COGNITO,
            // authorizationScopes: ["WishListResourceServer/*"]
        });
        gift.addCorsPreflight({
            allowOrigins: ['localhost']
        });








        // Front end app should do this:-------------------------------------------------------
        // cognitoClientId & secret are not google credentials. They are generated by UserPoolClient and can be found in aws console
        // const cognitoClientId = '...';
        // const cognitoClientSecret = '...';

        // const code = '...'; // ?code=xxx received as query param

        // const authorizationEncoded = Buffer.from(`${cognitoClientId}:${cognitoClientSecret}`).toString("base64");

        // const data = new URLSearchParams(Object.entries({
        //     client_id: cognitoClientId,
        //     code,
        //     grant_type: "authorization_code",
        //     redirect_uri: callbackUrl
        // }));

        // const result = await axios.post(`https://${uniquePrefix}.auth.${region}.amazoncognito.com/oauth2/token`, data.toString(), {
        //     headers: {
        //         Authorization: `Basic ${authorizationEncoded}`,
        //         "Content-Type": "application/x-www-form-urlencoded",
        //     },
        // });

        // const longLivedCredentials = result.data; // Contains {IdToken, AccessToken, RefreshToken...}

        // nextauth: https://next-auth.js.org/providers/cognito
    }
}
