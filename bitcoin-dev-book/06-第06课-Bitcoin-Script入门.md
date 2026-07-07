# 第 06 课 · Bitcoin Script 入门

> 栈式、逆波兰、非图灵完备——故意保持简单。
>
> **作者：曹宇春**

---

## 执行模型

Bitcoin Script 是**栈式语言**，**无循环**，执行步数上限 **201**（`MAX_OPS_PER_SCRIPT` 等限制）。

每笔 input 验证时执行：

```
<scriptSig>  <scriptPubKey>  →  OP执行 → 栈顶为 true 则通过
```

实际 SegWit 中 scriptSig 常为空，签名在 **witness** 中，scriptPubKey 为 `OP_0 <pubKeyHash>` 等。

---

## 常用操作码

| Opcode | 作用 |
|--------|------|
| `OP_DUP` | 复制栈顶 |
| `OP_HASH160` | RIPEMD160(SHA256(x)) |
| `OP_EQUALVERIFY` | 相等则继续，否则失败 |
| `OP_CHECKSIG` | 验证 ECDSA 签名 |
| `OP_CHECKMULTISIG` | M-of-N 多签 |
| `OP_CHECKLOCKTIMEVERIFY` | 绝对时间锁 |
| `OP_CHECKSEQUENCEVERIFY` | 相对时间锁 |

---

## P2PKH 标准脚本（最常见）

**scriptPubKey（锁定）：**

```
OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

**scriptSig（解锁，legacy）：**

```
<signature> <pubKey>
```

**执行流程：**

1. 压入签名和公钥
2. `OP_DUP` 复制公钥
3. `OP_HASH160` 得 pubkey hash
4. 与 scriptPubKey 中的 hash 比较
5. `OP_CHECKSIG` 验证签名对交易摘要有效

---

## 脚本类型一览

| 类型 | scriptPubKey 特征 | 地址前缀 |
|------|-------------------|----------|
| P2PKH | `DUP HASH160 ... CHECKSIG` | `1...` |
| P2SH | `HASH160 <scriptHash> EQUAL` | `3...` |
| P2WPKH | `0 <20-byte-hash>` | `bc1q...` |
| P2WSH | `0 <32-byte-hash>` | `bc1q...`（32 字节） |
| P2TR | `1 <32-byte-key>` | `bc1p...` |

---

## 故意非图灵完备

| 设计 | 原因 |
|------|------|
| 无循环 | 验证时间可预测，防 DoS |
| 无状态 | 每笔独立验证 |
| 简单栈 | 实现简单，共识风险低 |

复杂逻辑用 **P2SH / Taproot script path** 藏在哈希承诺后。

---

## 调试工具

- [script.bitbom.com](https://script.bitbom.com/) — 在线脚本调试
- `bitcoin-cli decodescript <hex>`
- `bitcoin-cli testmempoolaccept '["<rawtx>"]'` — 测试是否被 mempool 接受

---

## 本课小结

- Script = 定义 UTXO 花费条件的谓词
- P2PKH：`签名 + 公钥` 解锁 `CHECKSIG`
- 非图灵完备是安全特性，不是缺陷

---

**上一课** ← [第 05 课](05-第05课-交易结构与生命周期.md)  
**下一课** → [第 07 课 · 区块与区块链结构](07-第07课-区块与区块链结构.md)
