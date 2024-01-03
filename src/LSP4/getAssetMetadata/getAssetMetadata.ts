// types
import { BytesLike, Provider } from 'ethers';
import { ERC725YDataKeys } from '@lukso/lsp-smart-contracts';

// utils
import {
    LSP4AssetMetadata,
    decodeJsonUrl,
    getErc725yContract,
    isAssetMetadata,
    validateIpfsUrl,
} from '../..';

// types
import { ERC725Y } from '../../typechain';

export async function getAssetMetadata(digitalAsset: ERC725Y): Promise<LSP4AssetMetadata>;
export async function getAssetMetadata(
    digitalAsset: ERC725Y | BytesLike,
    provider?: Provider,
): Promise<LSP4AssetMetadata> {
    const digitalAssetContract: ERC725Y = provider
        ? await getErc725yContract(digitalAsset, provider)
        : await getErc725yContract(digitalAsset);

    const assetMetadataDataValue = await digitalAssetContract.getData(
        ERC725YDataKeys.LSP4.LSP4Metadata,
    );

    const { url } = decodeJsonUrl(assetMetadataDataValue);

    const validatedUrl = validateIpfsUrl(url);

    const assetMetadata: LSP4AssetMetadata = await fetch(validatedUrl).then((response) =>
        response.json(),
    );

    if (!isAssetMetadata(assetMetadata)) {
        throw new Error('Fetched data is not an `LSP3ProfileMetadata` object.');
    }

    return assetMetadata;
}
