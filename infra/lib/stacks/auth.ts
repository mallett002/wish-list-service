import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { RemovalPolicy } from 'aws-cdk-lib';
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface AuthProps {
    table: dynamodb.Table
}

export class Auth extends Construct {
    public readonly appClientId: string;
    public readonly userPoolId: string;
    public readonly postConfirmationLambda: lambda.Function;

    constructor(scope: Construct, id: string, props: AuthProps) {
        super(scope, id);

        this.postConfirmationLambda = new lambda.DockerImageFunction(this, 'post-confirmation-lambda', {
            code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', '..', '..', 'functions', 'post-confirmation')),
            architecture: lambda.Architecture.ARM_64,
        });

        props.table.grantWriteData(this.postConfirmationLambda);

        const userPool = new cognito.UserPool(this, 'wish-list-cognito-user-pool', {
            removalPolicy: RemovalPolicy.DESTROY,
            selfSignUpEnabled: true,
            autoVerify: {email: true},
            lambdaTriggers: {postConfirmation: this.postConfirmationLambda}
        });
        
        this.userPoolId = userPool.userPoolId;
        
        userPool.addDomain('wish-list-domain', {
            cognitoDomain: {
                domainPrefix: 'wish-list',
            },
        });

        const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
        const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

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
