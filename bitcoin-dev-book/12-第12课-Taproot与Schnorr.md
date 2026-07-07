# 第 12 课 · Taproot 与 Schnorr

> BIP-341/342：默认最简路径、隐私与多签聚合。
>
> **作者：曹宇春**

---

## 动机

| 问题 | Taproot 方案 |
|------|--------------|
| 复杂脚本链上占空间 | 默认只暴露单签，复杂逻辑走 script path |
| ECDSA 签名大 | Schnorr 64 字节，可聚合 |
| 多签链上明显 | MuSig 类方案可看起来像单签 |

---

## 密钥聚合（概念）

多个参与方协作生成**单一公钥**（Taproot internal key），链上只见一个 `bc1p` 地址。

花费时：

- **Key path：** 合作签名，不暴露脚本
- **Script path：** 揭示 Merkle 树中某叶子脚本 + 满足条件

---

## P2TR 输出

```
scriptPubKey: OP_1 <32-byte tweaked pubkey>
地址: bc1p... (Bech32m)
```

**Tweak：** 用 Merkle root 等对 internal key 调整，绑定 script 树承诺。

---

## Schnorr 签名（BIP-340）

- 签名 64 字节（r || s）
- **批量验证**效率更高
- 支持 **BIP-322** 消息签名等扩展

Bitcoin Core 0.21+ 支持 Taproot；2021 年 11 月区块 709,632 激活。

---

## Key Path vs Script Path

```
Key Path（常见）:
  witness: <schnorr_sig>
  链上看起来像普通单签转账

Script Path（条件分支）:
  witness: <stack items> <script> <control block>
  control block 含 Merkle 路径证明
```

---

## 开发注意

- 使用支持 Taproot 的库（Bitcoin Core 22+、rust-bitcoin 0.29+、bitcoinjs-lib 6+）
- 多签优先评估 **MuSig2** 而非裸 `OP_CHECKMULTISIG`（费、隐私）
- 测试网 / signet 先验证

---

## 本课小结

- Taproot = Schnorr + MAST（Merklized Alternative Script Tree）
- 默认 key path 最省空间、隐私最好
- 比特币脚本演进终点（目前）是 **bc1p**

---

**上一课** ← [第 11 课](11-第11课-SegWit与见证数据.md)  
**下一课** → [第 13 课 · P2P 网络与节点类型](13-第13课-P2P网络与节点类型.md)
