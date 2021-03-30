# calcu.js

The js SDK of Calcu Network

## Getting Started

1. Create API instance

```ts
import {ApiPromise, WsProvider} from '@polkadot/api';
import {typesBundleForPolkadot} from '@calcu.js/type-definitions';

async function main() {
    const api = new ApiPromise({
      provider: new WsProvider('wss://calcu.io:9955'),
      typesBundle: typesBundleForPolkadot,
    });
    await api.isReady;

    // use the api 
}

main();
```

2. Get infomation from the  chain

```ts
// get file info
const fileInfo = await api.query.market.files('QmYpVrhb796h4r47z6tDwbbg3yyU28y9SJKcxitWC5s5Ko');
console.log(fileInfo.toHuman());
```


## Full Demo


```shell
# ${seeds} example: "echo xxxx soccer xxxx catch xxxx stone xxxx pumpkin nest merge xxxx"
# ${chain_ws} example: "ws://127.0.0.1:9944"
# ${file_path} example: "demo.txt"
yarn start ${seeds} ${chain_ws} ${file_path}
```