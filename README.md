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

2. Get the file info from the Calcu Network

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

# ${chain_ws} example: "ws://127.0.0.1:9944"
# ${file_path} example: "demo.txt"
yarn start ${chain_ws} ${file_path}
```

result
```
yarn debug
yarn run v1.22.10
$ nodemon src/demo.ts
[nodemon] 2.0.7
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node src/demo.ts`
[2021-05-21 16:26:17] warn: chain url set as default : ws://localhost:9944
[2021-05-21 16:26:17] warn: file path set as default: ./src/demo.ts
Swarm listening on /ip4/127.0.0.1/tcp/4002/p2p/QmTjeFiJDCYbGJNYkzG36TacXsn9DuWqRWFGNG6HhZCqqN
Swarm listening on /ip4/192.168.3.6/tcp/4002/p2p/QmTjeFiJDCYbGJNYkzG36TacXsn9DuWqRWFGNG6HhZCqqN
Swarm listening on /ip4/10.8.0.3/tcp/4002/p2p/QmTjeFiJDCYbGJNYkzG36TacXsn9DuWqRWFGNG6HhZCqqN
Swarm listening on /ip4/127.0.0.1/tcp/4003/ws/p2p/QmTjeFiJDCYbGJNYkzG36TacXsn9DuWqRWFGNG6HhZCqqN
upload received: 6914
[2021-05-21 16:26:19] info: file info: {"cid":"QmcvYHxvcuDCs51gmQuueNbtuvgskDZHcogB2i7qKtsTKe","size":6925}
[2021-05-21 16:26:22] info:   ↪ [tx]: Transaction status: Ready, nonce: 0
[2021-05-21 16:26:24] info:   ↪ [tx]: Transaction status: InBlock, nonce: 0
[2021-05-21 16:26:24] info:  [tx]: send tx(4) success.
	' balances.Transfer:: ["cTM8suyN19VZb7JEPRNvtezyfpEAJyYxHkk1n5J4XEr6XroRa","cTJp8A3DSBq5J7YKPZM7mFipA1Nu86q98bUqJYWiwvHDtFGxt",2001000]
	' balances.Transfer:: ["cTM8suyN19VZb7JEPRNvtezyfpEAJyYxHkk1n5J4XEr6XroRa","cTJp8A3DSBq5J7YKPZM7mKVjbex7qFYhqPyRtH82SJGiTpQwh",14407200]
	' balances.Transfer:: ["cTM8suyN19VZb7JEPRNvtezyfpEAJyYxHkk1n5J4XEr6XroRa","cTJp8A3DSBq5J7YKPZM7mKVnAbhggRYrp88XpwMtJx33xyYf6",3601800]
	' murphy.FileSuccess:: ["cTM8suyN19VZb7JEPRNvtezyfpEAJyYxHkk1n5J4XEr6XroRa","0x516d63765948787663754443733531676d517575654e6274757667736b445a48636f6742326937714b7473544b65"]
	' treasury.Deposit:: [3401815333]
	' system.ExtrinsicSuccess:: [{"weight":4111000000,"class":"Normal","paysFee":"Yes"}]
[2021-05-21 16:26:24] info: send file success
[2021-05-21 16:26:24] info: File status: [{"file_size":6925,"expired_on":0,"calculated_at":4,"amount":3601800,"prepaid":0,"reported_replica_count":0,"replicas":[]},{"used_size":0,"reported_group_count":0,"groups":{}}]
[2021-05-21 16:26:34] info: File status: [{"file_size":6925,"expired_on":0,"calculated_at":4,"amount":3601800,"prepaid":0,"reported_replica_count":0,"replicas":[]},{"used_size":0,"reported_group_count":0,"groups":{}}]
[2021-05-21 16:26:40] info:   ↪ [tx]: Transaction status: Finalized, nonce: 0
[2021-05-21 16:26:40] info:  [tx]: send tx(4) success.
	' balances.Transfer:: ["cTM8suyN19VZb7JEPRNvtezyfpEAJyYxHkk1n5J4XEr6XroRa","cTJp8A3DSBq5J7YKPZM7mFipA1Nu86q98bUqJYWiwvHDtFGxt",2001000]
	' balances.Transfer:: ["cTM8suyN19VZb7JEPRNvtezyfpEAJyYxHkk1n5J4XEr6XroRa","cTJp8A3DSBq5J7YKPZM7mKVjbex7qFYhqPyRtH82SJGiTpQwh",14407200]
	' balances.Transfer:: ["cTM8suyN19VZb7JEPRNvtezyfpEAJyYxHkk1n5J4XEr6XroRa","cTJp8A3DSBq5J7YKPZM7mKVnAbhggRYrp88XpwMtJx33xyYf6",3601800]
	' murphy.FileSuccess:: ["cTM8suyN19VZb7JEPRNvtezyfpEAJyYxHkk1n5J4XEr6XroRa","0x516d63765948787663754443733531676d517575654e6274757667736b445a48636f6742326937714b7473544b65"]
	' treasury.Deposit:: [3401815333]
	' system.ExtrinsicSuccess:: [{"weight":4111000000,"class":"Normal","paysFee":"Yes"}]
[2021-05-21 16:26:44] info: File status: [{"file_size":6925,"expired_on":0,"calculated_at":4,"amount":3601800,"prepaid":0,"reported_replica_count":0,"replicas":[]},{"used_size":0,"reported_group_count":0,"groups":{}}]

```