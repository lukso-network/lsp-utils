import { BytesLike, Provider, getAddress, isAddress, isAddressable } from 'ethers';

// constants
import { DigitalAsset, DigitalAssetsCreators, Issuer } from '..';

// utils
import { getDigitalAssetCreators } from './getDigitalAssetCreators';
import { getIssuedAssets } from '../LSP12/getIssuedAssets';

// types
import { ERC725Y } from '../typechain';

/**
 * Get the authenticated LSP4 Creators of the digital asset contract that supports ERC725Y.
 *
 * @since v0.0.2
 * @category LSP4
 * @param provider A ethers provider.
 * @param digitalAssetAddress The adderss of the digital asset contract that supports ERC725Y.
 *
 * @returns An array of authenticated & unauthenticated Issuers.
 *
 * @throws When `digitalAssetAddress` is not a valid address.
 *
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md
 */
export async function authenticateDigitalAssetCreators(
    digitalAsset: ERC725Y,
): Promise<DigitalAssetsCreators>;
export async function authenticateDigitalAssetCreators(
    digitalAsset: ERC725Y,
    provider: Provider,
): Promise<DigitalAssetsCreators>;
export async function authenticateDigitalAssetCreators(
    digitalAsset: BytesLike | string,
    provider: Provider,
): Promise<DigitalAssetsCreators>;
export async function authenticateDigitalAssetCreators(
    digitalAsset: ERC725Y | BytesLike | string,
    provider?: Provider,
): Promise<DigitalAssetsCreators> {
    let fetchedCreators: Issuer[];
    let digitalAssetAddress: string;
    if (isAddress(digitalAsset)) {
        fetchedCreators = await getDigitalAssetCreators(digitalAsset, provider);
        digitalAssetAddress = digitalAsset;
    } else if (isAddressable(digitalAsset)) {
        fetchedCreators = provider
            ? await getDigitalAssetCreators(digitalAsset, provider)
            : await getDigitalAssetCreators(digitalAsset);
        digitalAssetAddress = await digitalAsset.getAddress();
    } else {
        throw new Error(
            `The parameter \`digitalAssetAddress\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${digitalAsset}'`,
        );
    }

    const digitalAssetCreators: DigitalAssetsCreators = {
        unauthenticatedCreators: [],
        authenticatedCreators: [],
    };

    if (fetchedCreators.length === 0) {
        return digitalAssetCreators;
    }

    for (let index = 0; index < fetchedCreators.length; index++) {
        const creator = fetchedCreators[index];

        if (['0x', '0xffffffff'].includes(creator.interfaceId.toString())) {
            digitalAssetCreators.unauthenticatedCreators.push(creator);
            continue;
        }

        let fetchedIssuedAssets: DigitalAsset[];
        if (isAddress(digitalAsset)) {
            fetchedIssuedAssets = await getIssuedAssets(creator.address, provider);
        } else if (isAddressable(digitalAsset)) {
            fetchedIssuedAssets = provider
                ? await getIssuedAssets(creator.address, provider)
                : await getIssuedAssets(creator.address, digitalAsset.runner as Provider);
        }

        const filteredIssuedAssets = fetchedIssuedAssets.filter(
            (asset) => getAddress(asset.address.toString()) === getAddress(digitalAssetAddress),
        );

        if (filteredIssuedAssets.length === 0) {
            digitalAssetCreators.unauthenticatedCreators.push(creator);
        } else {
            digitalAssetCreators.authenticatedCreators.push(creator);
        }
    }

    return digitalAssetCreators;
}
