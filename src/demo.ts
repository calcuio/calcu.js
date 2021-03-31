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
    /**********************Parameters from CMD*************************/
    // Get seeds of account from cmd
    const seeds =  "error drink laundry tortoise tell shed reward robust aim remove coral clip";
    if (!seeds) {
        logger.error("Please give the seeds of account");
        return
    }

    // WS address of Calcu chain
    const chain_ws_url = "ws://localhost:9944" ;
    if (!chain_ws_url) {
        logger.error("Please give chain url, for example: ws://localhost:9944");
        return
    }
    else {
        logger.info("Chain url is: " + chain_ws_url);
    }

    // The file will be stored on the Calcu
    const filePath = "./src/demo.ts";
    if (!chain_ws_url) {
        logger.error("Please give file path");
        return
    }
    else {
        logger.info("File path is: " + filePath);
    }
    
    /***************************Base instance****************************/
    // Read file
    const fileContent = await fs.readFileSync(filePath);

    // Start local ipfs, ipfs base folder will be $USER/.jsipfs
    const ipfs = await IPFS.create();

    // Connect to chain
    let api = await Calcu({
        provider: new WsProvider(chain_ws_url)
    });

    api = await api.isReady;

    // Load on-chain identity
    const krp = loadKeyringPair(seeds);

    /*****************************Main logic******************************/
    // Add file into ipfs
    const fileInfo = await addFile(ipfs, fileContent)
    logger.info("file info: " + JSON.stringify(fileInfo));

    // Waiting for chain synchronization
    while (await isSyncing(api)) {
        logger.info(
            `⛓  Chain is synchronizing, current block number ${(
                await await api.rpc.chain.getHeader()
            ).number.toNumber()}`
        );
        await delay(6000);
    }

    // Send storage order transaction
    const poRes = await placeOrder(api, krp, fileInfo.cid, fileInfo.size, 0)
    if (!poRes) {
        logger.error("Place storage order failed");
        return
    }
    else {
        logger.info("Place storage order success");
    }

    // Check file status on chain
    while (true) {
        const orderState = await getOrderState(api, fileInfo.cid);
        logger.info("Order status: " + JSON.stringify(orderState));
        await delay(10000);
    }
}

/**
 * Place stroage order
 * @param api chain instance
 * @param fileCID the cid of file
 * @param fileSize the size of file in ipfs
 * @param tip tip for this order
 * @return true/false
 */
async function placeOrder(api: ApiPromise, krp: KeyringPair, fileCID: string, fileSize: number, tip: number) {
    // Determine whether to connect to the chain
    await api.isReadyOrError;
    // Generate transaction
    const pso = api.tx.market.placeStorageOrder(fileCID, fileSize, tip);
    // Send transaction
    const txRes = JSON.parse(JSON.stringify((await sendTx(krp, pso))));
    return JSON.parse(JSON.stringify(txRes));
}

/**
 * Add file into local ipfs node
 * @param ipfs ipfs instance
 * @param fileContent can be any of the following types: ` Uint8Array | Blob | String | Iterable<Uint8Array> | Iterable<number> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>`
 */
async function addFile(ipfs: IPFS.IPFS, fileContent: any) {
    // Add file to ipfs
    const cid = await ipfs.add(
        fileContent,
        {
            progress: (prog) => console.log(`Add received: ${prog}`)
        }
    );

    // Get file status from ipfs
    const fileStat = await ipfs.files.stat("/ipfs/" + cid.path);

    return {
        cid: cid.path,
        size: fileStat.cumulativeSize
    };
}

/**
 * Get on-chain order information about files
 * @param api chain instance
 * @param cid the cid of file
 * @return order state
 */
async function getOrderState(api: ApiPromise, cid: string) {
    await api.isReadyOrError;
    return await api.query.market.files(cid);
}

/**
  * Used to determine whether the chain is synchronizing
  * @param api chain instance
  * @returns true/false
  */
async function isSyncing(api: ApiPromise) {
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
 * Send tx to calcu network
 * @param krp On-chain identity
 * @param tx substrate-style tx
 * @returns tx already been sent
 */
async function sendTx(krp: KeyringPair, tx: SubmittableExtrinsic) {
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
            logger.info(`  ↪ 💸 ❌ [tx]: Send transaction(${tx.type}) failed.`);
            resolve(false);
          } else if (method === 'ExtrinsicSuccess') {
            logger.info(
              `  ↪ 💸 ✅ [tx]: Send transaction(${tx.type}) success.`
            );
            resolve(true);
          }
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
 * Load keyring pair with seeds
 * @param seeds Account's seeds
 */
function loadKeyringPair(seeds: string): KeyringPair {
  const kr = new Keyring({
    type: 'sr25519',
  });

  const krp = kr.addFromUri(seeds);
  return krp;
}

async function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}