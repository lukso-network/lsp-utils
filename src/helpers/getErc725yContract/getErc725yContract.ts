import { BytesLike, Provider, Signer, Wallet, isAddress, isAddressable } from 'ethers';
import { ERC725Y, ERC725Y__factory } from '../..';
import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts';

export async function getErc725yContract(erc725y: ERC725Y): Promise<ERC725Y>;
export async function getErc725yContract(
    erc725y: ERC725Y | BytesLike,
    signer?: Signer | Wallet | Provider,
): Promise<ERC725Y> {
    if (!isAddress(erc725y) && !isAddressable(erc725y)) {
        throw new Error(
            `The parameter \`erc725y\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${erc725y}'`,
        );
    }

    let erc725yContract: ERC725Y;

    if (isAddress(erc725y)) {
        erc725yContract = ERC725Y__factory.connect(erc725y, signer);
    } else if (signer) {
        erc725yContract = erc725y.connect(signer);
    } else {
        erc725yContract = erc725y;
    }

    try {
        const result = await erc725yContract.supportsInterface(INTERFACE_IDS.ERC725Y);

        if (!result) {
            throw new Error("Contract does not support 'ERC725Y'.");
        }
    } catch (errorMessage) {
        throw new Error(errorMessage);
    }

    return erc725yContract;
}
