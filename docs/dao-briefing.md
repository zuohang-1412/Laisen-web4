# DAO Briefing (Leadership Q&A)

## 1) 基于哪个链

- 当前默认链是 `Base Sepolia (84532)`。
- 可通过 `NEXT_PUBLIC_LAISEN_CHAIN_ID` 切换到受支持测试网。
- 建议汇报口径统一为：`当前演示固定 Base Sepolia`。

## 2) 链上合约如何实现

- `LaisenGovernanceToken`: `ERC20 + ERC20Permit + ERC20Votes`，部署时铸造总量并自委托激活投票权。
- `LaisenTimelock`: 治理执行延迟控制器。
- `LaisenGovernor`: 标准治理控制器，负责提案、投票、排队、执行。
- `LaisenRuntimeProtocol`: mandate 记录与执行合约，owner 为 `Timelock`，不再允许 EOA 直接 owner 执行。

## 3) 如何 DAO 发起提议

当前运行时点击 `Approve` / `Reject` 后自动走完整链路：

1. `Governor.propose` 创建提案（target 为 `LaisenRuntimeProtocol` 的执行 calldata）。
2. 等待进入 `Active` 后 `castVote`。
3. 达到通过条件后 `queue` 到 `Timelock`。
4. timelock 延迟到期后 `execute`。
5. UI 展示 proposal 与 execute 交易哈希作为证据。

## 4) Token 如何分配

- 总量由部署时铸造。
- 分配模型：`Treasury 42% / Contributor 23% / Community 35%`。
- Contributor/Community 地址来自：
  - `NEXT_PUBLIC_LAISEN_CONTRIBUTOR_ADDRESS`
  - `NEXT_PUBLIC_LAISEN_COMMUNITY_ADDRESS`
- 未配置时默认回落 treasury 地址，避免部署失败。

## 5) 如何运作（对外一句话）

`AI 形成 mandate -> DAO 在链上提案和投票 -> Timelock 执行 mandate -> Runtime 显示完整可审计证据。`

## 6) 演示脚本（3 分钟）

1. 打开 `/runtime`，连接钱包并切到 Base Sepolia。
2. 点击 `Deploy Protocol`，展示 token/governor/timelock/protocol 地址。
3. 点击 `Launch Runtime`，展示 founder -> signal -> decision。
4. 点击 `Approve`，等待治理链路完成。
5. 展示 proposal tx、vote/queue/execute 结果和最终 action tx。

## 7) 当前限制（如被追问）

- 目前是单钱包演示路径，投票行为由同一钱包完成，不是多地址协同治理。
- 生产级 DAO 仍需补充：多角色权限管理、提案索引服务、持久化审计与监控告警。

## 8) 多钱包真实投票模式（今天可启用）

把以下变量写进 `.env.local` 后重新 `pnpm dev`：

```bash
NEXT_PUBLIC_LAISEN_CONTRIBUTOR_ADDRESS=0x...
NEXT_PUBLIC_LAISEN_COMMUNITY_ADDRESS=0x...
NEXT_PUBLIC_LAISEN_DAO_QUORUM_PERCENT=51
NEXT_PUBLIC_LAISEN_DAO_VOTING_PERIOD_BLOCKS=20
NEXT_PUBLIC_LAISEN_DAO_AUTOMATION=false
```

解释：

- 设置 contributor/community 地址后，token 不再全在 treasury。
- 把 quorum 提到 51%，单钱包 42% 票权无法单独通过提案。
- 这样会强制进入多钱包协作投票，属于真实 DAO 治理而非单人 owner 执行。
