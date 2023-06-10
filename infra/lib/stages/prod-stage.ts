import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { WishListServiceStack } from '../stacks/wish-list-service-stack';
import { WishListDBStack } from '../stacks/db-stack';


export class ProdStage extends cdk.Stage {

    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
        super(scope, id, props);

        // DB stack
        // const dbStack = new WishListDBStack(this, 'WishListDBStack', {
        //     env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
        // });

        // App Stack
        const appStack = new WishListServiceStack(this, 'WishListServiceStack', {
            env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
            // wishListTable: dbStack.wishListTable
        });
    }
}