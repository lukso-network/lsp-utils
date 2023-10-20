import { BytesLike, Provider, getAddress, isAddress, isAddressable } from 'ethers';

// constants
import { DigitalAsset, Issuer, IssuerAssets } from '..';

// utils
import { getIssuedAssets } from './getIssuedAssets';
import { getDigitalAssetCreators } from '../LSP4/getDigitalAssetCreators';
import { ERC725Y } from '../typechain';

/**
 * Get the authenticated LSP12 Issued Assets of a issuer contract that supports ERC725Y.
 *
 * @since v0.0.2
 * @category LSP12
 * @param provider A ethers provider.
 * @param issuerAddress The adderss of the issuer contract that supports ERC725Y.
 *
 * @returns An array of authenticated & unauthenticated Digital Assets.
 *
 * @throws When `issuerAddress` is not a valid address.
 *
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-12-IssuedAssets.md
 */
export async function authenticateIssuedAssets(issuer: ERC725Y): Promise<IssuerAssets>;
export async function authenticateIssuedAssets(
    issuer: ERC725Y,
    provider: Provider,
): Promise<IssuerAssets>;
export async function authenticateIssuedAssets(
    issuer: BytesLike | string,
    provider: Provider,
): Promise<IssuerAssets>;
export async function authenticateIssuedAssets(
    issuer: ERC725Y | BytesLike | string,
    provider?: Provider,
): Promise<IssuerAssets> {
    let issuedAssets: DigitalAsset[];
    let issuerAddress: string;
    if (isAddress(issuer)) {
        issuedAssets = await getIssuedAssets(issuer, provider);
        issuerAddress = issuer;
    } else if (isAddressable(issuer)) {
        issuedAssets = provider
            ? await getIssuedAssets(issuer, provider)
            : await getIssuedAssets(issuer);
        issuerAddress = await issuer.getAddress();
    } else {
        throw new Error(
            `The parameter \`issuerAddress\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${issuer}'`,
        );
    }

    const issuerAssets: IssuerAssets = {
        unauthenticatedAssets: [],
        authenticatedAssets: [],
    };

    if (issuedAssets.length === 0) {
        return issuerAssets;
    }

    for (let index = 0; index < issuedAssets.length; index++) {
        const issuedAsset = issuedAssets[index];

        if (['0x', '0xffffffff'].includes(issuedAsset.interfaceId.toString())) {
            issuerAssets.unauthenticatedAssets.push(issuedAsset);
            continue;
        }

        let fetchedCreators: Issuer[];
        if (isAddress(issuer)) {
            fetchedCreators = await getDigitalAssetCreators(issuedAsset.address, provider);
        } else if (isAddressable(issuer)) {
            fetchedCreators = provider
                ? await getDigitalAssetCreators(issuedAsset.address, provider)
                : await getDigitalAssetCreators(issuedAsset.address, issuer.runner as Provider);
        }

        const filteredCreators = fetchedCreators.filter(
            (creator) => getAddress(creator.address.toString()) === getAddress(issuerAddress),
        );

        if (filteredCreators.length === 0) {
            issuerAssets.unauthenticatedAssets.push(issuedAsset);
        } else {
            issuerAssets.authenticatedAssets.push(issuedAsset);
        }
    }

    return issuerAssets;
}
