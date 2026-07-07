# 第 11 课 · SegWit 与见证数据

> BIP-141：修复延展性、提高有效容量、为闪电铺路。
>
> **作者：曹宇春**

---

## 解决的问题

### 1. 交易延展性（Malleability）

第三方可在签名编码上做微调，**改变 txid 但不无效交易**。  
对闪电网络等二层，需要稳定的 txid 作为承诺。

### 2. 区块容量

签名等数据移入 **witness**，按较低 weight 计费 → 同等 weight 下容纳更多交易。

### 3. 脚本版本升级

见证版本字段（`0x00` + program）便于未来新脚本类型。

---

## 结构变化

SegWit 交易在序列化中带 **marker（0x00）flag（0x01）**：

- **stripped transaction：** 不含 witness，用于算 **txid**
- **full transaction：** 含 witness，用于算 **wtxid**

每个 input 的 witness 栈独立存放签名、公钥等。

---

## P2WPKH（原生 SegWit 单签）

```
scriptPubKey: OP_0 <20-byte pubkey hash>
witness: <signature> <pubkey>
scriptSig: (empty)
```

地址：`bc1q...`（42 字符左右）

---

## P2SH-P2WPKH（嵌套 SegWit）

兼容不支持 bc1 的老地址：外层 P2SH，赎回脚本为 `0x0014<pubkeyhash>`。

```
发送方看到 3... 地址，实际 witness 在内部解锁
```

---

## Weight 与 Fee 计算

```
weight = 3 × stripped_size + total_size
vsize = weight / 4  (虚拟字节)
fee rate 通常以 sat/vB 报价
```

witness 字节在 weight 中「打折」，鼓励 SegWit 采用。

---

## 激活回顾

- BIP-141 定义 SegWit
- 2017 年通过 **BIP-9** 版本位激活（UASF / SegWit2x 争议背景）
- 现主网 SegWit 交易占绝大多数

---

## 本课小结

- SegWit = witness 分离 + weight 计费
- txid 稳定 → 二层可行
- 开发应默认构造 **native SegWit** 交易

---

**上一课** ← [第 10 课](10-第10课-地址类型演进.md)  
**下一课** → [第 12 课 · Taproot 与 Schnorr](12-第12课-Taproot与Schnorr.md)
