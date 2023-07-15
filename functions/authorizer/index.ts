import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { APIGatewayAuthorizerResult, PolicyDocument } from 'aws-lambda';


// Todo: check if memberId is in the path, if is, make sure it's the same memberId as in the decrypted token
  // it should only be in the path if the session user is the one making the call
export const handler = async (event: any): Promise<APIGatewayAuthorizerResult> => {
  console.log(JSON.stringify({event: event.headers}));
  
  const { authorization } = event.headers;

  if (!authorization) {
    console.error('Missing authorization token');
    throw new Error('Unauthorized');
  }

  try {
    const verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.USER_POOL_ID || '',
      tokenUse: "access",
      clientId: process.env.APP_CLIENT_ID || '',
    });
  
    const [, encryptedToken] = authorization.split(' ');
  
    const decodedJWT = await verifier.verify(encryptedToken);

    const policyDocument: PolicyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event['methodArn'],
        },
      ],
    };

    const context = {
      memberId: decodedJWT.sub,
    };

    const response: APIGatewayAuthorizerResult = {
      principalId: decodedJWT.sub,
      policyDocument,
      context,
    };

    console.log(`response => ${JSON.stringify(response)}`);

    return response;

  } catch (err) {

    console.error('Invalid auth token. err => ', err);
    throw new Error('Unauthorized');

  }
};
