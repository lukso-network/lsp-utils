import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts';
import { expect } from 'chai';

// types
import { ERC165 } from '../../typechain';

// utils
import { supportsLSPInterface } from '../..';
import { BytesLike, Provider, ZeroAddress } from 'ethers';

describe('supportsLSPInterface', () => {
    const mockERC165 = {
        getAddress: async () => ZeroAddress,
        supportsInterface: async (interfaceId: BytesLike) => {
            if (interfaceId === INTERFACE_IDS.LSP0ERC725Account) {
                return true;
            }
            return false;
        },
    };
    const nonAddressableMockERC165 = {
        supportsInterface: async (interfaceId: BytesLike) => {
            if (interfaceId === INTERFACE_IDS.LSP0ERC725Account) {
                return true;
            }
            return false;
        },
    };
    const mockProvider = {} as Provider;

    it('it should support LSP0 interface and return true', async () => {
        expect(await supportsLSPInterface(INTERFACE_IDS.LSP0ERC725Account, mockERC165 as ERC165)).to
            .be.true;
    });

    it("it shouldn't support LSP0 interface and return false", async () => {
        expect(await supportsLSPInterface(INTERFACE_IDS.LSP7DigitalAsset, mockERC165 as ERC165)).to
            .be.false;
    });

    it('should revert if contract is not a valid address', async () => {
        const contractAddress = '0xcafe';

        await expect(
            supportsLSPInterface(INTERFACE_IDS.LSP7DigitalAsset, contractAddress, mockProvider),
        ).to.be.rejectedWith(
            `The parameter \`contract\` is not a valid address nor a valid contract instance of ERC165 contract. Value: '${contractAddress}'`,
        );
    });

    it('should revert if contract is not an addressable contract', async () => {
        await expect(
            supportsLSPInterface(
                INTERFACE_IDS.LSP7DigitalAsset,
                nonAddressableMockERC165 as ERC165,
            ),
        ).to.be.rejectedWith(
            `The parameter \`contract\` is not a valid address nor a valid contract instance of ERC165 contract. Value: '[object Object]'`,
        );
    });
});
