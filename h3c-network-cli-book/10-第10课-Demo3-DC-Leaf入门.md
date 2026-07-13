# 第 10 课 · Demo3：DC Leaf 入门

> Underlay OSPF + Loopback——DC 实验第一步（VXLAN 概念扩展）。
>
> **作者：曹宇春**

---

## 场景故事

最小 **Spine-Leaf** 实验台：两台 **Leaf（S6800 或三层交换模拟）** + 一台 **Spine**，先跑通 **Underlay IP + OSPF**，为后续 VXLAN 打地基。

> **环境要求**：Comware V7 设备或 HCL 模拟；语法以 `display version` 为准。

---

## 拓扑

```
        [ Spine ]
      Lo0 10.0.0.1
     /          \
Leaf-A          Leaf-B
Lo0 10.0.0.2    Lo0 10.0.0.3
Gi1/0/49        Gi1/0/49
  │               │
服务器          服务器
```

---

## IP 规划

| 设备 | Loopback0 | 互联（示例） |
|------|-----------|--------------|
| Spine | 10.0.0.1/32 | Leaf-A 网段 10.1.1.0/30 |
| Leaf-A | 10.0.0.2/32 | Spine 10.1.1.1/30 |
| Leaf-B | 10.0.0.3/32 | Spine 10.1.2.1/30 |

---

## 一、Spine 配置

```text
<H3C> system-view
[H3C] sysname Spine

[Spine] interface LoopBack0
[Spine-LoopBack0] ip address 10.0.0.1 255.255.255.255
[Spine-LoopBack0] quit

[Spine] interface GigabitEthernet1/0/1
[Spine-GigabitEthernet1/0/1] ip address 10.1.1.1 255.255.255.252
[Spine-GigabitEthernet1/0/1] undo shutdown
[Spine-GigabitEthernet1/0/1] quit

[Spine] interface GigabitEthernet1/0/2
[Spine-GigabitEthernet1/0/2] ip address 10.1.2.1 255.255.255.252
[Spine-GigabitEthernet1/0/2] undo shutdown
[Spine-GigabitEthernet1/0/2] quit

[Spine] ospf 1 router-id 10.0.0.1
[Spine-ospf-1] area 0.0.0.0
[Spine-ospf-1-area-0.0.0.0] network 10.0.0.1 0.0.0.0
[Spine-ospf-1-area-0.0.0.0] network 10.1.1.0 0.0.0.3
[Spine-ospf-1-area-0.0.0.0] network 10.1.2.0 0.0.0.3
[Spine-ospf-1-area-0.0.0.0] quit
[Spine-ospf-1] quit

[Spine] save
```

---

## 二、Leaf-A 配置

```text
[H3C] sysname Leaf-A

[Leaf-A] interface LoopBack0
[Leaf-A-LoopBack0] ip address 10.0.0.2 255.255.255.255
[Leaf-A-LoopBack0] quit

[Leaf-A] interface GigabitEthernet1/0/49
[Leaf-A-GigabitEthernet1/0/49] ip address 10.1.1.2 255.255.255.252
[Leaf-A-GigabitEthernet1/0/49] undo shutdown
[Leaf-A-GigabitEthernet1/0/49] quit

[Leaf-A] ospf 1 router-id 10.0.0.2
[Leaf-A-ospf-1] area 0.0.0.0
[Leaf-A-ospf-1-area-0.0.0.0] network 10.0.0.2 0.0.0.0
[Leaf-A-ospf-1-area-0.0.0.0] network 10.1.1.0 0.0.0.3
[Leaf-A-ospf-1-area-0.0.0.0] quit
[Leaf-A-ospf-1] quit

[Leaf-A] save
```

Leaf-B 同理，router-id `10.0.0.3`，互联 `10.1.2.2/30`。

---

## 三、验收 checklist

```text
□ 每台：dis int b → 互联口 UP
□ 每台：dis ospf peer → Full 邻居
□ Leaf-A：ping 10.0.0.3 → 对端 Loopback 通
□ dis ip routing-table 10.0.0.3 → ospf 路由
□ dis ospf routing → 看到 Loopback 路由
```

---

## 四、VXLAN 扩展（概念，V7 实验台）

Underlay 通后，典型下一步：

```text
# 概念步骤（具体以 V7 实验手册为准）
l2vpn enable
vxlan tunnel ...
vsi ...
# 或 EVPN：
# bgp 65001
#  l2vpn-family evpn
#    peer x.x.x.x enable
```

验收：

```text
display vxlan tunnel
display l2vpn vsi
display bgp l2vpn evpn
```

**生产环境** 建议 **AD-NET 控制器** 下发，手工 CLI 仅实验。

---

## 五、Underlay vs Overlay

| 层次 | 干什么 | 本 Demo |
|------|--------|---------|
| Underlay | 设备之间 IP 可达 | OSPF + Loopback |
| Overlay | 租户 VXLAN/EVPN | 扩展步骤 |

---

## 练习

1. 为什么 DC 用 Loopback 做 OSPF router-id？  
2. Leaf 之间 ping 通靠的是什么路由协议？  

---

## 小结

- DC Demo 第一步：Loopback + 互联 IP + OSPF Full  
- VXLAN/EVPN 在 Underlay 通后再做  
- 大规模用 AD-NET，别纯 CLI 硬扛  

---

*下一课：按现象排障。*
