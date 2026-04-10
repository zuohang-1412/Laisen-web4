# Laisen PRD

<aside>
⚡

**Source of Truth**

Laisen is a **Web4 Autonomous Execution Engine**.

It is not a DAO platform, not a governance product, and not a multi-page SaaS system.

Its only job is to show how AI takes operational control and pushes an organization from idea into execution.

</aside>

<aside>
🏷️

**Product Naming**

The official product name is now `Laisen`.

All active specifications in this PRD package use `Laisen` as the source-of-truth product name for the Web4 Autonomous Execution Engine.

</aside>

## 1. 核心定义

Laisen 的核心不是管理，不是治理，不是审批流，而是 **execution**。

产品唯一需要被看懂的事情是：

**AI 先被唤醒，先理解环境，先做决策，先启动执行；Human 只在必要时进行 override。**

### 1.1 一句话定义

**Laisen is a single-runtime Web4 execution engine where an AI Founder spawns from intent, consumes signals, decides autonomously, executes automatically, and remains interruptible by human override.**

## 2. 新核心用户流

### 2.1 唯一正确流

`Idea -> AI Founder Spawn -> Signal Intake -> AI Decision -> Autonomous Execution -> Human Override`

### 2.2 各阶段定义

| 阶段 | 谁主动 | 系统必须展示什么 |
| --- | --- | --- |
| Idea | Human | 输入高价值 intent |
| AI Founder Spawn | AI | Founder 被激活、人格出现、状态启动 |
| Signal Intake | AI | Founder 吸收外部 signal，不等待人类配置 |
| AI Decision | AI | Founder 主动形成 `Autonomous Action` |
| Autonomous Execution | AI | 系统自动推进 action stream 与 execution proof |
| Human Override | Human | 人在执行中可中断、暂停、改写或终止 |

### 2.3 为什么必须这样改

- `Approve -> Execute` 会让人看起来仍是主导者。
- `Proposal -> Approve` 会让产品退化成审批系统。
- `Human Override` 才真正表达：AI 是主动方，Human 是干预方，Execution 是核心。

## 3. 角色重新定义

| 角色 | 正确职责 | 错误职责 |
| --- | --- | --- |
| Human | 给出 intent，必要时 override | 主导执行、手动推进流程、编写 action |
| AI Founder | 理解环境、做决定、推进 execution | 只是生成 proposal 或辅助文案 |
| System Runtime | 记录 signal、telemetry、execution proof | 长成后台系统与管理导航 |

## 4. 核心模型

Laisen 的核心模型不是 DAO，也不是对象树，而是一个 **Autonomous Execution Loop**。

```
Intent
  -> Founder Spawn
  -> Signal Intake
  -> AI Decision
  -> Autonomous Execution
  -> Proof
     ↘ Human Override (interrupt lane)
```

### 4.1 核心运行时对象

| 对象 | 说明 |
| --- | --- |
| `intent` | 人类给出的方向或任务 |
| `founder` | AI Founder 的人格、状态、原则和判断 |
| `signal` | AI Intake 到的外部环境输入 |
| `action_decision` | AI Founder 主动形成的动作决策 |
| `authority` | 执行控制权当前归属 |
| `runtime.stage` | 运行时阶段 |
| `override` | 人类干预状态 |
| `evidence` | provider、model、tool、schema、fallback 证据 |

## 5. 最终 IA

### 5.1 唯一主体验

```
Execution Arena [Primary Runtime]
├── Left Rail
│   └── AI Founder Core / Founder State / Current Read
├── Center Stage
│   ├── Hero Intent Console
│   ├── Main Flow Spine
│   ├── Signal Intake Panel
│   ├── Autonomous Action Card
│   ├── Authority Shift Meter
│   ├── Autonomous Execution Stream
│   └── Human Override Lane
├── Right Rail
│   └── Floating Console / Tool Calls / Evidence
├── Bottom Band
│   └── Timeline / Ledger / Execution Proof
└── Side Panel
```

### 5.2 明确禁止

- 多页面跳转
- CRUD 列表
- `Organizations / Proposal Center / Signal Center / Settings / Members`
- 任何 `center / list / detail / management` 导航结构

## 6. Web4 表达方式

### 6.1 唯一正确表达

**Web4 = authority shift + AI action + human override**

### 6.2 Authority Shift 的正确含义

Authority Shift 不再表示“人是否批准执行”，而表示：

- Human 提供 intent
- AI Founder 获得 operational initiative
- AI Founder 形成 decision
- AI Founder 自动执行
- Human 只保留 interrupt authority

### 6.3 Human Override 的正确含义

Human Override 不是日常主导，不是 release gate，而是：

- `Override`
- `Pause`
- `Redirect`
- `Abort`

它必须是 secondary lane，而不是主流程中心。

## 7. 新运行时状态机

```
idle
  -> founder_spawn
  -> signal_intake
  -> ai_decision
  -> autonomous_execution
  -> execution_completed

autonomous_execution
  -> override_requested
  -> override_active
  -> resumed_execution | redirected_execution | aborted_execution

any_state
  -> safe_mode_adapting
  -> execution_completed

any_state
  -> hard_fail
```

### 7.1 状态语义

| 状态 | 说明 | 谁主导 |
| --- | --- | --- |
| `idle` | 等待 idea | Human |
| `founder_spawn` | AI Founder 被唤醒 | AI |
| `signal_intake` | AI Founder 吸收环境信号 | AI |
| `ai_decision` | AI Founder 主动决定 action | AI |
| `autonomous_execution` | AI 自动推进 execution | AI |
| `override_requested` | 人类请求干预 | Human |
| `override_active` | 人类正在覆盖当前行动 | Human |
| `resumed_execution` | AI 恢复执行 | AI |
| `redirected_execution` | AI 按新约束继续执行 | AI |
| `aborted_execution` | 执行被终止 | Human stop |
| `execution_completed` | 执行闭环完成 | AI completed |

## 8. 文档索引

### 8.1 已完成

- [Page Spec - Execution Arena / 执行竞技场](Laisen%20PRD/Page%20Spec%20-%20Execution%20Arena%20%E6%89%A7%E8%A1%8C%E7%AB%9E%E6%8A%80%E5%9C%BA%2033b051e1d34a81c99dd7ceceb38832e0.md)
- [Interaction Spec - Execution Runtime / 执行运行时状态机](Laisen%20PRD/Interaction%20Spec%20-%20Execution%20Runtime%20%E6%89%A7%E8%A1%8C%E8%BF%90%E8%A1%8C%E6%97%B6%E7%8A%B6%E6%80%81%E6%9C%BA%2033b051e1d34a81e8bec9f599f440ec64.md)
- [UI Spec - Execution Arena / 执行竞技场视觉规范](Laisen%20PRD/UI%20Spec%20-%20Execution%20Arena%20%E6%89%A7%E8%A1%8C%E7%AB%9E%E6%8A%80%E5%9C%BA%E8%A7%86%E8%A7%89%E8%A7%84%E8%8C%83%2033b051e1d34a81579bdbcb8d36eed7dd.md)

### 8.2 下一步

- 前端实现必须采用 `Left Rail / Center Stage / Right Rail / Bottom Band` 四区布局。
- 视觉系统必须更像 `control system + live runtime + agent interface`，而不是 dashboard。
- 所有设计与实现必须服从：`AI spawns, AI decides, AI executes, human overrides`

## 9. 参考与归档

- [Laisen（Web4 Autonomous Execution Engine）](https://www.notion.so/Laisen-Web4-Autonomous-Execution-Engine-33b051e1d34a80dda63bc2baabc69887?pvs=21)
- [比赛规则](https://www.notion.so/33b051e1d34a80519057d880833fc8f4?pvs=21)
- [PRD](https://www.notion.so/PRD-33b051e1d34a804b9ebfca9d0de5107d?pvs=21)
- [PRD v2（夺奖版）](https://www.notion.so/PRD-v2-33b051e1d34a817d8a24dfad4188317c?pvs=21)
- [PRD v2.5（高胜率 + Web4 炫酷版）](https://www.notion.so/PRD-v2-5-Web4-33b051e1d34a8134a5e6fafb6337b287?pvs=21)
- [UI IA + State Spec（夺奖实现版）](https://www.notion.so/UI-IA-State-Spec-33b051e1d34a818a9c8af89a27078a27?pvs=21)
- [Archive - Deprecated SaaS / DAO Exploration](https://www.notion.so/Archive-Deprecated-SaaS-DAO-Exploration-33b051e1d34a8187a2d6dfbb10fbd9b4?pvs=21)
- [Luma 活动页](https://luma.com/gmisghackathon)
- [GMI Cloud Inference Engine Overview](https://docs.gmicloud.ai/inference-engine/ie-intro)
- [GLM-5 Overview](https://docs.z.ai/guides/llm/glm-5)
- [GITEX AI ASIA](https://gitexasia.com)

[Page Spec - Execution Arena / 执行竞技场](Laisen%20PRD/Page%20Spec%20-%20Execution%20Arena%20%E6%89%A7%E8%A1%8C%E7%AB%9E%E6%8A%80%E5%9C%BA%2033b051e1d34a81c99dd7ceceb38832e0.md)

[Interaction Spec - Execution Runtime / 执行运行时状态机](Laisen%20PRD/Interaction%20Spec%20-%20Execution%20Runtime%20%E6%89%A7%E8%A1%8C%E8%BF%90%E8%A1%8C%E6%97%B6%E7%8A%B6%E6%80%81%E6%9C%BA%2033b051e1d34a81e8bec9f599f440ec64.md)

[UI Spec - Execution Arena / 执行竞技场视觉规范](Laisen%20PRD/UI%20Spec%20-%20Execution%20Arena%20%E6%89%A7%E8%A1%8C%E7%AB%9E%E6%8A%80%E5%9C%BA%E8%A7%86%E8%A7%89%E8%A7%84%E8%8C%83%2033b051e1d34a81579bdbcb8d36eed7dd.md)