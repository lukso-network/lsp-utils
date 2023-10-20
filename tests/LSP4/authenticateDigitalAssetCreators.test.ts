import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts';
import { Signer, keccak256, toUtf8Bytes } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

// util
import {
    DigitalAssetsCreators,
    addDigitalAssetCreators,
    addIssuedAssets,
    authenticateDigitalAssetCreators,
    removeDigitalAssetCreators,
    removeIssuedAssets,
} from '../../src';

// types
import {
    LSP7Mintable__factory,
    LSP7Mintable,
    UniversalProfile__factory,
    UniversalProfile,
} from '../../src/typechain';

describe('authenticateDigitalAssetCreators', () => {
    let context: {
        creatorsOwner: Signer;
        firstCreator: UniversalProfile;
        secondCreator: UniversalProfile;
        thirdCreator: UniversalProfile;
        digitalAssetsOwner: Signer;
        firstDigitalAsset: LSP7Mintable;
        secondDigitalAsset: LSP7Mintable;
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
        const thirdCreator = await new UniversalProfile__factory(creatorsOwner).deploy(
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

        context = {
            creatorsOwner,
            firstCreator,
            secondCreator,
            thirdCreator,
            digitalAssetsOwner,
            firstDigitalAsset,
            secondDigitalAsset,
        };
    });

    it('should throw when token address is not hex', async () => {
        const digitalAssetAddress = 'address';

        await expect(
            authenticateDigitalAssetCreators(digitalAssetAddress, ethers.provider),
        ).to.be.rejectedWith(
            `The parameter \`digitalAssetAddress\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${digitalAssetAddress}'`,
        );
    });

    it('should throw when token address is hex with less than 20 bytes', async () => {
        const digitalAssetAddress = keccak256(toUtf8Bytes('address')).substring(0, 40);

        await expect(
            authenticateDigitalAssetCreators(digitalAssetAddress, ethers.provider),
        ).to.be.rejectedWith(
            `The parameter \`digitalAssetAddress\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${digitalAssetAddress}'`,
        );
    });

    it('should throw when token address is hex with more than 20 bytes', async () => {
        const digitalAssetAddress = keccak256(toUtf8Bytes('address')).substring(0, 44);

        await expect(
            authenticateDigitalAssetCreators(digitalAssetAddress, ethers.provider),
        ).to.be.rejectedWith(
            `The parameter \`digitalAssetAddress\` is not a valid address nor a valid contract instance of \`ERC725Y\`. Value: '${digitalAssetAddress}'`,
        );
    });

    describe('2 digital assets: 1st - one creator, 2nd - two creators', () => {
        let firstDigitalAssetExpectedCreators: DigitalAssetsCreators;
        let secondDigitalAssetExpectedCreators: DigitalAssetsCreators;
        before(async () => {
            firstDigitalAssetExpectedCreators = {
                unauthenticatedCreators: [
                    {
                        address: await context.thirdCreator.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                    },
                ],
                authenticatedCreators: [
                    {
                        address: await context.firstCreator.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                    },
                ],
            };

            secondDigitalAssetExpectedCreators = {
                unauthenticatedCreators: [
                    {
                        address: await context.thirdCreator.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                    },
                ],
                authenticatedCreators: [
                    {
                        address: await context.firstCreator.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                    },
                    {
                        address: await context.secondCreator.getAddress(),
                        interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                    },
                ],
            };
        });
        beforeEach('add LSP4 Creators & LSP12 Issued Assets', async () => {
            const firstDigitalAssetCreators = [
                {
                    address: await context.firstCreator.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                },
                {
                    address: await context.thirdCreator.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                },
            ];
            const secondDigitalAssetCreators = [
                {
                    address: await context.firstCreator.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                },
                {
                    address: await context.secondCreator.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP0ERC725Account,
                },
                {
                    address: await context.thirdCreator.getAddress(),
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

            const firstCreatorIssuedAssets = [
                {
                    address: await context.firstDigitalAsset.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                },
                {
                    address: await context.secondDigitalAsset.getAddress(),
                    interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
                },
            ];
            const secondCreatorIssuedAssets = [
                {
                    address: await context.secondDigitalAsset.getAddress(),
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
        });

        afterEach('remove LSP4 Creators & LSP12 Issued Assets', async () => {
            await removeDigitalAssetCreators(
                context.firstDigitalAsset.connect(context.digitalAssetsOwner),
            );
            await removeDigitalAssetCreators(
                context.secondDigitalAsset.connect(context.digitalAssetsOwner),
            );

            await removeIssuedAssets(context.firstCreator.connect(context.creatorsOwner));
            await removeIssuedAssets(context.secondCreator.connect(context.creatorsOwner));
        });

        describe('overload: digital asset address + provider', () => {
            it('should pass and authenticate the creators of the first digital asset', async () => {
                expect(
                    await authenticateDigitalAssetCreators(
                        await context.firstDigitalAsset.getAddress(),
                        ethers.provider,
                    ),
                ).to.deep.equal(firstDigitalAssetExpectedCreators);
            });

            it('should pass and authenticate the creators of the second digital asset', async () => {
                expect(
                    await authenticateDigitalAssetCreators(
                        await context.secondDigitalAsset.getAddress(),
                        ethers.provider,
                    ),
                ).to.deep.equal(secondDigitalAssetExpectedCreators);
            });
        });

        describe('overload: digital asset contract + provider', () => {
            it('should pass and authenticate the creators of the first digital asset', async () => {
                expect(
                    await authenticateDigitalAssetCreators(
                        context.firstDigitalAsset,
                        ethers.provider,
                    ),
                ).to.deep.equal(firstDigitalAssetExpectedCreators);
            });

            it('should pass and authenticate the creators of the second digital asset', async () => {
                expect(
                    await authenticateDigitalAssetCreators(
                        context.secondDigitalAsset,
                        ethers.provider,
                    ),
                ).to.deep.equal(secondDigitalAssetExpectedCreators);
            });
        });

        describe('overload: digital asset contract', () => {
            it('should pass and authenticate the creators of the first digital asset', async () => {
                expect(
                    await authenticateDigitalAssetCreators(context.firstDigitalAsset),
                ).to.deep.equal(firstDigitalAssetExpectedCreators);
            });

            it('should pass and authenticate the creators of the second digital asset', async () => {
                expect(
                    await authenticateDigitalAssetCreators(context.secondDigitalAsset),
                ).to.deep.equal(secondDigitalAssetExpectedCreators);
            });
        });
    });
});
