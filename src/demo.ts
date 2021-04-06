import { argv } from 'process';
import fs from 'fs';
import IPFS from 'ipfs-core';
import { ApiPromise, WsProvider } from '@polkadot/api';
import {Calcu} from './';
import {Keyring} from '@polkadot/keyring';
import {KeyringPair} from '@polkadot/keyring/types';
import {SubmittableExtrinsic} from '@polkadot/api/promise/types';

import {createLogger, format, transports} from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.colorize(),
    format.errors({stack: true}),
    format.printf((info: { timestamp: any; level: any; message: any; } | any) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
  ],
});

main().catch(e => {
    console.log(e);
});

async function main() {

    // WS address of Calcu chain

    let chain_ws_url = argv[2];
    if (!chain_ws_url) {
        chain_ws_url = "ws://localhost:9944" ;
        logger.warn("chain url set as default : "+chain_ws_url);
    }
    else {
        logger.info("Chain url is: " + chain_ws_url);
    }

    // The file will be stored on the Calcu
    let file_path = argv[3];

    
    if (!file_path) {
        file_path = "./src/demo.ts";
        logger.warn("file path set as default: " + file_path);
        
    }
    else {
        logger.info("File path input as : " + file_path);
    }
    
    // read file
    const file_content = await fs.readFileSync(file_path);

    // Start local ipfs, ipfs base folder will be $USER/.jsipfs
    const ipfs = await IPFS.create();

    // connect to chain
    let api = await Calcu({
        provider: new WsProvider(chain_ws_url)
    });

    api = await api.isReady;

    const keyring = new Keyring({ type: 'sr25519' });
    const krp = keyring.addFromUri('//Alice', { name: 'Alice default' });


    // upload file into ipfs
    const file_info = await upload_file(ipfs, file_content)
    logger.info("file info: " + JSON.stringify(file_info));

    // Waiting for chain synchronization
    while (await is_syncing(api)) {
        logger.info(
            `chain is synchronizing, current block number ${(
                await await api.rpc.chain.getHeader()
            ).number.toNumber()}`
        );
        await delay(6000);
    }

    // Send storage order transaction
    const poRes = await send_order(api, krp, file_info.cid, file_info.size, 0)
    if (!poRes) {
        logger.error("send order failed");
        return
    }
    else {
        logger.info("send order success");
    }

    // get file status on chain
    while (true) {
      const order_state = await get_order_info(api, file_info.cid);
      logger.info("Order status: " + JSON.stringify(order_state));
      await delay(10000);
  }
}

/**
 * send stroage order
 * @param api chain instance
 * @param cid file cid
 * @param file_size the size of file in ipfs
 * @param tip tip for this order
 * @return true/false
 */
 async function send_order(api: ApiPromise, krp: KeyringPair, cid: string, file_size: number, tip: number) {

    await api.isReadyOrError;
    // make transaction
    const pso = api.tx.murphy.upload(cid, file_size, tip);
    // send transaction
    const txRes = JSON.parse(JSON.stringify((await send_tx(krp, pso))));
    return JSON.parse(JSON.stringify(txRes));
}

/**
 * upload file into local ipfs node
 * @param ipfs ipfs instance
 * @param fileContent can be any of the following types: ` Uint8Array | Blob | String | Iterable<Uint8Array> | Iterable<number> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>`
 */
 async function upload_file(ipfs: IPFS.IPFS, file_content: any) {
    // upload file to ipfs
    const cid = await ipfs.add(
      file_content,
        {
            progress: (prog) => console.log(`upload received: ${prog}`)
        }
    );

    // get file status from ipfs
    const file_stat = await ipfs.files.stat("/ipfs/" + cid.path);

    return {
        cid: cid.path,
        size: file_stat.cumulativeSize
    };
}

/**
 * get on-chain order information
 * @param api chain instance
 * @param cid the cid of file
 * @return order state
 */
 async function get_order_info(api: ApiPromise, cid: string) {
  await api.isReadyOrError;
  return await api.query.murphy.files(cid);
}

/**
  * Used to determine whether the chain is synchronizing
  * @param api chain instance
  * @returns true/false
  */
 async function is_syncing(api: ApiPromise) {
    const health = await api.rpc.system.health();
    let res = health.isSyncing.isTrue;

    if (!res) {
        const h_before = await api.rpc.chain.getHeader();
        await delay(3000);
        const h_after = await api.rpc.chain.getHeader();
        if (h_before.number.toNumber() + 1 < h_after.number.toNumber()) {
            res = true;
        }
    }
    return res;
}

/**
 * send tx to calcu network
 * @param krp On-chain identity
 * @param tx substrate-style tx
 * @returns tx already been sent
 */
 async function send_tx(krp: KeyringPair, tx: SubmittableExtrinsic) {
  return new Promise((resolve, reject) => {
    tx.signAndSend(krp, ({events = [], status}) => {
      logger.info(
        `  ↪ 💸 [tx]: Transaction status: ${status.type}, nonce: ${tx.nonce}`
      );

      if (
        status.isInvalid ||
        status.isDropped ||
        status.isUsurped ||
        status.isRetracted
      ) {
        reject(new Error('Invalid transaction.'));
      } else {
        // Pass it
      }

      if (status.isInBlock) {
        events.forEach(({event: {method, section}}) => {
          if (section === 'system' && method === 'ExtrinsicFailed') {
            // Error with no detail, just return error
            logger.info(` [tx]: send trans(${tx.type}) failed.`);
            resolve(false);
          } else if (method === 'ExtrinsicSuccess') {
            logger.info(
              ` [tx]: send trans(${tx.type}) success.`
            );
            resolve(true);
          }
        });
        events.forEach(({event:{ data, method, section } }) => {
            console.log(`\t' ${section}.${method}:: ${data}`);
  
          });
      } else {
        // Pass it
      }
    }).catch(e => {
      reject(e);
    });
  });
}

/**
 * get keyring pair with seeds
 * @param seeds Account's seeds
 */
 function get_KeyringPair(seeds: string): KeyringPair {
  const kr = new Keyring({
    type: 'sr25519',
  });

  const krp = kr.addFromUri(seeds);
  return krp;
}
async function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}