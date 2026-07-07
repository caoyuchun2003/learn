# 第 03 课 · Merkle 树与 SPV

> 区块如何承诺一组交易；轻节点如何只带区块头验证。
>
> **作者：曹宇春**

---

## Merkle 树结构

对区块内所有交易计算 txid，两两 hash 合并，逐层向上，直到单一根：

```
        Merkle Root
       /            \
    H(AB)          H(CD)
    /    \          /    \
  H(A)  H(B)     H(C)  H(D)
   |     |        |     |
  TxA   TxB      TxC   TxD
```

- 交易数为奇数时，最后一个节点**与自己配对**再 hash
- **Merkle Root** 写入区块头 `merkle_root` 字段
- 改任意一笔交易 → Root 变 → 区块头哈希变 → PoW 失效

---

## Merkle Proof（SPV 证明）

轻节点只有区块头，想确认交易 TxB 是否在区块中：

1. 节点提供 Merkle 路径：`H(A), H(CD), ...` 直到 Root
2. 轻节点本地计算：用 TxB 的 txid 与兄弟节点逐层 hash
3. 结果等于区块头中的 `merkle_root` → 交易确实在该块

**路径长度：** O(log N)，N 为交易数。

---

## SPV 钱包的权衡

| | 全节点 | SPV |
|--|--------|-----|
| 存储 | 完整区块 + UTXO | 仅 block headers |
| 验证 | 全部规则 | 交易在块中 + 最长链 |
| 信任 | 信任自己的验证 | 信任 peer 提供的 Merkle proof |
| 隐私 | 较好（可自建） | 需向 peer 泄露感兴趣地址 |

SPV **不验证**区块内所有交易是否合法，只验证**某笔交易是否被某矿工收录**。

---

## 默克尔树在比特币中的其他用途

- **见证 Merkle 树**（SegWit）：witness 数据单独成树
- **Taproot**：script path 用 Merkle 树隐藏分支脚本

---

## 代码直觉（伪代码）

```python
def merkle_root(txids: list[bytes]) -> bytes:
    layer = txids[:]
    while len(layer) > 1:
        if len(layer) % 2 == 1:
            layer.append(layer[-1])  # duplicate last
        layer = [hash256(layer[i] + layer[i+1])
                 for i in range(0, len(layer), 2)]
    return layer[0]
```

---

## 本课小结

- Merkle Root 是区块对交易列表的**紧凑承诺**
- SPV = 区块头 + Merkle proof，适合资源受限设备
- 全节点仍是最高安全模型

---

**上一课** ← [第 02 课](02-第02课-哈希与数字签名.md)  
**下一课** → [第 04 课 · UTXO 模型深入](04-第04课-UTXO模型深入.md)
