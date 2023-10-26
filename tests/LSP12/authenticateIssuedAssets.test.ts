import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts';
import { Signer, keccak256, toUtf8Bytes } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

// types
import {
    LSP7Mintable__factory,
    LSP7Mintable,
    UniversalProfile__factory,
    UniversalProfile,
} from '../../src/typechain';

// util
import {
    IssuerAssets,
    addDigitalAssetCreators,
    addIssuedAssets,
    authenticateIssuedAssets,
    removeDigitalAssetCreators,
    removeIssuedAssets,
} from '../../src';

describe('authenticateIssuedAssets', () => {
    let context: {
        creatorsOwner: Signer;
        firstCreator: UniversalProfile;
        secondCreator: UniversalProfile;
        digitalAssetsOwner: Signer;
        firstDigitalAsset: LSP7Mintable;
        secondDigitalAsset: LSP7Mintable;
        thirdDigitalAsset: LSP7Mintable;
    };
    before('deploy UP and token contract', async () => {
        const signers = await ethers.getSigners();
        const creatorsOwner = signers[0];
        const digitalAssetsOwner = signers[1];

        const firstCreator = await new UniversalProfile__factory(creatorsOwner).deploy(
            creatorsOwner.address,
        );
        const secondCreator = await new UniversalProfile__factory(creatorsOwner).deploy(
            creatorsOwner.address,
        );

        const firstDigitalAsset = await new LSP7Mintable__factory(digitalAssetsOwner).deploy(
            'FirstTestToken',
            'FTT',
            digitalAssetsOwner.address,
            true,
        );
        const secondDigitalAsset = await new LSP7Mintable__factory(digitalAssetsOwner).deploy(
            'SecondTestToken',
            'STT',
            digitalAssetsOwner.address,
            true,
        );
        const thirdDigitalAsset = await new LSP7Mintable__factory(digitalAssetsOwner).deploy(
            'ThirdTestToken',
            'TTT',
            digitalAssetsOwner.address,
            true,
        );

        context = {
            creatorsOwner,
            firstCreator,
            secondCreator,
            digitalAssetsOwner,
            firstDigitalAsset,
            secondDigitalAsset,
            thirdDigitalAsset,
        };
    });

    it('should throw when token address is not hex', async () => {
        const issuerAddress = 'address';

        await expect(authenticateIssuedAssets(issuerAddress, ethers.provider)).to.be.rejectedWith(
            `The parameter \`issuerAddress\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${issuerAddress}'`,
        );
    });

    it('should throw when token address is hex with less than 20 bytes', async () => {
        const issuerAddress = keccak256(toUtf8Bytes('address')).substring(0, 40);

        await expect(authenticateIssuedAssets(issuerAddress, ethers.provider)).to.be.rejectedWith(
            `The parameter \`issuerAddress\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${issuerAddress}'`,
        );
    });

    it('should throw when token address is hex with more than 20 bytes', async () => {
        const issuerAddress = keccak256(toUtf8Bytes('address')).substring(0, 44);

        await expect(authenticateIssuedAssets(issuerAddress, ethers.provider)).to.be.rejectedWith(
            `The parameter \`issuerAddress\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${issuerAddress}'`,
        );
    });

    describe('2 issuers: 1st - one issued asset, 2nd - two issued assets', () => {
        let firstIssuerExpectedDigitalAssets: IssuerAssets;
        let secondIssuerExpectedDigitalAssets: IssuerAssets;
        before(async () => {
            firstIssuerExpectedDigitalAssets = {
                unauthenticatedAssets: [
                    {
                        address: await context.thirdDigitalAsset.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                    },
                ],
                authenticatedAssets: [
                    {
                        address: await context.firstDigitalAsset.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                    },
                ],
            };

            secondIssuerExpectedDigitalAssets = {
                unauthenticatedAssets: [
                    {
                        address: await context.thirdDigitalAsset.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                    },
                ],
                authenticatedAssets: [
                    {
                        address: await context.firstDigitalAsset.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                    },
                    {
                        address: await context.secondDigitalAsset.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                    },
                ],
            };
        });
        beforeEach('add LSP12 Issued Assets & LSP4 Creators', async () => {
            const firstCreatorIssuedAssets = [
                {
                    address: await context.firstDigitalAsset.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                },
                {
                    address: await context.thirdDigitalAsset.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                },
            ];
            const secondCreatorIssuedAssets = [
                {
                    address: await context.firstDigitalAsset.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                },
                {
                    address: await context.secondDigitalAsset.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                },
                {
                    address: await context.thirdDigitalAsset.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                },
            ];

            await addIssuedAssets(
                context.firstCreator.connect(context.creatorsOwner),
                firstCreatorIssuedAssets,
            );
            await addIssuedAssets(
                context.secondCreator.connect(context.creatorsOwner),
                secondCreatorIssuedAssets,
            );

            const firstDigitalAssetCreators = [
                {
                    address: await context.firstCreator.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                },
                {
                    address: await context.secondCreator.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                },
            ];
            const secondDigitalAssetCreators = [
                {
                    address: await context.secondCreator.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                },
            ];

            await addDigitalAssetCreators(
                context.firstDigitalAsset.connect(context.digitalAssetsOwner),
                firstDigitalAssetCreators,
            );
            await addDigitalAssetCreators(
                context.secondDigitalAsset.connect(context.digitalAssetsOwner),
                secondDigitalAssetCreators,
            );
        });

        afterEach('remove LSP4 Creators & LSP12 Issued Assets', async () => {
            await removeIssuedAssets(context.firstCreator.connect(context.creatorsOwner));
            await removeIssuedAssets(context.secondCreator.connect(context.creatorsOwner));

            await removeDigitalAssetCreators(
                context.firstDigitalAsset.connect(context.digitalAssetsOwner),
            );
            await removeDigitalAssetCreators(
                context.secondDigitalAsset.connect(context.digitalAssetsOwner),
            );
        });

        describe('overload: issuer address + provider', () => {
            it('should pass and authenticate the issued assets of the first creator', async () => {
                expect(
                    await authenticateIssuedAssets(
                        await context.firstCreator.getAddress(),
                        ethers.provider,
                    ),
                ).to.deep.equal(firstIssuerExpectedDigitalAssets);
            });

            it('should pass and authenticate the issued assets of the second creator', async () => {
                expect(
                    await authenticateIssuedAssets(
                        await context.secondCreator.getAddress(),
                        ethers.provider,
                    ),
                ).to.deep.equal(secondIssuerExpectedDigitalAssets);
            });
        });

        describe('overload: issuer contract + provider', () => {
            it('should pass and authenticate the issued assets of the first creator', async () => {
                expect(
                    await authenticateIssuedAssets(context.firstCreator, ethers.provider),
                ).to.deep.equal(firstIssuerExpectedDigitalAssets);
            });

            it('should pass and authenticate the issued assets of the second creator', async () => {
                expect(
                    await authenticateIssuedAssets(context.secondCreator, ethers.provider),
                ).to.deep.equal(secondIssuerExpectedDigitalAssets);
            });
        });

        describe('overload: issuer contract', () => {
            it('should pass and authenticate the issued assets of the first creator', async () => {
                expect(await authenticateIssuedAssets(context.firstCreator)).to.deep.equal(
                    firstIssuerExpectedDigitalAssets,
                );
            });

            it('should pass and authenticate the issued assets of the second creator', async () => {
                expect(await authenticateIssuedAssets(context.secondCreator)).to.deep.equal(
                    secondIssuerExpectedDigitalAssets,
                );
            });
        });
    });
});
