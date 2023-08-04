import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
    const s3Client = new S3Client({ region:'us-east-1' });
    const { familyId } = event.pathParameters;

    try {
        const form = parse(event, event.isBase64Encoded);
        const input = {
            Bucket: 'wish-list-family-image',
            Key: familyId,
            Body: form.file.content,
            ContentType: form.file.contentType,
        };

        const command = new PutObjectCommand(input);
        const putS3Response = await s3Client.send(command);
        console.log({ putS3Response });

        // Now make this return the image as multipart/form-data
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
            body: JSON.stringify({ message: 'Something went wrong uploading image' })
        };
    }
};
