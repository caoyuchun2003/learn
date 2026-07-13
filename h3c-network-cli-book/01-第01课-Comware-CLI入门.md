# 第 01 课 · Comware CLI 入门

> 视图、导航、save——一切命令的地基。
>
> **作者：曹宇春**

---

## 先记住这个类比

CLI 像 **进大楼改装修**：

| 视图 | 类比 | 能干什么 |
|------|------|----------|
| `<H3C>` 用户视图 | 在大厅 **只能看** 监控 | `display`、`ping` |
| `[H3C]` 系统视图 | 进了 **物业办公室** 能改图纸 | 改全局配置 |
| `[H3C-Gi1/0/1]` 接口视图 | 到了 **某一间房间** | 改这个口 |

**没 `system-view` 就改不了配置**——就像没进物业办公室。

---

## 登录方式

| 方式 | 场景 |
|------|------|
| Console | 新设备、SSH 配坏了、救急 |
| SSH | 日常（推荐） |
| Telnet | 老环境，不推荐 |

Console 参数常见：**9600 8N1**（以设备标签为准）。

---

## 视图导航

```text
<H3C> system-view          ← 进系统视图，简写 sys
[H3C] interface GigabitEthernet1/0/1
[H3C-GigabitEthernet1/0/1] quit    ← 回 [H3C]
[H3C] return               ← 直接回 <H3C>
```

| 命令 | 作用 |
|------|------|
| `system-view` / `sys` | 用户 → 系统 |
| `quit` | 退一层 |
| `return` | 回用户视图 |
| `?` | 当前可用命令 |
| `Tab` | 补全 |

---

## 四条铁律

```text
1. 查看用 display（dis），不是 show（那是思科）
2. 删除/关闭用 undo
3. 改完必须 save，否则重启丢配置
4. 改上联/核心前，确保 Console 可用
```

### save 示例

```text
[H3C] save
The current configuration will be written to the device.
Are you sure? [Y/N]: y
```

---

## 第一次上手（5 分钟实验）

```text
<H3C> display version
<H3C> system-view
[H3C] sysname Lab-SW01
[Lab-SW01] quit
<Lab-SW01> display current-configuration | include sysname
<Lab-SW01> system-view
[Lab-SW01] save
```

---

## 在你项目里什么时候用得上

- 新设备上架：Console → 改 sysname → 配管理 IP → 开 SSH → save  
- 远程改配置：SSH → sys → … → save  
- 别人问「配置在哪」：`display current-configuration`  

---

## 练习

1. 从 `<>` 进到接口视图再 `return` 回 `<>`，说每一步提示符变化。  
2. 改 sysname 后不 save 就 reboot，会怎样？  

---

## 小结

- `<>` 看，`[]` 改；`sys` 进入，`save` 持久化  
- `undo` = 反向操作；`?` = 帮助  

---

*下一课：三条巡检命令——上机先看什么。*
