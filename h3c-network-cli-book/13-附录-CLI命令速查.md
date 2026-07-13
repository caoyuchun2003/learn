# 附录 A · CLI 命令速查总表

> 一页纸导航；细节见第 04–07 课。
>
> **作者：曹宇春**

---

## 导航

| 命令 | 作用 |
|------|------|
| `system-view` / `sys` | 进配置 |
| `quit` / `return` | 退出 |
| `save` | 保存 |
| `undo xxx` | 撤销 |

---

## display 精选

| 命令 | 作用 |
|------|------|
| `dis version` | 版本 |
| `dis int b` | 接口摘要 |
| `dis ip int b` | 接口 IP |
| `dis ip routing-table` | 路由表 |
| `dis cur` | 配置 |
| `dis vlan` | VLAN |
| `dis mac-address` | MAC |
| `dis arp` | ARP |
| `dis acl all` | ACL |
| `dis nat outbound` | NAT |
| `dis ike sa` / `dis ipsec sa` | VPN |
| `dis wlan ap all` | AP |
| `dis ospf peer` | OSPF |
| `dis irf` | 堆叠 |

---

## 二层

| 命令 | 作用 |
|------|------|
| `vlan 10` | 建 VLAN |
| `port link-type access` | 接入 |
| `port access vlan 10` | 划 VLAN |
| `port link-type trunk` |  trunk |
| `port trunk permit vlan 10 20` | 放行 VLAN |
| `interface Vlan-interface 10` | 三层网关 |
| `poe enable` | 供电 |
| `port link-mode route` | 路由口 |

---

## 三层 / MSR

| 命令 | 作用 |
|------|------|
| `ip address x.x.x.x y.y.y.y` | 配 IP |
| `ip route-static 0.0.0.0 0 nh` | 默认路由 |
| `acl basic 2000` | 基本 ACL |
| `nat outbound 2000` | NAT |
| `ospf 1 router-id x.x.x.x` | OSPF |

---

## 诊断

| 命令 | 作用 |
|------|------|
| `ping x.x.x.x` | 连通 |
| `ping -a src dst` | 指定源 |
| `tracert x.x.x.x` | 路径 |
| `reboot` | 重启（慎用） |

---

*© 曹宇春*
