/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDeliveryAgent = /* GraphQL */ `
  subscription OnCreateDeliveryAgent {
    onCreateDeliveryAgent {
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
export const onUpdateDeliveryAgent = /* GraphQL */ `
  subscription OnUpdateDeliveryAgent {
    onUpdateDeliveryAgent {
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
export const onDeleteDeliveryAgent = /* GraphQL */ `
  subscription OnDeleteDeliveryAgent {
    onDeleteDeliveryAgent {
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
export const onCreateDevice = /* GraphQL */ `
  subscription OnCreateDevice {
    onCreateDevice {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateDevice = /* GraphQL */ `
  subscription OnUpdateDevice {
    onUpdateDevice {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteDevice = /* GraphQL */ `
  subscription OnDeleteDevice {
    onDeleteDevice {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
    }
  }
`;
export const onCreateDeliveryInfo = /* GraphQL */ `
  subscription OnCreateDeliveryInfo {
    onCreateDeliveryInfo {
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
export const onUpdateDeliveryInfo = /* GraphQL */ `
  subscription OnUpdateDeliveryInfo {
    onUpdateDeliveryInfo {
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
export const onDeleteDeliveryInfo = /* GraphQL */ `
  subscription OnDeleteDeliveryInfo {
    onDeleteDeliveryInfo {
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
