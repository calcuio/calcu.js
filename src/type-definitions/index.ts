import {
  jsonrpcFromDefs,
  typesAliasFromDefs,
  typesFromDefs,
} from '@open-web3/orml-type-definitions/utils';
import staking from './staking';
import claims from './claims';
import murphy from './murphy';
import tars from './tars';
import base from './base';

export const calcuTypes = {
  base,
  staking,
  claims,
  murphy,
  tars,
};

export const types = {
  ...typesFromDefs(calcuTypes),
};

export const rpc = jsonrpcFromDefs(calcuTypes);
export const typesAlias = typesAliasFromDefs(calcuTypes);

const bundle = {
  rpc,
  types: [
    {
      minmax: [undefined, undefined] as any,
      types: {
        ...types,
      },
    },
  ],
  alias: typesAlias,
};

// Type overrides have priority issues
export const typesBundleForPolkadot = {
  spec: {
    calcu: bundle,
  },
};
