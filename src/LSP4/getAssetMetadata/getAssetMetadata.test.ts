import { JsonRpcProvider } from 'ethers';

import { getAssetMetadata } from '.';
import { ERC725Y__factory, ERC725Y } from '../../typechain';

describe('getDigitalAssetCreators', () => {
    it('', async () => {
        const provider = new JsonRpcProvider('https://rpc.testnet.lukso.gateway.fm');

        const erc725y = new ERC725Y__factory()
            .attach('0xa289935a2f0e66b0dcb97e95c6c91b0d33280fa0')
            .connect(provider) as ERC725Y;

        const assetMetadata = await getAssetMetadata(erc725y);

        console.log(JSON.stringify(assetMetadata));
    });
});
