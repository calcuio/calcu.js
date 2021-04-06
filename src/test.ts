import { argv } from 'process';
import fs from 'fs';
// import IPFS from 'ipfs-core';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/api';
import {Calcu} from './';
// import {Keyring} from '@polkadot/keyring';
import {KeyringPair} from '@polkadot/keyring/types';
import {SubmittableExtrinsic} from '@polkadot/api/promise/types';

import {createLogger, format, transports} from 'winston';
import { allowedNodeEnvironmentFlags } from 'node:process';

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
    // const filePath = "./src/demo.ts";
    // if (!chain_ws_url) {
    //     logger.error("Please give file path");
    //     return
    // }
    // else {
    //     logger.info("File path is: " + filePath);
    // }
    
    /***************************Base instance****************************/
    // Read file
    // const fileContent = await fs.readFileSync(filePath);

    // Start local ipfs, ipfs base folder will be $USER/.jsipfs
    // const ipfs = await IPFS.create();

    // Connect to chain
    let api = await Calcu({
        provider: new WsProvider(chain_ws_url)
    });

    api = await api.isReady;

    // Load on-chain identity
    // const krp = loadKeyringPair("Alice");
    // const krp = loadKeyringPair(seeds);

    /*****************************Main logic******************************/
    // Add file into ipfs
    // const fileInfo = await addFile(ipfs, fileContent)
    // logger.info("file info: " + JSON.stringify(fileInfo));

    // Waiting for chain synchronization
    while (await is_syncing(api)) {
        logger.info(
            `⛓  Chain is synchronizing, current block number ${(
                await await api.rpc.chain.getHeader()
            ).number.toNumber()}`
        );
        await delay(6000);
    }
    const keyring = new Keyring({ type: 'sr25519' });
    // const krp = loadKeyringPair(seeds);
    const krp = keyring.addFromUri(seeds);
    const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });
    // logger.info(alice)
    console.log(alice)

    await api.query.system.account(alice.address, ({ nonce, data: balance }) => {
      console.log(`free balance is ${balance.free} with ${balance.reserved} reserved and a nonce of ${nonce}`);
    });
    // await api.query.system.account(krp.address, ({ nonce, data: balance }) => {
    //     console.log(`free balance is ${balance.free} with ${balance.reserved} reserved and a nonce of ${nonce}`);
    //   });
    
    // const unsub = await api.tx.balances
    //     .transfer(krp.address, 12345)
    //     .signAndSend(alice, ({ events = [], status }) => {
    //         console.log(`Current status is ${status.type}`);

    //         if (status.isFinalized) {
    //         console.log(`Transaction included at blockHash ${status.asFinalized}`);

    //         // Loop through Vec<EventRecord> to display all events
    //         events.forEach(({ phase, event: { data, method, section } }) => {
    //             console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
    //         });

    //         unsub();
    //         }
    //     });
    // console.log(alice.isLocked)
    // alice.unlock("")
    // Send storage order transaction
    const cid = "QmcztAX232UrQ3VUg7MZXsHSrkaRzT3uACZMJSRN7ymjYV";
    const poRes = await placeOrder(api, alice, cid, 1, 0)
    if (!poRes) {
        logger.error("Place storage order failed");
        return
    }
    else {
        logger.info("Place storage order success");
    }

    // Check file status on chain
    while (true) {
        const orderState = await get_order_info(api, cid);
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
    const pso = api.tx.murphy.upload(fileCID, fileSize, tip);
    // Send transaction
    const txRes = JSON.parse(JSON.stringify((await send_tx(krp, pso))));
    return JSON.parse(JSON.stringify(txRes));
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