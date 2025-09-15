import ERC725 from '@erc725/erc725.js';
import { BytesLike, Signer, Wallet, concat, toBeHex, toNumber } from 'ethers';
import { ERC725YDataKeys } from '@lukso/lsp-smart-contracts';

// types
import { ERC725Y } from '../../typechain/erc725';

// utils
import {
    DigitalAsset,
    generateArrayElementKeyAtIndex,
    getErc725yContract,
    isValidArrayLengthValue,
} from '../..';

/**
 * Add LSP12 Issued Assets to a issuer contract that supports ERC725Y.
 *
 * @since v0.0.2
 * @category LSP12
 * @param signer The signer that will send the transaction.
 * @param issuerAddress The address of a issuer contract that supports ERC725Y.
 * @param newIssuedAssets An array of issued assets which specifies the address and interface id of each issued asset.
 *
 * @throws
 * - When `newIssuedAssets` is an empty array.
 * - When `issuerAddress` is not a valid address.
 * - When the contract deployed at `issuerAddress` address does not support the `ERC725Y` interface id.
 *
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-12-IssuedAssets.md
 */
export async function addIssuedAssets(
    issuer: ERC725Y | BytesLike,
    newIssuedAssets: DigitalAsset[],
    signer?: Signer | Wallet,
): Promise<void> {
    if (newIssuedAssets.length === 0) {
        throw new Error('`newIssuedAssets` length is 0.');
    }

    const issuerContract: ERC725Y = signer
        ? await getErc725yContract(issuer, signer)
        : await getErc725yContract(issuer);

    const issuedAssetsLengthHex = await issuerContract.getData(
        ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].length,
    );

    let issuedAssetsLength: number;

    if (issuedAssetsLengthHex === '' || issuedAssetsLengthHex === '0x') {
        issuedAssetsLength = 0;
    } else if (!isValidArrayLengthValue(issuedAssetsLengthHex)) {
        issuedAssetsLength = 0;
    } else {
        issuedAssetsLength = toNumber(issuedAssetsLengthHex);
    }

    const dataKeys = [
        ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].length,
        ...newIssuedAssets.flatMap((newIssuedAsset, index) => [
            generateArrayElementKeyAtIndex(
                ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].length,
                issuedAssetsLength + index,
            ),
            ERC725.encodeKeyName('LSP12IssuedAssetsMap:<address>', [
                newIssuedAsset.address.toString(),
            ]),
        ]),
    ];

    const dataValues = [
        toBeHex(issuedAssetsLength + newIssuedAssets.length, 16),
        ...newIssuedAssets.flatMap((newIssuedAsset, index) => [
            newIssuedAsset.address.toString(),
            concat([newIssuedAsset.interfaceId, toBeHex(issuedAssetsLength + index, 16)]),
        ]),
    ];

    const tx = await issuerContract.setDataBatch(dataKeys, dataValues);

    await tx.wait(1);
}
