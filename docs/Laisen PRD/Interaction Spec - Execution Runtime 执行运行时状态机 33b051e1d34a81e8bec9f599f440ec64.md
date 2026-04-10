# Interaction Spec - Execution Runtime / 执行运行时状态机

<aside>
🧠

**Execution Runtime Interaction Spec**

This document defines the runtime behavior for Laisen under the new Web4 model:

**AI spawns, AI decides, AI executes, human overrides.**

</aside>

## 1. 新核心用户流

`Idea -> AI Founder Spawn -> Signal Intake -> AI Decision -> Autonomous Execution -> Human Override`

### 1.1 流程原则

- AI 是主动方。
- Human 是干预方。
- Execution 是核心，不再由 approve 驱动，不再以 proposal 为中心。

## 2. AI Founder 行为模型

### 2.1 定义

AI Founder 是产品的 primary actor。

它不是 assistant，不是 explainer，不是 proposal writer。

它是被意图唤醒后，主动读取环境、主动做决定、主动推进 execution 的 autonomous operator。

### 2.2 Founder 人格层

| 维度 | 说明 | UI 表达 |
| --- | --- | --- |
| Name | Founder 的人格名称 | Founder name |
| Role | 例如 `AI Founder` / `Autonomous Operator` | Role badge |
| Decision Principle | 它如何判断下一步动作 | Microcopy |
| Risk Posture | 保守 / 平衡 / 激进 | Risk chip |
| Execution Style | 它如何推进 action | Mode chip |
| Current Read | 当前对环境的理解 | Founder current read |

### 2.3 Founder 状态机

| Founder State | 说明 | UI 表现 |
| --- | --- | --- |
| `dormant` | 尚未被 idea 激活 | 低亮静止 |
| `spawning` | 由 idea 唤醒，开始形成主体 | spawn 动画 |
| `intaking` | 吸收 signal 与上下文 | 扫描 / linking |
| `deciding` | 主动形成 action decision | decision pulse |
| `executing` | 自动推进 action | 强动态高亮 |
| `adapting` | 因 fallback 或 override 调整 execution | adaptive state |
| `completed` | 执行闭环完成 | stable completion |
| `overridden` | 当前执行被人类接管或改写 | override marker |
| `halted` | 执行被终止 | halted state |

## 3. 决策触发机制

### 3.1 正确机制

1. Human 提供 `idea`。
2. 系统自动 `spawn AI Founder`。
3. AI Founder 自动进行 `signal intake`。
4. AI Founder 自动产生 `action decision`。
5. AI Founder 自动开始 `autonomous execution`。
6. Human 仅在需要时通过 `override` 介入。

### 3.2 Trigger 条件

| Trigger | 条件 | 结果 |
| --- | --- | --- |
| `idea_valid` | intent 满足最小清晰度 | Founder 进入 `spawning` |
| `founder_ready` | Founder spawn 完成 | 自动开始 `signal_intake` |
| `signal_ready` | live 或 cached signal 可用 | Founder 进入 `deciding` |
| `decision_confident` | action confidence 过阈值 | 自动进入 `autonomous_execution` |
| `override_requested` | human 点击 override | 进入 override lane |

### 3.3 主术语

旧术语 `proposal` 应退出运行时核心语义。

统一改用：

- `Autonomous Action`
- `AI Decision`
- `Execution Move`

推荐主术语：`Autonomous Action`

## 4. Authority Shift 模型

### 4.1 正确含义

Authority Shift 不再是 `human approve -> AI execute`。

它应被定义为：

- Human 持有 origin authority：给出目标
- AI Founder 获得 operational authority：解读、决策、执行
- Human 保留 override authority：打断、改写、终止

### 4.2 Authority State

| Authority State | 含义 | 视觉表现 |
| --- | --- | --- |
| `human_origin` | 人类只提供 idea | 起点在人类侧 |
| `founder_spawned` | AI Founder 获得初始 operational control | authority meter 开始偏向 AI |
| `ai_deciding` | AI 拥有 decision initiative | meter 向 AI 推进 |
| `ai_executing` | AI 拥有 primary execution control | meter 锚定 AI 侧并脉冲 |
| `human_override_requested` | 人类请求干预 | meter 出现 override notch |
| `human_override_active` | 人类正在临时打断或改写执行 | meter 暂时回弹 |
| `ai_resumed` | AI 重新接手执行 | meter 回到 AI 主导 |
| `execution_complete` | AI 完成执行 | meter 稳定完成态 |

## 5. 执行状态机

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
  -> resumed_execution
  -> execution_completed

autonomous_execution
  -> override_requested
  -> redirected_execution
  -> execution_completed

autonomous_execution
  -> override_requested
  -> aborted_execution

any_state
  -> safe_mode_adapting
  -> autonomous_execution | execution_completed

any_state
  -> hard_fail
```

### 5.1 状态定义

| Runtime State | 说明 | 谁主导 |
| --- | --- | --- |
| `idle` | 等待 idea | Human |
| `founder_spawn` | AI Founder 被生成并激活 | AI |
| `signal_intake` | AI Founder 吸收外部 signal | AI |
| `ai_decision` | AI Founder 主动决定 action | AI |
| `autonomous_execution` | AI 自动推进 execution | AI |
| `override_requested` | human 请求介入 | Human |
| `override_active` | human 正在覆盖当前动作 | Human |
| `resumed_execution` | AI 恢复自动执行 | AI |
| `redirected_execution` | AI 按新的 override 约束继续执行 | AI |
| `aborted_execution` | 执行被终止 | Human stop |
| `execution_completed` | 执行闭环完成 | AI completed |
| `safe_mode_adapting` | 主链路降级但继续运行 | AI |
| `hard_fail` | 主链路与 fallback 同时失败 | System fail |

### 5.2 自动推进规则

- `AI Decision` 完成后，系统必须自动进入 `Autonomous Execution`。
- 不允许再出现 `Approve -> Execute` 的 gating 主链路。
- `Human Override` 是中断支路，不是执行前门槛。
- `Autonomous Execution` 中 Action Stream 和 Ledger 必须自动推进，不依赖额外点击。

## 6. Human Override 机制

### 6.1 正确语义

Human Override 不是日常操作，不是 orchestration，不是 manager mode。

它只是一个 interrupt lane。

### 6.2 Override 允许动作

| 动作 | 说明 | 结果 |
| --- | --- | --- |
| `Pause` | 暂停当前执行 | 进入 `override_active` |
| `Redirect` | 改写执行方向 | 进入 `redirected_execution` |
| `Abort` | 终止执行 | 进入 `aborted_execution` |
| `Resume AI` | 释放 override，恢复 AI 主导 | 进入 `resumed_execution` |

### 6.3 UI 要求

- `Human Override` 必须视觉上弱于 `AI Founder Core` 和 `Autonomous Execution`。
- Override controls 默认可见但低权重，或收纳在 secondary lane。
- 主舞台必须始终让观众感到：AI 在行动，人只在必要时介入。

## 7. Execution Arena 的强制改写要求

- 将 `Release Gate` 替换为 `Human Override Lane`。
- 删除任何让 human 看起来像必须先批准才能执行的主叙事。
- 将 `Autonomous Action Card` 定义为 AI 主动决策产物。
- 将 `Action Stream` 定义为自动推进，不接受手动逐步触发。
- 将 `AI Founder Core` 提升为首屏高权重主体。

## 8. 数据模型

```json
{
  "founder": {
    "name": "string",
    "role": "AI Founder",
    "decision_principle": "string",
    "risk_posture": "balanced",
    "execution_mode": "scan-decide-execute-adapt",
    "current_read": "string",
    "state": "dormant | spawning | intaking | deciding | executing | adapting | completed | overridden | halted"
  },
  "authority": {
    "state": "human_origin | founder_spawned | ai_deciding | ai_executing | human_override_requested | human_override_active | ai_resumed | execution_complete"
  },
  "action_decision": {
    "title": "string",
    "action": "string",
    "reason": "string",
    "expected_outcome": "string",
    "confidence": 0
  },
  "override": {
    "status": "none | requested | active | released | aborted",
    "mode": "pause | redirect | abort | none"
  },
  "runtime": {
    "stage": "idle | founder_spawn | signal_intake | ai_decision | autonomous_execution | override_requested | override_active | resumed_execution | redirected_execution | aborted_execution | execution_completed | safe_mode_adapting | hard_fail"
  }
}
```

## 9. 验收标准

- 观众必须能看出 AI Founder 是主动方。
- 观众必须能看出 Human 是干预方，而不是主导方。
- `AI Decision` 后系统必须自动进入 `Autonomous Execution`。
- `Human Override` 必须是中断支路，不是前置门槛。
- 整个 runtime 必须体现：`AI acts first, human interrupts only if needed.`