import { Construct } from "constructs";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface WishListRestApiProps {
    postGiftLambda: lambda.Function
}

export class WishListRestApi extends Construct {

  constructor(scope: Construct, id: string, props: WishListRestApiProps) {
    super(scope, id);

    // do lambda proxy integration (so can access request body)
    const api = new apigateway.RestApi(this, 'wish-list-api', {
      endpointConfiguration: {types: [apigateway.EndpointType.REGIONAL]},
    //   defaultCorsPreflightOptions: {
    //     allowOrigins: ['*']
    //   }
    });

    // Access-Control-Allow-Origin: http://my-cool-site.com
    // /gifts
    const gifts = api.root.addResource('gifts');
    const postGiftIntegration = new apigateway.LambdaIntegration(props.postGiftLambda, {proxy: true});

    gifts.addMethod('POST', postGiftIntegration);
    // gifts.addCorsPreflight()

    // /gifts/{id}
    const gift = gifts.addResource('{gift_id}');
  }
}
