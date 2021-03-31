import fs from 'fs';
import IPFS from 'ipfs-core';
import { ApiPromise,  WsProvider} from '@polkadot/api';
import {typesBundleForPolkadot,calcuTypes} from './type-definitions';
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


export async function Calcu(options?: any) {
    // wrap api
    options.typesBundle = typesBundleForPolkadot;
    const api = new ApiPromise(options);
    return api;
}

