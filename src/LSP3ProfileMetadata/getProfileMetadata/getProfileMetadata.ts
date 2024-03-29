import fetch from 'isomorphic-fetch';
import { BytesLike, Provider } from 'ethers';
import { ERC725YDataKeys, LSP3ProfileMetadataJSON } from '@lukso/lsp-smart-contracts';

// erc725.js
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import LSP3ProfileMetadataSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';

// constants
import { defaultLSP3ProfileMetadata } from '../../constants';

// IPFS Utils
import { validateIpfsUrl } from '../../IPFS/validateIpfsUrl';

// LSP3 Utils
import { isProfileMetadata } from '../isProfileMetadata';

// helpers
import { getErc725yContract } from '../../helpers';

// typechain
import { ERC725Y } from '../../typechain/erc725';

/**
 * Returns a object of type LSP3ProfileMetadata.
 *
 * @since v0.0.1
 * @category LSP3
 *
 * @param unviersalProfile The instance of a Unviersal Profile contract.
 *
 * @throws
 * - When fails fetching the data from the stored url.
 * - When the fetched data is not `LSP3ProfileMetadata`.
 *
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-3-Profile-Metadata.md
 * @example
 * ```ts
 * getProfileMetadata(ERC725Y) =>
 * {
 *   LSP3Profile: {
 *     name: string;
 *     description: string;
 *     links: Link[];
 *     tags: string[];
 *     avatar: (Avatar | NFTBasedAvatar)[];
 *     profileImage: (Image | NFTBasedImage)[];
 *     backgroundImage: (Image | NFTBasedImage)[];
 *   }
 * }
 * ```
 */
export async function getProfileMetadata(
    contract: BytesLike | ERC725Y,
    provider?: Provider,
): Promise<LSP3ProfileMetadataJSON> {
    const erc725y: ERC725Y = provider
        ? await getErc725yContract(contract, provider)
        : await getErc725yContract(contract);

    const dataValue = await erc725y.getData(ERC725YDataKeys.LSP3.LSP3Profile);

    const decodedDataValue = ERC725.decodeData(
        [{ value: dataValue, keyName: 'LSP3Profile' }],
        [
            LSP3ProfileMetadataSchema.filter(
                ({ name }) => name === 'LSP3Profile',
            )[0] as ERC725JSONSchema,
        ],
    );

    const { url } = decodedDataValue[0].value;
    const profileDataURL = validateIpfsUrl(url);

    let profileData: LSP3ProfileMetadataJSON;
    try {
        const response = await fetch(profileDataURL);
        profileData = await response.json();
    } catch {
        throw new Error("Couldn't fetch Profile Data from the url.");
    }

    if (!isProfileMetadata(profileData)) {
        throw new Error('Fetched data is not `LSP3Profile`.');
    }

    return profileData ? profileData : defaultLSP3ProfileMetadata;
}

export default getProfileMetadata;
