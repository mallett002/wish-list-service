import { DynamoDBClient, PutItemCommand, GetItemCommandInput, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda';

// interface IUploadImageParams extends APIGatewayProxyEventPathParameters {
//     familyId: string
// }

/*
Clients have to provide an Accept header as part of their request.
Value for Accept header should match one you are using as a return Content-Type
from your Lambda. (image/png)
*/

// POST /families/{familyId}/images
// saves image name in dynamo and uploads the image to s3
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const s3Client = new S3Client({ region: "us-east-1" });
    const { familyId } = event.pathParameters;

    // Is this an octet stream? is this base64 encoded?
    console.log({body: event.body});

    return {
        statusCode: 201,
        headers: {
            // "Content-Type": "image/png",
            "Content-Type": "application/octet-stream",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        isBase64Encoded: true, // this has to be encoded...
        body: "base64.b64encode(image).decode('utf-8')"
    };
};
