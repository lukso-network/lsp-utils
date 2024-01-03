import { AddressLike, BytesLike } from 'ethers';
import { PERMISSIONS } from '@lukso/lsp-smart-contracts';

// generate types from PERMISSIONS imported from `@lukso/lsp-smart-contracts`
export type LSP6PermissionName = keyof typeof PERMISSIONS;
export type LSP6Permission = (typeof PERMISSIONS)[LSP6PermissionName];

export interface LSP4AssetMetadata {
    LSP4Metadata: {
        name: string; // name of the DigitalAsset if not defined in LSP4TokenName
        description: string;
        links: // links related to DigitalAsset
        {
            title: string; // a title for the link.
            url: string; // the link itself
        }[];
        icon: // SHOULD be used for LSP7 icons
        // multiple sizes of the same icon
        (
            | {
                  // example of a verificationData based image verification
                  width: number;
                  height: number;
                  url: string;
                  verification: {
                      method: 'keccak256(bytes)';
                      data: string; // bytes32 hash of the image
                  };
              }
            | {
                  // example of a signature based image verification
                  width: number;
                  height: number;
                  url: string;
                  verification: {
                      method: 'ecdsa';
                      data: string; // signer that signed the bytes of the image
                      source: string; // e.g url returning the signature of the signed image
                  };
              }
            | {
                  // example of a NFT/smart contract based image
                  address: AddressLike; // the address of an LSP7 or LSP8
                  tokenId: BytesLike; // (optional) if token contract is an LSP7
              }
        )[];
        images: // COULD be used for LSP8 NFT art
        // multiple images in different sizes, related to the DigitalAsset, image 0, should be the main image
        // array of different sizes of the same image

        (
            | {
                  // example of a verificationData based image verification
                  width: number;
                  height: number;
                  url: 'string';
                  verification: {
                      method: 'keccak256(bytes)';
                      data: 'string'; // bytes32 hash of the image
                  };
              }
            | {
                  // example of a signature based image verification
                  width: number;
                  height: number;
                  url: string;
                  verification: {
                      method: 'ecdsa';
                      data: string; // signer that signed the bytes of the image
                      source: string; // e.g url returning the signature of the signed image
                  };
              }
            | {
                  // example of a NFT/smart contract based image
                  address: AddressLike; // the address of an LSP7 or LSP8
                  tokenId: BytesLike; // (optional) if token contract is an LSP7
              }
        )[][];
        assets: // SHOULD be used for any assets of the token (e.g. 3d assets, high res pictures or music, etc)
        (
            | {
                  url: string;
                  fileType: string;
                  verification: {
                      method: 'keccak256(bytes)';
                      data: string; // bytes32 hash of the asset
                  };
              }
            | {
                  // example of a NFT/smart contract based asset
                  address: AddressLike; // the address of an LSP7 or LSP8
                  tokenId: BytesLike; // (optional) if token contract is an LSP7
              }
        )[];
        attributes?: {
            key: string; // name of the attribute
            value: string; // value assigned to the attribute
            type: string | number | boolean; // for encoding/decoding purposes
        }[];
    };
}

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

export const defaultLSP3ProfileMetadata: LSP3ProfileMetadata = {
    LSP3Profile: {
        description: '',
        links: [],
        name: '',
        tags: [],
    },
};

export const defaultIpfsGateway = 'https://2eff.lukso.dev/ipfs/';
