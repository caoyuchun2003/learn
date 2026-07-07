# 附录 A · bitcoin-cli RPC 速查

> 开发常用命令，默认 `-regtest`，mainnet 去掉该参数。
>
> **作者：曹宇春**

---

## 链与区块

```bash
bitcoin-cli -regtest getblockchaininfo
bitcoin-cli -regtest getblockcount
bitcoin-cli -regtest getbestblockhash
bitcoin-cli -regtest getblock <hash> 2
bitcoin-cli -regtest getblockheader <hash>
bitcoin-cli -regtest generatetoaddress <nblocks> <address>
```

---

## 钱包

```bash
bitcoin-cli -regtest createwallet "name"
bitcoin-cli -regtest getnewaddress
bitcoin-cli -regtest getbalances
bitcoin-cli -regtest listunspent
bitcoin-cli -regtest sendtoaddress <addr> <amount>
bitcoin-cli -regtest gettransaction <txid>
```

---

## 原始交易

```bash
bitcoin-cli -regtest createrawtransaction '[...]' '{...}'
bitcoin-cli -regtest fundrawtransaction <hex>
bitcoin-cli -regtest signrawtransactionwithwallet <hex>
bitcoin-cli -regtest sendrawtransaction <hex>
bitcoin-cli -regtest testmempoolaccept '["<hex>"]'
bitcoin-cli -regtest decoderawtransaction <hex>
bitcoin-cli -regtest getrawtransaction <txid> true
```

---

## PSBT

```bash
bitcoin-cli -regtest walletcreatefundedpsbt '[]' '[...]'
bitcoin-cli -regtest walletprocesspsbt <psbt>
bitcoin-cli -regtest finalizepsbt <psbt>
bitcoin-cli -regtest decodepsbt <psbt>
bitcoin-cli -regtest joinpsbts '["<psbt1>","<psbt2>"]'
```

---

## Mempool 与费率

```bash
bitcoin-cli -regtest getmempoolinfo
bitcoin-cli -regtest getrawmempool true
bitcoin-cli -regtest estimatesmartfee 6
```

---

## 脚本工具

```bash
bitcoin-cli -regtest decodescript <hex>
bitcoin-cli -regtest validateaddress <addr>
bitcoin-cli -regtest getdescriptorinfo "<descriptor>"
```

---

## 网络

```bash
bitcoin-cli -regtest getnetworkinfo
bitcoin-cli -regtest getpeerinfo
bitcoin-cli -regtest addnode <ip> add
```

---

**返回** → [前言与导读](00-前言与导读.md)
