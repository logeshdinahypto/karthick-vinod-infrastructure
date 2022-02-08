import {App, Construct, Stack, StackProps} from "@aws-cdk/core";
import {NetworkLayer} from "../lib/network-layer";
import {DataLayer} from "../lib/data-layer";
import {DeploymentLayer} from "../lib/deployment-layer";
import {ServiceFactory} from "../lib/service-layer/factory/service-factory";
import {Service} from "../lib/configurations/service";
import {Infrastructure} from "../lib/configurations/infra";
import {Database} from "../lib/configurations/database";
import {Cache} from "../lib/configurations/cache";
import {Deployment} from "../lib/configurations/deployment";

class CompleteStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const cache: Cache = {
            name: 'karthick-vinod',
            id: 'karthick-vinod',
            cacheConfig: 'None'
        }

        const database: Database = {
            name: 'karthick_vinod',
            databaseConfig: 'None',
            databasePasswordPrefix: 'karthick-vinod'
        }

        const service: Service = {
            name: 'karthick-vinod',
            protocol: 'GRPC',
            serverConfig: 'Fargate',
            repoName: 'karthick-vinod',
            framework: 'Kotlin',
            zoneName: 'hypto.com',
            endpoint: 'karthick-vinod.hypto.com',
            directory: '../karthick-vinod-service-server'
        }

        const deployment: Deployment = {
            deploymentConfig: 'CI-CD',
            deploymentParamPrefix: 'karthick-vinod',
            // slackConfigId: 'KarthickVinod',
            // slackConfigName: 'karthick-vinod'
        }

        const infraConfig : Infrastructure = {
            deployment,
            cache,
            database,
            service
        }

        const networkLayer = new NetworkLayer(this, 'NetworkLayer', { conf: infraConfig });
        const dataLayer = new DataLayer(this, 'DataLayer', {
            networkLayer,
            cache: infraConfig.cache,
            database: infraConfig.database
        });

        const serviceFactory = ServiceFactory.instance(service);
        serviceFactory.serviceLayer(this, 'ServiceLayer', {
            service,
            networkLayer,
            dataLayer,
            cacheConf: infraConfig.cache.cacheConfig,
            dbConf: infraConfig.database.databaseConfig
        });

        new DeploymentLayer(this, 'CICDLayer', { serviceFactory, deployment });
    }
}

const app = new App();
new CompleteStack(app, 'KarthickVinod', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
});
app.synth();
