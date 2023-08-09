import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyResult } from 'aws-lambda';
import { parse } from 'aws-multipart-parser';

/*
Clients have to provide an Accept header as part of their request.
Value for Accept header should match one you are using as a return Content-Type
from your Lambda. (image/png)
*/


// POST /families/{familyId}/image
// uploads the family image to s3 by its familyId
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const s3Client = new S3Client({ region: 'us-east-1' });
    const { familyId } = event.pathParameters;

    try {
        const { file: { content, contentType } } = parse(event, event.isBase64Encoded);
        const input = {
            Bucket: 'wish-list-family-image',
            Key: familyId,
            Body: content,
            ContentType: contentType,
        };

        console.log({ content });
        const command = new PutObjectCommand(input);
        const putS3Response = await s3Client.send(command);
        console.log({ putS3Response }); // content is an array buffer

        const getImageInput = {
            "Bucket": "wish-list-family-image",
            "Key": familyId
        };
        const getInputCommand = new GetObjectCommand(getImageInput);
        const getImageResponse = await s3Client.send(getInputCommand);
        console.log({getImageResponse});
        
        // on to something here I think...
        // const body = await getImageResponse.Body?.transformToString('base64') || '';
        // this looks promising: 

        return {
            statusCode: 201,
            headers: {
                "Content-Type": 'image/png',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            isBase64Encoded: true,
            // body: Buffer.from(body, 'binary').toString('base64')
            // body: getImageResponse?.Body?.toString('base64') || '';
            // body: JSON.stringify(getImageResponse.Body)
            body: await getImageResponse.Body?.transformToString('base64') || ''
        };
    } catch (error) {
        console.log(JSON.stringify({ error }));

        return {
            statusCode: 500,
            headers: {
                "Content-Type": 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: 'Something went wrong uploading image' })
        };
    }
};
