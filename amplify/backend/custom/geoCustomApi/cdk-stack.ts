import * as cdk from '@aws-cdk/core';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';
import * as ssm from '@aws-cdk/aws-ssm';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from "@aws-cdk/aws-iam";
import * as iot from '@aws-cdk/aws-iot';
import * as events from '@aws-cdk/aws-events';
const location = require('@aws-cdk/aws-location');
const pinpoint = require('@aws-cdk/aws-pinpoint');
const iotactions = require('@aws-cdk/aws-iot-actions');
const actions = require("@aws-cdk/aws-events-targets");

export class cdkStack extends cdk.Stack {    
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
    });
    const projectName = AmplifyHelpers.getProjectInfo().projectName;

    const dependencies: AmplifyDependentResourcesAttributes = AmplifyHelpers.addResourceDependency(this,
      amplifyResourceProps.category,
      amplifyResourceProps.resourceName,
      [{
        category: "auth", // api, auth, storage, function, etc.
        resourceName: "geotrack733e9fa8" // find the resource at "amplify/backend/<category>/<resourceName>"
      },
      {
        category: "api", // api, auth, storage, function, etc.
        resourceName: "geotrack" // find the resource at "amplify/backend/<category>/<resourceName>"
      }]
    );

    const graphQlEndpoint = cdk.Fn.ref(dependencies.api.geotrack.GraphQLAPIEndpointOutput)

    new ssm.CfnParameter(this, 'CfnGraphQlEndpointParameter', {
      type: 'String',
      value: `${graphQlEndpoint}`,
      name: `/amplify/${projectName}/appsyncUrl`,
    });

    const cognitoPoolId = cdk.Fn.ref(dependencies.auth.geotrack733e9fa8.UserPoolId)
    const REGION = cdk.Stack.of(this).region;
    const ACCOUNT = cdk.Stack.of(this).account;
    const cognitoArn = `arn:aws:cognito-idp:${REGION}:${ACCOUNT}:userpool/${cognitoPoolId}`;

    new ssm.CfnParameter(this, 'CfnPoolIdParameter', {
      type: 'String',
      value: `${cognitoPoolId}`,
      name: `/amplify/${projectName}/cognitoPoolId`,
    });

    const api = new apigateway.RestApi(this, 'cfnRestApi', {
      restApiName: `api-${projectName}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      },
      deploy: false
    });

    const deployment  = new apigateway.Deployment(this, 'CfnApiDeployment', { api });

    new apigateway.Stage(this, 'CfnApiStage', { 
      deployment,
      stageName: 'v1'
    })

    const resource = api.root.addResource('mock');

    new apigateway.CfnAuthorizer(this, 'CfnAuthorizer', {
      name: `auth-${projectName}`,
      restApiId: api.restApiId,
      type: apigateway.AuthorizationType.COGNITO,
      authType: 'COGNITO_USER_POOLS',
      identitySource: 'method.request.header.Authorization',
      providerArns: [cognitoArn],
    });

    resource.addMethod('ANY', new apigateway.MockIntegration({
      integrationResponses: [
        { statusCode: '200' },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{ "statusCode": 200 }',
      },
    }), {
      methodResponses: [
        { statusCode: '200' },
      ],
    });

    const appSyncPolicy = new iam.PolicyStatement()
    appSyncPolicy.addActions("appsync:GraphQL")
    appSyncPolicy.addActions("appsync:GetGraphqlApi")
    appSyncPolicy.addActions("appsync:ListGraphqlApis")
    appSyncPolicy.addActions("appsync:ListApiKeys")
    appSyncPolicy.addAllResources()

    const pinpointPolicy = new iam.PolicyStatement()    
    pinpointPolicy.addActions("mobiletargeting:GetEndpoint")
    pinpointPolicy.addActions("mobiletargeting:UpdateEndpoint")
    pinpointPolicy.addActions("mobiletargeting:UpdateEndpointsBatch")
    pinpointPolicy.addAllResources()

    const geoPolicy = new iam.PolicyStatement()
    geoPolicy.addActions("geo:CalculateRoute")
    geoPolicy.addActions("geo:ListRouteCalculators")
    geoPolicy.addActions("geo:ListTrackers")
    geoPolicy.addActions("geo:ListTrackerConsumers")
    geoPolicy.addActions("geo:BatchUpdateDevicePosition")
    geoPolicy.addActions("geo:BatchGetDevicePosition")            
    geoPolicy.addActions("geo:GetDevicePositionHistory")
    geoPolicy.addActions("geo:DescribeTracker")      
    geoPolicy.addActions("geo:UpdateTracker")
    geoPolicy.addResources(this.formatArn({
      service: 'geo',
      resource: `${projectName}*`,
      sep: ':'
      }
    ));

    const iotPolicy = new iam.PolicyStatement()
    iotPolicy.addActions("iot:Connect")
    iotPolicy.addActions("iot:Publish")
    iotPolicy.addActions("iot:Subscribe")
    iotPolicy.addActions("iot:Receive")
    iotPolicy.addActions("iot:GetThingShadow")
    iotPolicy.addActions("iot:UpdateThingShadow")
    iotPolicy.addActions("iot:DeleteThingShadow")
    iotPolicy.addActions("iot:ListNamedShadowsForThing")
    iotPolicy.addAllResources()    

    const ssmReadPolicy = new iam.PolicyStatement()
    ssmReadPolicy.addActions("ssm:GetParameters")
    ssmReadPolicy.addActions("ssm:GetParameter")
    ssmReadPolicy.addActions("ssm:GetParametersByPath")
    ssmReadPolicy.addResources(this.formatArn({
       service: 'ssm',
       resource: `/amplify/${projectName}*`,
       sep: ':'
     }
    ));

    // 
    // Amazon Location Resources
    // 

    const locationMap = new location.CfnMap(this, 'CfnMap', {
      configuration: {
        style: 'vectorEsriStreets',
      },
      mapName: `map-${projectName}-${cdk.Fn.ref('env')}`,
      pricingPlan: 'requestBasedUsage'
    });

    const locationGeofenceCollection = new location.CfnGeofenceCollection(this, 'CfnGeofenceCollection', {
      collectionName: `geo-${projectName}-${cdk.Fn.ref('env')}`,
      pricingPlan: 'requestBasedUsage'
    });

    const locationRoute = new location.CfnRouteCalculator(this, 'CfnRouteCalculator', {
      calculatorName: `route-${projectName}-${cdk.Fn.ref('env')}`,
      dataSource: 'Esri',
      pricingPlan: 'requestBasedUsage'
    });
    
    const locationTracker = new location.CfnTracker(this, 'CfnTracker', {
      pricingPlan: 'requestBasedUsage',
      trackerName: `tracker-${projectName}-${cdk.Fn.ref('env')}`,
    });

    //
    // Lambda Layer
    //
    const layer = new lambda.LayerVersion(this, 'CoreLayer', {
      code: lambda.Code.fromAsset("../../../../../layer/layer.zip"),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_7],
      license: 'Apache-2.0',
      description: 'geoTrack CoreLayer',
    });   

    //
    // Lambda pushVehiclePosition
    //
    const pushVehiclePosition = new lambda.Function(this, 'CfnPushVehiclePositionLambda', {
      code: lambda.Code.fromAsset('../../../../../lambdas/simulation/pushVehiclePosition'),
      handler: "index.handler",
      runtime: lambda.Runtime.PYTHON_3_7,
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 256,
      timeout: cdk.Duration.seconds(600),
      layers: [layer],
      environment: {
        PROJECT_NAME: `${projectName}`,
        IOT_TOPIC: `${projectName}/positions`,
        ROUTE_NAME: locationRoute.ref
      }
    })
    pushVehiclePosition.currentVersion.addAlias('live');
    pushVehiclePosition.addToRolePolicy(ssmReadPolicy);
    pushVehiclePosition.addToRolePolicy(iotPolicy);
    pushVehiclePosition.addToRolePolicy(geoPolicy);

    //
    // Lambda launchDeliveryFleet
    //
    const launchDeliveryFleet = new lambda.Function(this, 'CnfLaunchDeliveryFleetLambda', {
      code: lambda.Code.fromAsset('../../../../../lambdas/simulation/launchDeliveryFleet'),
      handler: "index.handler",
      runtime: lambda.Runtime.PYTHON_3_7,
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 256,
      timeout: cdk.Duration.seconds(120),
      layers: [layer],
      environment: {
        PUSH_VEHICLE_LAMBDA_NAME: pushVehiclePosition.functionName,
        PROJECT_NAME: `${projectName}`,
        APPSYNC_URL: `${graphQlEndpoint}`,
      }
    })
    launchDeliveryFleet.currentVersion.addAlias('live');
    launchDeliveryFleet.addToRolePolicy(ssmReadPolicy);
    launchDeliveryFleet.addToRolePolicy(appSyncPolicy);
    pushVehiclePosition.grantInvoke(launchDeliveryFleet)

    const launchDeliveryFleetApi = api.root.addResource('launch');
    const launchDeliveryFleetIntegration = new apigateway.LambdaIntegration(launchDeliveryFleet);
    launchDeliveryFleetApi.addMethod('GET', launchDeliveryFleetIntegration);
    
    //
    // Lambda EventBridgeResponse
    //

    // PINPOINT
    const pinpointApp = new pinpoint.CfnApp(this, 'CfnPinpointApp', {
      name: `${projectName}-pinpoint`,
    });

    const pinpointSMSChannel = new pinpoint.CfnSMSChannel(this, 'CfnSMSChannel', {
      applicationId: pinpointApp.ref,
      enabled: false,
    });
    
    const eventBridgeResponse = new lambda.Function(this, 'CnfEventBridgeResponseLambda', {
      code: lambda.Code.fromAsset('../../../../../lambdas/eventbridge'),
      handler: "index.handler",
      runtime: lambda.Runtime.PYTHON_3_7,
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 256,
      timeout: cdk.Duration.seconds(120),
      layers: [layer],
      environment: {
        PROJECT_NAME: `${projectName}`,
        APPSYNC_URL: `${graphQlEndpoint}`,
        APPLICATION_ID: pinpointApp.ref
      }
    })
    eventBridgeResponse.currentVersion.addAlias('live');
    eventBridgeResponse.addToRolePolicy(ssmReadPolicy);
    eventBridgeResponse.addToRolePolicy(appSyncPolicy);
    eventBridgeResponse.addToRolePolicy(pinpointPolicy);
    eventBridgeResponse.grantInvoke(launchDeliveryFleet)    

    const bus = new events.EventBus(this, "CfnEventBus", {
      eventBusName: `eventbus-${projectName}`
    });
    new cdk.CfnOutput(this, "BusName", {value: bus.eventBusName})

    new events.Rule(this, `CfnLambdaGeoTrackResponse`, {
      eventBus: bus,
      eventPattern: {
        source: ["aws.geo"],
        detailType: ["Location Geofence Event"],
        detail: { ["EventType"]: "ENTER" }
      },
      targets: [new actions.LambdaFunction(eventBridgeResponse)]
    })
    
    // 
    // Lambda IoTUpdateTracker
    // 
    const ioTUpdateTracker = new lambda.Function(this, 'CnfIoTUpdateTrackerLambda', {
      code: lambda.Code.fromAsset('../../../../../lambdas/iot'),
      handler: "index.handler",
      runtime: lambda.Runtime.PYTHON_3_7,
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 256,
      timeout: cdk.Duration.seconds(120),
      layers: [layer],
      environment: {
        PROJECT_NAME: `${projectName}`,
        TRACKER: locationTracker.ref
      }
    })
    ioTUpdateTracker.currentVersion.addAlias('live');
    ioTUpdateTracker.addToRolePolicy(ssmReadPolicy);
    ioTUpdateTracker.addToRolePolicy(geoPolicy);

    // IOT RULE
    new iot.TopicRule(this, 'CfnTopicRule', {
      topicRuleName: `${projectName}-rule`,
      sql: iot.IotSql.fromStringAsVer20160323(`SELECT * FROM '${projectName}/positions'`),
      actions: [new iotactions.LambdaFunctionAction(ioTUpdateTracker)],
    });

  }
}