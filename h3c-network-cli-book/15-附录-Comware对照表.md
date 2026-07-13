# 附录 C · Comware / 思科 / 华为对照

> 从思科或华为转华三时防混。
>
> **作者：曹宇春**

---

| 功能 | 华三 Comware | 思科 IOS | 华为 VRP |
|------|--------------|----------|----------|
| 查看 | `display` / `dis` | `show` | `display` |
| 进配置 | `system-view` | `configure terminal` | `system-view` |
| 删除 | `undo` | `no` | `undo` |
| 保存 | `save` | `write memory` / `copy run start` | `save` |
| 接口 | `interface Gi1/0/1` | `interface Gi1/0/1` | `interface Gi1/0/1` |
| 静态路由 | `ip route-static` | `ip route` | `ip route-static` |
| VLAN | `vlan 10` | `vlan 10` | `vlan 10` |
| Trunk | `port link-type trunk` | `switchport mode trunk` | `port link-type trunk` |
| Access | `port link-type access` | `switchport mode access` | `port link-type access` |
| 三层 SVI | `Vlan-interface 10` | `interface Vlan10` | `Vlanif10` |
| NAT 出网 | `nat outbound acl` | `ip nat inside/outside` | `nat outbound` |

---

## 提示符

| 厂商 | 用户视图 | 系统视图 |
|------|----------|----------|
| 华三 | `<H3C>` | `[H3C]` |
| 思科 | `Router>` | `Router(config)#` |
| 华为 | `<Huawei>` | `[Huawei]` |

---

*© 曹宇春*
