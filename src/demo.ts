import {ApiPromise, WsProvider} from '@polkadot/api';
import {typesBundleForPolkadot} from './type-definitions';

async function main() {
    const api = new ApiPromise({
      provider: new WsProvider('ws://44.237.84.153:9944'),
      typesBundle: typesBundleForPolkadot,
    });

    await api.isReady;
    console.log(api.genesisHash.toHex());

    console.info('ready!')
    // Use api

    const fileInfo = await api.query.market.files('QmRaknS23vXEcdJezkrVC5WrApQNUkUDdTpbRdvh5fuJHc');
    console.log(fileInfo.toHuman());
}

main();
