import { ApiPromise } from '@polkadot/api';
import { typesBundle } from './types';

export class Calcu extends ApiPromise {
  constructor(options?: any) { 
    super(options);
    options.typesBundle = typesBundle; 
  }
}

