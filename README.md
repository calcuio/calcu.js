# calcu.js

The js SDK of Calcu Network

## Getting Started

1. Create API instance

```ts
import {Calcu} from '@calcu.js/calcu';

async function main() {
    const calcu = new Calcu({
      provider: new WsProvider('wss://calcu.io:9394')
    });
    await api.isReady;

    // use the api 
}

main();
```

2. Get infomation from the Calcu Network

```ts
// get file info
const fileInfo = await calcu.query.murphy.files('QmYpVrhb796h4r47z6tDwbbg3yyU28y9SJKcxitWC5s5Ko');
console.log(fileInfo.toHuman());
```




## Full Demo

install dependencies

```shell
yarn
```

debug

```shell
yarn debug
```


compile

```shell
yarn compile
```


run

```shell
# ${seeds} example: "echo xxxx soccer xxxx catch xxxx stone xxxx pumpkin nest merge xxxx"
# ${chain_ws} example: "ws://127.0.0.1:9944"
# ${file_path} example: "demo.txt"
yarn start ${seeds} ${chain_ws} ${file_path}
```