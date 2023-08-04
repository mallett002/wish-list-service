import { DynamoDBClient, PutItemCommand, GetItemCommandInput, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyResult } from 'aws-lambda';
// @ts-ignore
import multipart from 'aws-lambda-multipart-parser';
import { parse } from 'aws-multipart-parser';

/*
Clients have to provide an Accept header as part of their request.
Value for Accept header should match one you are using as a return Content-Type
from your Lambda. (image/png)
*/

// POST /families/{familyId}/image
// saves image name in dynamo and uploads the image to s3
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const s3Client = new S3Client({ region: "us-east-1" });
    const { familyId } = event.pathParameters;

    // Is this binary? is this base64 encoded?
    console.log({ event });
    console.log({ headers: event.headers });

    try {
        // const form = await multipart.parse(event, true);
        const form = parse(event, event.isBase64Encoded);
        console.log({ form });

        const key = `${familyId}_${form.file.filename}`

        // I think I'm calling s3 incorrectly or something
        const input = {
            Bucket: 'wish-list-family-image',
            Key: key,
            Body: form.file.content,
            // Body: Buffer.from(form.file.content as string, 'binary'),
            ContentType: form.file.contentType,
        };

        const command = new PutObjectCommand(input);
        console.log({ command });

        const putS3Response = await client.send(command);
        console.log({ putS3Response });

        return {
            statusCode: 201,
            headers: {
                // "Content-Type": "multipart/form-data",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            // isBase64Encoded: true, // this has to be encoded...
            body: JSON.stringify({ data: putS3Response })
        };
    } catch (error) {
        console.log(JSON.stringify({ error }));

        return {
            statusCode: 500,
            headers: {
                // "Content-Type": "multipart/form-data",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            // isBase64Encoded: true, // this has to be encoded...
            body: JSON.stringify({ error })
        };
    }

    // body has to be base64 encoded. I think that's why it's returning 500

};
