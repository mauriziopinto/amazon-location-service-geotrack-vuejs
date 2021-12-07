/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDeliveryAgent = /* GraphQL */ `
  query GetDeliveryAgent($id: ID!) {
    getDeliveryAgent(id: $id) {
      id
      fullName
      deliveryType
      device {
        id
        deliveryAgentId
        deviceType
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      deliveryAgentDeviceId
    }
  }
`;
export const listDeliveryAgents = /* GraphQL */ `
  query ListDeliveryAgents(
    $filter: ModelDeliveryAgentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDeliveryAgents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fullName
        deliveryType
        device {
          id
          deliveryAgentId
          deviceType
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        deliveryAgentDeviceId
      }
      nextToken
    }
  }
`;
export const getDevice = /* GraphQL */ `
  query GetDevice($id: ID!) {
    getDevice(id: $id) {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
    }
  }
`;
export const listDevices = /* GraphQL */ `
  query ListDevices(
    $filter: ModelDeviceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDevices(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        deliveryAgentId
        deviceType
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getDeliveryInfo = /* GraphQL */ `
  query GetDeliveryInfo($id: ID!) {
    getDeliveryInfo(id: $id) {
      id
      deliveryAgent {
        id
        fullName
        deliveryType
        device {
          id
          deliveryAgentId
          deviceType
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        deliveryAgentDeviceId
      }
      geoStart {
        lat
        lng
      }
      geoEnd {
        lat
        lng
      }
      duration
      distance
      geoFenceId
      userPhone
      expireAt
      status
      createdAt
      updatedAt
      deliveryInfoDeliveryAgentId
    }
  }
`;
export const listDeliveryInfos = /* GraphQL */ `
  query ListDeliveryInfos(
    $filter: ModelDeliveryInfoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDeliveryInfos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        deliveryAgent {
          id
          fullName
          deliveryType
          createdAt
          updatedAt
          deliveryAgentDeviceId
        }
        geoStart {
          lat
          lng
        }
        geoEnd {
          lat
          lng
        }
        duration
        distance
        geoFenceId
        userPhone
        expireAt
        status
        createdAt
        updatedAt
        deliveryInfoDeliveryAgentId
      }
      nextToken
    }
  }
`;
