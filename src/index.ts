// ------ Constants ------
export {
    defaultLSP3ProfileMetadata,
    defaultIpfsGateway,
    LSP23LinkedContractsFactoryAddress,
    upPostDeploymentModuleAddress,
    UniversalProfileInitAddress,
    LSP6KeyManagerInitAddress,
    LSP7MintableInitAddress,
    LSP8MintableInitAddress,
    LSP1UniversalReceiverDelegateUPAddress,
} from './constants';

// ------ Types ------
export {
    InterfaceIdName,
    InterfaceId,
    LSP6PermissionName,
    LSP6Permission,
    Link,
    Attribute,
    HashBasedVerification,
    ECDSABasedVerification,
    Image,
    Asset,
    Avatar,
    NFTBasedAsset,
    NFTBasedImage,
    NFTBasedAvatar,
    LSP4AssetMetadata,
    LSP3ProfileMetadata,
    Issuer,
    DigitalAsset,
    IssuerAssets,
    DigitalAssetsCreators,
    LSP6Controller,
} from './types';

// ------ Helpers ------
export { getErc725yContract, supportsLSPInterface } from './helpers';

// ------ TypeChain ------
export * from './typechain';

// ------ IPFS ------
export { validateIpfsUrl } from './IPFS';

// ------ LSP2 ------
export {
    decodeAssetUrl,
    decodeJsonUrl,
    encodeAssetUrl,
    encodeJsonUrl,
    generateArrayElementKeyAtIndex,
    generateArrayKey,
    generateMappingKey,
    generateMappingWithGroupingKey,
    generateSingletonKey,
    isCompactBytesArray,
    isValidArrayLengthValue,
    removeElementFromArrayAndMap,
    removeLastElementFromArrayAndMap,
} from './LSP2';

// ------ LSP3 ------
export { getProfileMetadata, isProfileMetadata } from './LSP3';

// ------ LSP4 ------
export {
    addDigitalAssetCreators,
    authenticateDigitalAssetCreators,
    removeDigitalAssetCreators,
    getDigitalAssetCreators,
    getAssetMetadata,
    isAssetMetadata,
} from './LSP4';

// ------ LSP5 ------
export { generateReceivedAssetKeys, generateSentAssetKeys } from './LSP5';

// ------ LSP6 ------
export {
    createValidityTimestamp,
    decodeAllowedCalls,
    encodeAllowedCalls,
    decodeAllowedERC725YDataKeys,
    encodeAllowedERC725YDataKeys,
    encodePermissions,
    decodePermissions,
} from './LSP6';

// ------ LSP12 ------
export {
    addIssuedAssets,
    authenticateIssuedAssets,
    removeIssuedAssets,
    getIssuedAssets,
} from './LSP12';

// ------ LSP23 ------
export { deployUniversalProfile } from './LSP23';
