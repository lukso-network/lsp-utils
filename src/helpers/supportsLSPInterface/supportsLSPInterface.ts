import { BytesLike, Provider, isAddress, isAddressable } from 'ethers';
import { ERC165, ERC165__factory, InterfaceId, InterfaceIdName } from '../..';
import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts';

export async function supportsLSPInterface(
    interfaceId: InterfaceId | InterfaceIdName,
    contract: ERC165,
): Promise<boolean>;
export async function supportsLSPInterface(
    interfaceId: InterfaceId | InterfaceIdName,
    contract: ERC165 | BytesLike,
    provider?: Provider,
): Promise<boolean> {
    if (!isAddress(contract) && !isAddressable(contract)) {
        throw new Error(
            `The parameter \`contract\` is not a valid address nor a valid contract instance of ERC165 contract. Value: '${contract}'`,
        );
    }

    let contractInstance: ERC165;

    if (isAddress(contract)) {
        contractInstance = ERC165__factory.connect(contract, provider);
    } else if (provider) {
        contractInstance = contract.connect(provider);
    } else {
        contractInstance = contract;
    }

    let result: boolean;
    try {
        if (INTERFACE_IDS[interfaceId]) {
            result = await contractInstance.supportsInterface(INTERFACE_IDS[interfaceId]);
        } else {
            result = await contractInstance.supportsInterface(interfaceId);
        }
    } catch (errorMessage) {
        throw new Error(errorMessage);
    }

    return result;
}
