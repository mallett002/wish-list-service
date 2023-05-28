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
    const api = new apigateway.RestApi(this, 'books-api', {
      endpointConfiguration: {types: [apigateway.EndpointType.REGIONAL]}
    });

    // /gifts
    const gifts = api.root.addResource('gifts');
    const postGiftIntegration = new apigateway.LambdaIntegration(props.postGiftLambda);

    gifts.addMethod('POST', postGiftIntegration);

    // /gifts/{id}
    const gift = gifts.addResource('{gift_id}');
  }
}
