import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    PutObjectCommandInput,
    GetObjectCommandInput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyResult } from 'aws-lambda';
import { parse } from 'aws-multipart-parser';

/*
Clients have to provide an Accept header as part of their request.
Value for Accept header should match one you are using as a return Content-Type
from your Lambda. (image/png)
*/
const PUT_OBJECT = 'PUT_OBJECT';
const GET_OBJECT = 'GET_OBJECT';


// POST /families/{familyId}/image
// uploads the family image to s3 by its familyId
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const s3Client = new S3Client({ region: 'us-east-1' });
    const { familyId } = event.pathParameters;
    const { contentType, operation } = JSON.parse(event.body || '{}');
    const fileType = contentType === 'image/png' ? '.png' : '.jpeg';
    const validOperation = [PUT_OBJECT, GET_OBJECT].includes(operation);

    if (
        !operation ||
        !validOperation ||
        operation === PUT_OBJECT && !contentType ||
        !['image/png', 'image/jpeg'].includes(contentType)
    ) {
        console.log({ contentType, operation });

        return {
            statusCode: 400,
            headers: {
                "Content-Type": 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: 'Bad Request: Invalid contentType or operation' })
        };
    }

    try {

        if (operation === PUT_OBJECT) {
            // This is uploading as png correctly now.
            const input: PutObjectCommandInput = {
                Bucket: 'wish-list-family-image',
                Key: `${familyId}${fileType}`,
                ContentType: contentType,
                // ContentDisposition: contentType
                // Metadata: {
                //     'Content-Type': contentType
                // }
            };

            const command = new PutObjectCommand(input);
            const imageUploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

            return {
                statusCode: 200,
                headers: {
                    "Content-Type": 'application/json',
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true
                },
                body: JSON.stringify({ imageUploadUrl })
            };
        }
        // else it's a GET_OBJECT:

        const input: GetObjectCommandInput = {
            Bucket: 'wish-list-family-image',
            Key: `${familyId}${fileType}`,
            // ResponseContentType: contentType,
        };

        const command = new GetObjectCommand(input);
        const fetchImageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        console.log({ fetchImageUrl });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ fetchImageUrl })
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
            body: JSON.stringify({ message: 'Something went wrong generating upload url' })
        };
    }
};
