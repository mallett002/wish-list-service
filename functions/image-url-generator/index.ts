import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    PutObjectCommandInput,
    GetObjectCommandInput
} from '@aws-sdk/client-s3';
import {
    DynamoDBClient,
    PutItemCommand,
    GetItemCommandInput,
    GetItemCommand,
    UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyResult } from 'aws-lambda';

const PUT_OBJECT = 'PUT_OBJECT';
const GET_OBJECT = 'GET_OBJECT';


// POST /families/{familyId}/image
// creates pre-signed urls to upload and fetch images
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const s3Client = new S3Client({ region: 'us-east-1' });
    const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });

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
            const input: PutObjectCommandInput = {
                Bucket: 'wish-list-family-image',
                Key: `${familyId}${fileType}`,
                ContentType: contentType
            };

            const command = new PutObjectCommand(input);
            const imageUploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

            // Update familyImage item to be the contentType of this image. (Need this for fetching the image)
            const getFamilyInput: GetItemCommandInput = {
                "Key": {
                    "PK": {
                        "S": `FAMILY#${familyId}`
                    },
                    "SK": {
                        "S": 'MEMBER#BOARD'
                    }
                },
                "TableName": "wish-list-table"
            };

            const getFamilyCommand = new GetItemCommand(getFamilyInput);
            const { Item: familyItem } = await dynamoClient.send(getFamilyCommand);

            if (familyItem) {
                if (familyItem.familyImage.S !== contentType) {
                    const updateImageInput = {
                        "ExpressionAttributeNames": {
                            "#FI": "familyImage", // Todo: change this attribute to name "imageContentType"
                        },
                        "ExpressionAttributeValues": {
                            ":value": {
                                "S": contentType
                            },
                        },
                        "Key": {
                            PK: {
                                S: `FAMILY#${familyId}`
                            },
                            SK: {
                                S: 'MEMBER#BOARD'
                            }
                        },
                        "ReturnValues": "ALL_NEW", // DON'T CARE ABOUT THIS, remove it
                        "TableName": "wish-list-table",
                        "UpdateExpression": "SET #FI = :value"
                    };
                    const updateImageCommand = new UpdateItemCommand(updateImageInput);
                    const updateImageResponse = await dynamoClient.send(updateImageCommand);
                    console.log({ updateImageResponse });

                }
            } else {
                return {
                    statusCode: 422,
                    headers: {
                        "Content-Type": 'application/json',
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true
                    },
                    body: JSON.stringify({ message: `Unprocessable Entity: Family with id ${familyId} not found.` })
                };
            }

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

        const input: GetObjectCommandInput = {
            Bucket: 'wish-list-family-image',
            Key: `${familyId}${fileType}`,
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
