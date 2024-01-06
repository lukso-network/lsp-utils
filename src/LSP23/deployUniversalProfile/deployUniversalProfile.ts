import { AbiCoder, BytesLike, Provider, Signer, Wallet, randomBytes, toBeHex } from 'ethers';
import { ALL_PERMISSIONS, ERC725YDataKeys } from '@lukso/lsp-smart-contracts';

// constants
import {
    UniversalProfileInitAddress,
    LSP6KeyManagerInitAddress,
    LSP23LinkedContractsFactoryAddress,
    upPostDeploymentModuleAddress,
    LSP6Controller,
} from '../..';

// types
// import needs to be one liner in order for `scripts/generateSpecificTypechain.bash` to work
// prettier-ignore
import { LSP23LinkedContractsFactory__factory, LSP6KeyManagerInit__factory, UniversalProfileInit__factory } from '../../typechain';

/**
 * Deploy Universal Profile with Key Manager using LSP23 Linked Contracts Factory.
 *
 * @since v0.0.2
 * @category LSP23
 *
 * @param signer The signer used to deploy the contracts, needs to have native token for gas fees.
 * @param provider The provider that, used to deploy the contracts to a specific network.
 * @param mainController The main controller for the Unviersal Profile.
 * @param additionalDataKeys Data keys that you want to set on deployment.
 * @param additionalDataValues Data values that you want to set on deployment.
 * @param additionalControllers Additional controllers for the deployed Universal Profile.
 *
 * @returns The addresses of the Universal Profile & Key Manager.
 */
export const deployUniversalProfile = async (
    signer: Signer | Wallet,
    provider: Provider,
    mainController: BytesLike,
    additionalDataKeys: BytesLike[],
    additionalDataValues: BytesLike[],
    additionalControllers: LSP6Controller[],
) => {
    /// ------ Contract Instance for the `LSP23LinkedContractsFactory` ------
    const LSP23LinkedContractsFactory = LSP23LinkedContractsFactory__factory.connect(
        LSP23LinkedContractsFactoryAddress,
        provider,
    );
    /// ---------------------------------------------------------------------

    /// ------ Contract Instance for the `UniversalProfileInit` ------
    const universalProfileInit = UniversalProfileInit__factory.connect(
        UniversalProfileInitAddress,
        provider,
    );
    /// ---------------------------------------------------------------------

    /// ------ Contract Instance for the `LSP6KeyManagerInit` ------
    const keyManagerInit = LSP6KeyManagerInit__factory.connect(LSP6KeyManagerInitAddress);
    /// ---------------------------------------------------------------------

    /// ------ Generate Random Salt for Universal Profile deployment (we can also use custom salt) ------
    const salt = randomBytes(32);
    /// -------------------------------------------------------------------------------------------------

    /// ------ Data for Universal Profile deployment ------
    const primaryContractDeploymentInit = {
        salt,
        fundingAmount: 0,
        implementationContract: UniversalProfileInitAddress,
        initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
            upPostDeploymentModuleAddress,
        ]),
    };
    /// ---------------------------------------------------

    /// ------ Data for Key Manager deployment ------
    const secondaryContractDeploymentInit = {
        fundingAmount: 0,
        implementationContract: LSP6KeyManagerInitAddress,
        addPrimaryContractAddress: true,
        initializationCalldata: keyManagerInit.interface.getFunction('initialize').selector,
        extraInitializationParams: '0x',
    };
    /// ---------------------------------------------------

    /// ------ Encode Data Keys & Values for updating permissions & LSP3Metadata ------
    const encodedSetData = new AbiCoder().encode(
        ['bytes32[]', 'bytes[]'],
        [
            [
                ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
                ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00'.repeat(16),
                ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                    mainController.toString().substring(2),
                ...(additionalDataKeys ? additionalDataKeys : []),
                ...(additionalControllers
                    ? additionalControllers.flatMap((controller, index) => [
                          ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
                              toBeHex(index + 1, 16).substring(2),
                          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                              controller.address.toString().substring(2),
                      ])
                    : []),
            ],
            [
                toBeHex(1 + (additionalControllers ? additionalControllers.length : 0), 16),
                mainController,
                ALL_PERMISSIONS,
                ...(additionalDataValues ? additionalDataValues : []),
                ...(additionalControllers
                    ? additionalControllers.flatMap((controller) => [
                          controller.address,
                          controller.permissions,
                      ])
                    : []),
            ],
        ],
    );
    /// -------------------------------------------------------------------------------

    /// ------ Pre-calculate the addresses for the Universal Profile & Key Manager ------
    const [universalProfileAddress, keyManagerAddress] = await LSP23LinkedContractsFactory.connect(
        signer,
    ).computeERC1167Addresses(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        upPostDeploymentModuleAddress,
        encodedSetData,
    );
    /// ---------------------------------------------------------------------------------

    /// ------ Deploy the Universal Profile & Key Manager ------
    const deploymentTransaction = await LSP23LinkedContractsFactory.connect(
        signer,
    ).deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        upPostDeploymentModuleAddress,
        encodedSetData,
    );
    /// --------------------------------------------------------

    await deploymentTransaction.wait(1);

    return { universalProfileAddress, keyManagerAddress };
};
