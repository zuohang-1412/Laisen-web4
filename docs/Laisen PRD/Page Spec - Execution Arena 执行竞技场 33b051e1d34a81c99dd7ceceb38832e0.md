# Page Spec - Execution Arena / 执行竞技场

<aside>
🎬

**Execution Arena Page Spec**

This page defines the only primary product surface for Laisen as a `Web4 Autonomous Execution Engine`.

It is designed around one rule: **AI acts first, human overrides only if needed.**

</aside>

## 1. 页面定位

| 字段 | 内容 |
| --- | --- |
| 页面中文名 | 执行竞技场 |
| 页面英文名 | Execution Arena |
| 页面类型 | Single Runtime Surface |
| 路由建议 | `/` |
| 产品阶段 | P0 Hackathon Core |
| 页面目标 | 在一个连续 runtime 中展示：Idea 如何唤醒 AI Founder，AI 如何 intake signal、主动决策、自动执行，以及人类如何作为 override 角色介入。 |
| 唯一核心流 | `Idea -> AI Founder Spawn -> Signal Intake -> AI Decision -> Autonomous Execution -> Human Override` |
| 唯一成功标准 | 观众无需跳页即可理解：AI 是主动方，Human 是干预方，Execution 是核心。 |

## 2. 体验原则

- 不做 dashboard。
- 不做 CRUD。
- 不做 release gate 主流程。
- 先让 AI Founder 出现，再让 AI 决策，再让 AI 执行。
- Human 只作为 override lane 存在。
- 页面上的任何模块都必须强化 `AI takes action`。

## 3. 布局系统

### 3.1 总体布局

| 区域 | 说明 | 可见性 |
| --- | --- | --- |
| Left Rail | AI Founder / State / Current Read / Authority origin | 始终可见 |
| Center Stage | Execution Flow、Autonomous Action、Authority Shift、Autonomous Execution 主舞台 | 始终可见 |
| Right Rail | Inference Console、Tool Calls、Schema、Fallback、Telemetry | 始终可见 |
| Bottom Band | Execution Timeline、Ledger、Proof of execution | 始终可见 |
| Side Panel | 补充说明和评委追问素材 | 默认折叠 |

### 3.2 栅格建议

- 1440px 基准宽度
- 主容器建议宽度 1360px
- 左右外边距 40px
- gutter 20px
- Left Rail 280px
- Center Stage 680px-760px
- Right Rail 320px
- Bottom Band 高度 220px-280px

### 3.3 默认视线动线

1. AI Founder Core
2. Main Flow Spine
3. Autonomous Action Card
4. Autonomous Execution Stream
5. Floating Console
6. Authority Shift Meter
7. Human Override Lane
8. Timeline / Ledger

### 3.4 结构原则

- 页面必须更像 `control system`，而不是 dashboard。
- 主舞台必须持续表现 runtime 正在推进。
- 所有主要区域都应服务于 `AI action in motion`。
- `Human Override` 只能作为 secondary interrupt lane 存在。

## 4. 模块结构

| 模块 | 优先级 | 作用 |
| --- | --- | --- |
| Hero Intent Console | P0 | 输入 idea，启动 runtime |
| AI Founder Core | P0 | 让 Founder 成为主行为体 |
| Main Flow Spine | P0 | 展示核心流推进 |
| Signal Intake Panel | P0 | 展示 AI intake 的外部环境信号 |
| Autonomous Action Card | P0 | 展示 AI 主动形成的动作决策 |
| Autonomous Execution Stream | P0 | 展示 AI 自动执行中的动作流 |
| Authority Shift Meter | P0 | 展示 authority 正在向 AI 迁移 |
| Human Override Lane | P0 | 展示人类可随时中断 / 改写 / 终止 |
| Timeline / Ledger | P0 | 展示执行证据 |
| Floating Console | P0 | 展示 provider / model / tool / schema / fallback |
| Side Panel | P1 | 补充解释 |

## 5. 模块级规格

### 5.1 Hero Intent Console

- 模块目标：启动 AI Founder，而不是启动一个表单流程。
- 显示逻辑：默认显示。
- 数据来源：本地输入、golden scenario config。
- 交互规则：支持自由输入和黄金案例。
- 模块状态：`idle`、`editing`、`submitting`。

关键字段：

- `intent_input`
- `golden_scenario_id`

### 5.2 AI Founder Core

- 模块目标：让 AI Founder 成为舞台主体。
- 显示逻辑：页面始终可见；runtime 激活后持续更新。
- 数据来源：`founder`。
- 交互规则：默认只读；可展开 Founder detail。
- 模块状态：`dormant`、`spawning`、`intaking`、`deciding`、`executing`、`adapting`、`completed`、`overridden`、`halted`。

必须展示：

- `founder.name`
- `founder.role`
- `founder.decision_principle`
- `founder.risk_posture`
- `founder.current_read`
- `founder.state`

### 5.3 Main Flow Spine

- 模块目标：把新核心用户流做成一条主轴。
- 显示逻辑：始终显示。
- 数据来源：`runtime.stage`。
- 交互规则：不可点击。
- 模块状态：`inactive`、`active`、`completed`、`override_marked`、`failed`。

阶段节点：

- `Idea`
- `AI Founder Spawn`
- `Signal Intake`
- `AI Decision`
- `Autonomous Execution`
- `Human Override`

### 5.4 Signal Intake Panel

- 模块目标：展示 AI Founder 正在 intake environment，而不是等待人类配置数据源。
- 显示逻辑：`signal_intake` 期间激活。
- 数据来源：`signal`。
- 交互规则：默认只读。
- 模块状态：`loading_live`、`live_ready`、`cached_ready`、`unavailable`。

### 5.5 Autonomous Action Card

- 模块目标：展示 AI Founder 已主动做出的 action decision。
- 显示逻辑：`ai_decision` 阶段高亮出现。
- 数据来源：`action_decision`。
- 交互规则：只读，不提供 human 编辑。
- 模块状态：`hidden`、`revealing`、`ready`、`executing_locked`、`overridden`。

必须展示：

- `action_decision.title`
- `action_decision.action`
- `action_decision.reason`
- `action_decision.expected_outcome`
- `action_decision.confidence`

### 5.6 Autonomous Execution Stream

- 模块目标：证明 AI 已经开始自动执行，而不是停在 decision。
- 显示逻辑：`autonomous_execution` 后自动写入。
- 数据来源：`execution.actions[]`。
- 交互规则：不可编辑；自动滚动。
- 模块状态：`idle`、`streaming`、`paused_by_override`、`redirected`、`completed`、`fallback_marked`。

### 5.7 Authority Shift Meter

- 模块目标：动态展示从 `human origin authority` 到 `AI operational authority` 的迁移。
- 显示逻辑：全程可见。
- 数据来源：`authority.state`。
- 交互规则：纯状态可视化。
- 模块状态：`human_origin`、`founder_spawned`、`ai_deciding`、`ai_executing`、`human_override_requested`、`human_override_active`、`ai_resumed`、`execution_complete`。

### 5.8 Human Override Lane

- 模块目标：明确人类只在必要时干预。
- 显示逻辑：始终可见但低权重；执行中高亮。
- 数据来源：`override`、`runtime.stage`。
- 交互规则：提供 `Override` 后展开动作集。
- 模块状态：`available`、`requested`、`active`、`released`、`aborted`。

Override 动作：

- `Pause`
- `Redirect`
- `Abort`
- `Resume AI`

### 5.9 Timeline / Ledger

- 模块目标：记录 execution proof。
- 显示逻辑：始终可见。
- 数据来源：`execution.events[]`。
- 交互规则：可滚动，不跳页。
- 模块状态：`empty`、`growing`、`override_flagged`、`completed`。

### 5.10 Floating Console

- 模块目标：展示 sponsor fit 和技术真实性。
- 显示逻辑：默认半展开。
- 数据来源：`evidence`、`runtime.telemetry`。
- 交互规则：展开 / 折叠。
- 模块状态：`collapsed`、`expanded`、`live`、`fallback`、`error`。

### 5.11 Side Panel

- 模块目标：承载补充说明，不抢主舞台。
- 显示逻辑：默认关闭。
- 数据来源：补充文案、评委追问素材。
- 交互规则：抽屉展开。
- 模块状态：`closed`、`open`。

## 6. 字段字典

| 字段中文名 | Key | 类型 | 必填 | 默认值 | 校验规则 | 可编辑 | 参与判断 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 执行意图 | `intent_input` | textarea | 是 | 空 | 20-280 chars | 是 | 是 |
| Founder 名称 | `founder.name` | string | 是 | 模型生成 | 非空 | 否 | 否 |
| Founder 状态 | `founder.state` | enum | 是 | `dormant` | 固定枚举 | 否 | 是 |
| Founder 当前判断 | `founder.current_read` | string | 是 | 模型生成 | 非空 | 否 | 否 |
| 信号来源 | `signal.source` | string | 是 | `cached` | 非空 | 否 | 是 |
| 信号洞察 | `signal.insight` | string | 是 | 模型或缓存生成 | 非空 | 否 | 是 |
| 自主动作标题 | `action_decision.title` | string | 是 | 模型生成 | 非空 | 否 | 是 |
| 自主动作内容 | `action_decision.action` | string | 是 | 模型生成 | 非空 | 否 | 是 |
| 动作决策原因 | `action_decision.reason` | string | 是 | 模型生成 | 非空 | 否 | 否 |
| Authority 状态 | `authority.state` | enum | 是 | `human_origin` | 固定枚举 | 否 | 是 |
| Override 状态 | `override.status` | enum | 是 | `none` | 固定枚举 | 否 | 是 |
| 运行时阶段 | `runtime.stage` | enum | 是 | `idle` | 固定枚举 | 否 | 是 |
| Provider | `evidence.provider` | string | 是 | `GMI Cloud` | 非空 | 否 | 是 |
| Model | `evidence.model` | string | 是 | `GLM` | 非空 | 否 | 是 |
| Fallback 模式 | `evidence.fallback_mode` | enum | 是 | `none` | 固定枚举 | 否 | 是 |

## 7. 按钮与交互控件

| 按钮 | 类型 | 触发条件 | 点击行为 | 成功反馈 | 失败反馈 |
| --- | --- | --- | --- | --- | --- |
| `Start Runtime` | Primary | idea 有效 | 启动 founder spawn | 进入 spawn state | 输入框报错 |
| `Use Scenario` | Secondary | 点击案例 | 填充 idea 并可立即启动 | 表单填充 | 无 |
| `Override` | Danger | `autonomous_execution` 中 | 进入 override lane | authority 标记 override | toast error |
| `Pause` | Secondary | override active | 暂停 execution stream | stream paused | toast error |
| `Redirect` | Secondary | override active | 写入 redirect constraint | 进入 redirected execution | toast error |
| `Abort` | Danger | override active | 终止 execution | aborted state | toast error |
| `Resume AI` | Primary | override active | 释放 override，恢复 AI execution | resumed execution | toast error |
| `Open Console` | Tertiary | 任意时刻 | 展开 Floating Console | console expanded | 无 |

## 8. 页面状态

| 状态 | 页面表现 |
| --- | --- |
| 默认态 | 等待 idea，Founder dormant |
| Spawn 态 | Founder 出现，authority 开始偏向 AI |
| Signal Intake 态 | Signal panel loading，Founder intaking |
| AI Decision 态 | Action card reveal，Founder deciding |
| Autonomous Execution 态 | Action stream 自动推进，ledger 增长 |
| Human Override 态 | override lane 高亮，stream pause / redirect / abort |
| 成功态 | execution completed，proof complete |
| fallback 态 | console 标记 safe mode，但 runtime 不中断 |
| hard fail 态 | 静态 proof backup + error banner |

## 9. 主交互流程

1. Human 输入 `idea`。
2. 系统自动 `spawn AI Founder`。
3. Founder 自动执行 `signal intake`。
4. Founder 自动形成 `Autonomous Action`。
5. 系统自动进入 `Autonomous Execution`。
6. Execution Stream 与 Timeline 自动推进。
7. Human 如有必要，进入 `Human Override Lane`。
8. 系统进入 `resume / redirect / abort` 其中之一。

## 10. UI 设计要求

- UI 必须表现为 `control system + live runtime + agent interface`。
- 页面绝不能看起来像 admin panel、dashboard、settings screen 或 CRUD 系统。
- Left Rail 的 `AI Founder Core` 必须像正在运行的 agent core，而不是 profile card。
- Center Stage 的 `Autonomous Execution` 必须是全页最强动态区域。
- Right Rail 的 `Floating Console` 必须默认露出关键 tool call 和 inference evidence，而不是藏在设置里。
- Bottom Band 的 `Timeline / Ledger` 必须像 mission log，而不是 activity table。
- `Authority Shift Meter` 必须自动变化，不依赖人工批准动作。
- `Human Override Lane` 必须存在，但只能作为 secondary interrupt lane。

## 11. 研发实现建议

### 11.1 推荐组件

- `ExecutionArenaPage`
- `HeroIntentConsole`
- `AIFounderCore`
- `FlowSpine`
- `SignalIntakePanel`
- `AutonomousActionCard`
- `AutonomousExecutionStream`
- `AuthorityShiftMeter`
- `HumanOverrideLane`
- `ExecutionLedger`
- `FloatingInferenceConsole`
- `ArenaSidePanel`

### 11.2 顶层状态

```tsx
idle | founder_spawn | signal_intake | ai_decision | autonomous_execution | override_requested | override_active | resumed_execution | redirected_execution | aborted_execution | execution_completed | safe_mode_adapting | hard_fail
```

### 11.3 API 建议

- `/api/runtime/start`
- `/api/runtime/signal`
- `/api/runtime/decision`
- `/api/runtime/execute`
- `/api/runtime/override`
- `/api/runtime/telemetry`

## 12. 验收标准

- 观众必须能看出 AI 是主动方。
- 观众必须能看出 Human 是干预方。
- `AI Decision` 后 execution 必须自动开始。
- `Human Override` 必须是 interrupt lane，而不是前置 gate。
- `AI Founder` 必须始终是画面主体。
- `Execution` 必须是页面中最强的视觉与交互重心。

## 13. 与其他文档关系

- 本页与 [Interaction Spec - Execution Runtime / 执行运行时状态机](Interaction%20Spec%20-%20Execution%20Runtime%20%E6%89%A7%E8%A1%8C%E8%BF%90%E8%A1%8C%E6%97%B6%E7%8A%B6%E6%80%81%E6%9C%BA%2033b051e1d34a81e8bec9f599f440ec64.md) 配套。
- 本页的视觉约束由 [UI Spec - Execution Arena / 执行竞技场视觉规范](UI%20Spec%20-%20Execution%20Arena%20%E6%89%A7%E8%A1%8C%E7%AB%9E%E6%8A%80%E5%9C%BA%E8%A7%86%E8%A7%89%E8%A7%84%E8%8C%83%2033b051e1d34a81579bdbcb8d36eed7dd.md) 定义。
- 本页替代旧多页面 `Page Spec` 体系。
- 旧文档已归档至：[Archive - Deprecated SaaS / DAO Exploration](https://www.notion.so/Archive-Deprecated-SaaS-DAO-Exploration-33b051e1d34a8187a2d6dfbb10fbd9b4?pvs=21)