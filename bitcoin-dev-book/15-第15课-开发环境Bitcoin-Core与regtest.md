# 第 15 课 · 开发环境：Bitcoin Core 与 regtest

> 本地私链，秒级出块，开发必备。
>
> **作者：曹宇春**

---

## 安装 Bitcoin Core

```bash
# macOS
brew install bitcoin

# Ubuntu
sudo apt install bitcoind bitcoin-qt
```

组件：
- `bitcoind` — 守护进程
- `bitcoin-cli` — RPC 客户端
- `bitcoin-qt` — GUI（可选）

---

## regtest 快速启动

```bash
# 终端 1：启动 regtest 守护进程
bitcoind -regtest -daemon -fallbackfee=0.0002

# 终端 2：创建钱包
bitcoin-cli -regtest createwallet "dev"

# 生成地址
ADDR=$(bitcoin-cli -regtest getnewaddress)
echo $ADDR

# 挖 101 块（coinbase 需 100 确认才可用）
bitcoin-cli -regtest generatetoaddress 101 $ADDR

# 查余额
bitcoin-cli -regtest getbalances
```

---

## bitcoin.conf 示例（开发）

```ini
regtest=1
server=1
rpcuser=dev
rpcpassword=devpass
rpcallowip=127.0.0.1
fallbackfee=0.0002
txindex=1
```

---

## testnet vs signet vs regtest

| 链 | 用途 | 出块 |
|----|------|------|
| **regtest** | 本地开发 | `generatetoaddress` 即时 |
| **signet** | 协作测试网，可控水龙头 | ~10 分钟，稳定 |
| **testnet** | 公开测试，环境嘈杂 | 不稳定，偶有攻击 |

推荐流程：**regtest 开发 → signet/testnet 集成测试 → mainnet 小额验证**。

---

## RPC 基础

```bash
bitcoin-cli -regtest help
bitcoin-cli -regtest help sendtoaddress

# 发送
bitcoin-cli -regtest sendtoaddress <addr> 0.1

# 挖出确认
bitcoin-cli -regtest generatetoaddress 1 $(bitcoin-cli -regtest getnewaddress)
```

---

## 其他开发工具

| 工具 | 语言 | 用途 |
|------|------|------|
| bitcoinjs-lib | JavaScript | 浏览器/Node 构造交易 |
| rust-bitcoin | Rust | 底层类型、序列化 |
| python-bitcoinlib | Python | 教学、脚本实验 |
| btcd / btcwallet | Go | 全节点替代实现 |
| LND / Core Lightning | — | 闪电节点 |

---

## 本课小结

- regtest = 完全本地、可控出块
- `bitcoin-cli` 是探索协议最快的 REPL
- 下一课动手构造 raw transaction

---

**上一课** ← [第 14 课](14-第14课-全节点验证与同步.md)  
**下一课** → [第 16 课 · 构造与签名交易](16-第16课-构造与签名交易.md)
