# 第 04 课 · display 查看类大全

> 华三 CLI 的「只读字典」——按分类查。
>
> **作者：曹宇春**

---

## 规律

- 全部以 **`display`**（`dis`）开头  
- **在用户视图和系统视图都能用**（多数命令）  
- 生产环境优先用 display，**慎用 debugging**

---

## 一、通用 / 系统

| 命令 | 作用 |
|------|------|
| `dis version` | 型号、Comware 版本 |
| `dis device` | 框式：板卡、电源、风扇 |
| `dis cur` | 运行配置全文 |
| `dis saved-configuration` | 已保存配置（视版本） |
| `dis cpu-usage` | CPU |
| `dis memory` | 内存 |
| `dis logbuffer` | 日志缓冲 |
| `dis alarm` | 告警 |
| `dis local-user` | 本地用户 |
| `dis startup` | 启动文件 |

---

## 二、接口与链路

| 命令 | 作用 |
|------|------|
| `dis int b` | 接口摘要 Up/Down |
| `dis interface Gi1/0/1` | 单口详情 |
| `dis ip int b` | 哪些口有 IP |
| `dis link-aggregation verbose` | 链路聚合 |
| `dis poe interface` | PoE 状态 |

---

## 三、二层（交换）

| 命令 | 作用 |
|------|------|
| `dis vlan` | VLAN 列表 |
| `dis vlan 10` | 单个 VLAN 端口 |
| `dis mac-address` | MAC 表 |
| `dis mac-address vlan 10` | 按 VLAN 查 |
| `dis arp` | ARP 表 |
| `dis stp brief` | 生成树 |
| `dis lldp neighbor list` | 邻居 |

---

## 四、三层（路由）

| 命令 | 作用 |
|------|------|
| `dis ip routing-table` | 路由表 |
| `dis ip routing-table 192.168.10.0` | 查特定路由 |
| `dis ospf peer` | OSPF 邻居 |
| `dis ospf routing` | OSPF 路由 |
| `dis bgp peer` | BGP 邻居 |
| `dis bgp routing-table` | BGP 路由 |

---

## 五、安全 / NAT / ACL

| 命令 | 作用 |
|------|------|
| `dis acl all` | 所有 ACL |
| `dis acl 2000` | 指定 ACL |
| `dis nat outbound` | NAT 绑定 |
| `dis nat session` | NAT 会话 |

---

## 六、VPN

| 命令 | 作用 |
|------|------|
| `dis ike sa` | IKE 第一阶段 |
| `dis ipsec sa` | IPsec 隧道 |
| `dis ipsec policy` | IPsec 策略 |

---

## 七、无线（AC）

| 命令 | 作用 |
|------|------|
| `dis wlan ap all` | AP 在线状态 |
| `dis wlan client` | 关联终端 |
| `dis wlan ssid` | SSID |
| `dis wlan service-template` | 服务模板 |

---

## 八、高可用 / DC

| 命令 | 作用 |
|------|------|
| `dis irf` | IRF 堆叠 |
| `dis vrrp` | VRRP |
| `dis bfd session` | BFD |
| `dis vxlan tunnel` | VXLAN 隧道 |
| `dis l2vpn vsi` | VSI 实例 |
| `dis bgp l2vpn evpn` | EVPN 路由 |

---

## 练习

1. AP 显示 Idle 不是 Run，第一条 display 是什么？  
2. 内网能 ping 网关但上不了网，查哪三条 display？  

---

## 小结

- display = 只读字典，按 **接口/二层/三层/安全/VPN/无线** 分类记  
- 排障先 int b + ip routing-table，再按现象加查  

---

*下一课：二层交换配置命令。*
