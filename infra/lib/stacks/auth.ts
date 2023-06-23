import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from "aws-cdk-lib/aws-cognito";

export class Auth extends Construct {
    public readonly appClientId: string;
    public readonly userPoolId: string;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const userPool = new cognito.UserPool(this, 'wish-list-cognito-user-pool', {
            removalPolicy: RemovalPolicy.DESTROY,
            selfSignUpEnabled: true,
            autoVerify: {email: true},
        });
        
        this.userPoolId = userPool.userPoolId;
        
        userPool.addDomain('wish-list-domain', {
            cognitoDomain: {
                domainPrefix: 'wish-list',
            },
        });

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

        this.appClientId = client.userPoolClientId;

        new cdk.CfnOutput(this, 'appClientId', { value: this.appClientId });
        new cdk.CfnOutput(this, 'userPoolId', { value: this.userPoolId });

    }
}
