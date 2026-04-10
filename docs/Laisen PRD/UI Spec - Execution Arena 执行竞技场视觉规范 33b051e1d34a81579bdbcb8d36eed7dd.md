# UI Spec - Execution Arena / 执行竞技场视觉规范

<aside>
🎛️

**Execution Arena UI / Visual Spec**

This document defines the visual system for Laisen as a **control system**, a **live runtime**, and an **agent operation interface**.

It must never look like an admin panel, dashboard, CRUD surface, or management console.

</aside>

## 1. 视觉定位

| 维度 | 定义 |
| --- | --- |
| 产品气质 | Autonomous Control System |
| 体验感受 | 实时执行、状态推进、AI 主导、Human interrupt only |
| 界面类型 | Runtime surface，而不是 dashboard |
| 核心视觉目标 | 让观众第一眼看出：AI Founder 已经接管执行并正在行动 |

## 2. 明确禁止的视觉方向

- 经典 SaaS admin panel 布局。
- 左侧菜单加顶部统计卡的 dashboard 语义。
- 以表格、列表、设置表单为主的 CRUD 画面。
- 低动态、静态卡片堆砌式后台风格。
- 以按钮为主导的人工操作中心。

## 3. 唯一正确页面结构

```
Execution Arena
├── Left Rail: AI Founder / State
├── Center Stage: Execution Flow
├── Right Rail: Inference Console / Tool Calls
└── Bottom Band: Execution Timeline
```

### 3.1 空间分区定义

| 区域 | 视觉权重 | 职责 |
| --- | --- | --- |
| Left Rail | 高 | 承载 AI Founder 的人格、状态、当前判断 |
| Center Stage | 最高 | 承载 Execution Flow、Autonomous Action、Authority Shift、Execution Stream |
| Right Rail | 中高 | 承载 provider、model、tool call、schema、fallback、telemetry |
| Bottom Band | 中 | 承载执行时间线、事件 ledger、proof of execution |

### 3.2 栅格建议

- Desktop base width: `1440px`
- Main content width: `1360px`
- Outer margin: `40px`
- Gutter: `20px`
- Vertical rhythm: `20px`
- Left Rail: `280px`
- Center Stage: `1fr`，建议 `680px-760px`
- Right Rail: `320px`
- Bottom Band height: `220px-280px`

### 3.3 默认视线动线

1. `AI Founder` 被看见。
2. `Execution Flow` 被理解。
3. `Autonomous Execution` 被感知为正在发生。
4. `Inference Console` 证明 sponsor fit。
5. `Execution Timeline` 补足 proof。

## 4. 区域级视觉说明

### 4.1 Left Rail: AI Founder / State

- 必须像一个正在运行的 agent core，而不是 profile card。
- `Founder Name`、`Role`、`Current Read`、`State` 必须持续变化。
- 状态变化时需要 pulse、scan、glow、phase shift 等动态反馈。
- 该区必须让人感到“这是主体，不是助手”。

推荐包含：

- Founder portrait glyph 或 abstract emblem
- State chip
- Current read stream
- Decision principle
- Risk posture

### 4.2 Center Stage: Execution Flow

- 必须是全页最强视觉区域。
- Flow 不是静态步骤条，而是 live progression spine。
- `AI Decision` 应作为中心高亮事件出现。
- `Autonomous Execution Stream` 必须自动推进，持续产生 move。
- `Authority Shift` 应嵌入主舞台，而非角落标签。

推荐层次：

1. Flow Spine
2. Autonomous Action reveal
3. Execution Stream
4. Authority Shift overlay
5. Human Override indicator

### 4.3 Right Rail: Inference Console / Tool Calls

- 必须像 live system console，而不是 settings panel。
- 默认可见关键 telemetry，不要求用户点击才看见 sponsor evidence。
- Tool call 状态应以 streaming log 或 step chips 呈现。
- Fallback 应以 clearly marked runtime adaptation 呈现。

必须可见：

- `Provider`
- `Model`
- `Tool Call`
- `Schema`
- `Fallback`
- `Latency` 或 `Runtime status`

### 4.4 Bottom Band: Execution Timeline

- 必须像 mission log，而不是 activity table。
- 事件按时间推进自动写入。
- 重要事件需要状态色和阶段标记。
- Override 事件必须被高亮为 interruption event。

推荐事件：

- `Founder Spawned`
- `Signal Linked`
- `Decision Formed`
- `Execution Started`
- `Override Requested`
- `Execution Resumed`
- `Execution Completed`

## 5. 动态系统

### 5.1 动态原则

- 所有关键变化都必须是 visible transition，不允许瞬时静态替换。
- Motion 要服务于状态推进，不做装饰性漂浮动画。
- 动效优先表达：spawn、scan、decide、execute、interrupt、resume。

### 5.2 关键动效映射

| 事件 | 动效建议 |
| --- | --- |
| Founder Spawn | 中心向外扩散的 activation pulse + emblem reveal |
| Signal Intake | 左到中的 scanning sweep + link traces |
| AI Decision | 中心卡片 lift + bright edge reveal |
| Autonomous Execution | 纵向 stream auto-advance + progressive check marks |
| Authority Shift | control meter 从 human 侧平滑推向 AI 侧 |
| Human Override | red interruption notch + stream pause ripple |
| Resume AI | meter 回流 + execution stream restart glow |

### 5.3 动效时长

- Micro pulse: `160-220ms`
- Stage transition: `320-480ms`
- Stream progression: continuous with `1.2-2.0s` interval
- Override interruption: `180-260ms`

## 6. 视觉层级

### 6.1 层级顺序

1. `AI Founder Core`
2. `Execution Flow Spine`
3. `Autonomous Action`
4. `Autonomous Execution Stream`
5. `Inference Console`
6. `Execution Timeline`
7. `Human Override Controls`

### 6.2 字体层级

| 用途 | 建议尺寸 | 字重 |
| --- | --- | --- |
| Hero / Stage title | 36-44 | Semibold |
| Founder name | 28-32 | Semibold |
| Stage node label | 14-16 | Medium |
| Console label | 12-13 | Medium |
| Telemetry / code line | 12-13 | Regular mono |

## 7. 颜色系统

### 7.1 颜色角色

| 角色 | 建议 | 用途 |
| --- | --- | --- |
| Base surface | near-black / graphite | 形成控制系统氛围 |
| AI active | electric cyan / neon teal | Founder、AI execution、authority gain |
| Decision accent | amber / warm gold | AI Decision reveal |
| Override alert | alert red | interrupt、abort、manual takeover |
| Fallback safe mode | violet-gray or muted blue | 降级但仍在运行 |
| Neutral text | soft white / cool gray | 正文、说明、secondary info |

### 7.2 颜色规则

- AI gain authority 时，冷色增强、亮度提高。
- Human override 时，红色只作用于 interruption lane，不污染全屏。
- 不使用企业后台常见的蓝白灰配色。

## 8. 卡片与容器样式

- Founder、Action、Console 不使用通用后台白卡。
- 容器应采用深色半透明面板、边缘发光、内阴影、细边框。
- Corner radius: `18-24px`
- Border: `1px solid rgba(255,255,255,0.08-0.14)`
- Shadow: 深层投影 + 局部 glow，而不是传统产品卡片投影。
- 分隔方式优先用光带、节奏线、状态轨迹，不优先用表格线。

## 9. 控件样式

### 9.1 按钮

- `Start Runtime` 应是 stage CTA，尺寸大、光感强。
- `Override` 系列是次级但明显可达。
- 控件高度建议：`44 / 48 / 56` 三档。
- 图标应偏系统控制语义，如 pulse、route、halt、resume。

### 9.2 输入区

- 输入区更像 mission input console，不像表单。
- 文本域应支持大字号、低干扰、明确 placeholder。
- Golden scenarios 以 command chip 呈现，不用普通 tag list。

## 10. Human Override 的视觉定位

- 必须可见，但不能成为主舞台。
- 默认处于压低亮度的 secondary lane。
- 仅在 override 时强化红色和 interrupt motion。
- 视觉上必须体现：这是紧急干预，不是正常操作中心。

## 11. 大屏 Demo 建议

- 优先 16:9 投屏优化，保证 3 米外可读。
- 中央视觉区只保留 1 个核心 action card，不并列多卡。
- Timeline 不显示过多文字，每行控制在短句。
- Console 默认露出 `Provider / Model / Tool Call / Schema / Fallback` 五项核心证据。
- Founder state 与 runtime stage 必须永远处于首屏可见。

## 12. 前端实现建议

- 将布局拆为 `LeftRail / CenterStage / RightRail / BottomBand` 四个稳定容器。
- 动态状态建议以全局 runtime store 驱动，所有视觉变化订阅同一 source of truth。
- 动效用 CSS variables 或 motion tokens 统一管理，避免组件各自动。
- Console 和 Timeline 必须支持 mock stream 与 real stream 双模式。
- 所有 sponsor evidence 模块必须支持 live / cached / fallback 三态视觉。

## 13. 验收标准

- 首屏 3 秒内不能被误读成 admin panel 或 SaaS dashboard。
- 不点击任何二级控件时，也能看出 AI 正在运行。
- 左侧 Founder、中央 Execution、右侧 Console、底部 Timeline 的四区结构必须稳定成立。
- 任何阶段切换都必须有可感知的状态推进。
- Human Override 必须可见但不抢主叙事。
- 整个页面必须传达：**AI is operating the system in real time.**