import { BytesLike } from 'ethers';
import { PERMISSIONS } from '@lukso/lsp-smart-contracts';

// generate types from PERMISSIONS imported from `@lukso/lsp-smart-contracts`
export type LSP6PermissionName = keyof typeof PERMISSIONS;
export type LSP6Permission = (typeof PERMISSIONS)[LSP6PermissionName];

export interface LSP3ProfileMetadata {
    LSP3Profile: {
        description: string;
        links: string[];
        name: string;
        tags: string[];
        profileImage?: {
            width: number;
            height: number;
            hashFunction: string;
            hash: string;
            url: string;
        }[];
        backgroundImage?: {
            width: number;
            height: number;
            hashFunction: string;
            hash: string;
            url: string;
        }[];
    };
}

export type Issuer = { address: BytesLike; interfaceId: BytesLike };

export type DigitalAsset = { address: BytesLike; interfaceId: BytesLike };

export type LSP6Controller = {
    address: BytesLike;
    permissions: BytesLike;
};

export const defaultLSP3ProfileMetadata: LSP3ProfileMetadata = {
    LSP3Profile: {
        description: '',
        links: [],
        name: '',
        tags: [],
    },
};

export const defaultIpfsGateway = 'https://2eff.lukso.dev/ipfs/';

export const UniversalProfileInitAddress = '0x0000000000e6300463CDbbF7ECF223a63397C489';
export const LSP1UniversalReceiverDelegateUPAddress = '0x0000000000F49F9818D746b4b999A9E449F675bb';
export const LSP6KeyManagerInitAddress = '0x000000000A6cAE9b1bB3d9DA92BFf3569b77707E';
export const LSP23LinkedContractsFactoryAddress = '0x2300000A84D25dF63081feAa37ba6b62C4c89a30';
export const upPostDeploymentModuleAddress = '0x000000000066093407b6704B89793beFfD0D8F00';
