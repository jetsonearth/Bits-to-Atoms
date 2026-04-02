## 行为树 - 机器人的“任务调度大脑”

不知道你有没有玩过《巫师 3》？现在把你带入游戏里面的一个 NPC，就说一个村民吧。太阳出来了，他走到田里干活；中午了，回家吃饭；看到怪物，尖叫着逃跑；跑到安全地带后，蹲下来瑟瑟发抖等怪物走远；怪物走了，站起来继续干活。他的行为看起来好像有“智能”，但实际上背后是一棵精心设计的**行为树（Behavior Tree）** - 每一个 tick（时钟周期）从树根往下走，根据当前条件走不同的分支，执行对应的动作。

机器人面对的问题和游戏 NPC 几乎一样：它有一堆能力模块 - SLAM 管建图、Nav2 管走路、MoveIt 管手臂、感知管眼睛 - 但谁来当那个“指挥官”？谁来决定“现在该干什么、下一步干什么、出了问题怎么办”？

上一章我们让机器人“看见”了世界。但“看见”只是信息输入，它需要一个任务调度层把感知结果转化为行动序列：先看到目标物体，然后导航过去，然后伸手抓取，然后送到目的地。这个调度层就是行为树。

---

## 为什么不用 if-else？为什么不用状态机？

一个很自然的反应是：这不就是写一堆 if-else 吗？

```python
if battery_low():
    go_charge()
elif see_target():
    navigate_to(target)
    if arrived():
        pick_up(target)
        if pick_success():
            navigate_to(destination)
            place(target)
        else:
            retry_pick()
    else:
        handle_nav_failure()
else:
    patrol()
```

看起来能用。但你再加几个条件试试：如果导航中途突然发现障碍物绕不过去呢？如果抓取失败后要换一个角度重试呢？如果重试三次还不行要上报呢？如果执行中途电量突然变低呢？如果有人临时发了一个更高优先级的任务呢？

三层嵌套就是意大利面。五层嵌套就是噩梦。十层嵌套 - 没有人能读懂这段代码，包括三个月后的你自己。

那状态机（Finite State Machine, FSM）呢？状态机是经典的解决方案：定义一组状态（巡逻、导航、抓取、充电、异常），再定义状态之间的转换条件。这比 if-else 好多了，至少结构清晰。

问题是：状态一多，转换关系就爆炸。5 个状态，理论上最多 20 条转换边。10 个状态就是 90 条。更要命的是，每加一个新状态，你要重新审视它和所有已有状态之间的关系 - “从这个新状态能不能跳到充电？能不能跳到异常？”。一个复杂的机器人任务可以轻松有 20+ 个状态，状态机在这个规模下变得极难维护。

行为树的核心优势就三个字：**模块化**。

<figure>
  <img src="/images/ch13/groot2_editor.png" alt="Groot2 行为树可视化编辑器" />
  <figcaption>Groot2 行为树编辑器 — 可视化地拖拽组装行为节点，比手写 XML 直观得多。Nav2 的导航行为树就是用它来设计和调试的。图源：BehaviorTree.CPP</figcaption>
</figure>

你可以像拼乐高一样组装行为。“导航到目标点”是一块积木，“抓取物体”是另一块积木，“检查电量”又是一块。它们可以独立开发、独立测试、自由组合。要加一个新行为？插一个新节点，不用碰现有逻辑。要删一个行为？拔掉那个节点，其他部分不受影响。

而且行为树天然支持层次化 - 一棵大树可以包含子树，子树可以被多棵大树复用。“导航到某点”这个子树写一次，在“拣货”任务里用、在“巡逻”任务里用、在“回充电桩”任务里用。

---

## 核心节点类型：行为树的基本语法

行为树只有几种节点类型，但它们的组合能力极强。

### 控制节点：Sequence 和 Fallback

**Sequence（序列节点，符号 →）** 是“AND”逻辑。它从左到右依次执行子节点，全部成功才返回成功，任何一个失败就立刻返回失败。

类比：你的早晨 routine - 起床 → 刷牙 → 吃早饭 → 出门。每一步都要完成才算“早晨准备好了”。如果刷牙时发现没牙膏了（失败），后面的步骤就不执行了，整个 sequence 失败。

```
→ Sequence
  ├── NavigateToShelf   (导航到货架)
  ├── DetectObject      (检测目标物体)
  ├── PickUpObject      (抓取)
  └── NavigateToStation  (送到工作台)
```

**Fallback（回退节点，也叫 Selector，符号 ?）** 是“OR”逻辑。它从左到右依次尝试子节点，一个成功就返回成功，全部失败才返回失败。

类比：你想买咖啡 - 先去星巴克 → 关门了 → 去 Costa → 也关门了 → 去便利店买速溶。只要有一个成功就行。

```
? Fallback
  ├── PickWithLeftGripper   (左手抓)
  ├── PickWithRightGripper  (右手抓)
  └── ReportFailure          (都抓不了，上报)
```

这两种节点组合起来就已经非常强大了。Sequence 处理正常流程，Fallback 处理异常和备选方案。

### Decorator：给节点加“修饰器”

**Decorator（装饰节点）** 只有一个子节点，对子节点的行为做修改。常用的几个：

- **Retry(N)** - 子节点失败时重试 N 次。抓取失败？重试 3 次再放弃。
- **Timeout(T)** - 子节点如果 T 秒内没完成就强制返回失败。导航超过 60 秒还没到？可能卡住了。
- **Inverter** - 把成功变失败、失败变成功。逻辑取反。
- **ForceSuccess** - 无论子节点结果如何都返回成功。适合“这步失败了也无所谓，继续往下走”的场景。

### 叶节点：Action 和 Condition

**Action（动作节点）** 是真正干活的节点。它不再包含子节点，而是直接调用底层能力 - 发送一个 Nav2 导航目标、调用一次 MoveIt 抓取规划、触发一次感知检测。在 ROS 2 生态里，action 节点通常对接 ROS 2 的 Action Server，所以它天然支持异步执行和进度反馈。

**Condition（条件节点）** 是检查当前状态的节点。“电量是否大于 20%？” “目标物体是否被检测到？” “是否到达目标位置？” 它只返回成功或失败，不执行任何动作。

---

## 实战案例：一棵完整的拣货行为树

光讲节点类型太抽象。来看一个真实场景 - 仓库机器人要从货架上拣一件商品送到打包台：

```
→ Root Sequence
  │
  ├── ? [电量检查 Fallback]
  │     ├── Condition: battery > 20%
  │     └── → [去充电 Sequence]
  │           ├── Action: NavigateToCharger
  │           └── Action: Charge
  │
  ├── → [导航到货架 Sequence]
  │     ├── Action: PlanPathToShelf
  │     └── Retry(3)
  │           └── Timeout(60s)
  │                 └── Action: NavigateToShelf
  │
  ├── → [感知+抓取 Sequence]
  │     ├── Retry(3)
  │     │     └── Action: DetectTargetObject
  │     ├── Action: ComputeGraspPose
  │     └── ? [抓取尝试 Fallback]
  │           ├── Retry(2)
  │           │     └── Action: ExecuteGrasp
  │           └── → [换角度重试]
  │                 ├── Action: MoveToAlternateViewpoint
  │                 ├── Action: DetectTargetObject
  │                 └── Action: ExecuteGrasp
  │
  └── → [送到打包台 Sequence]
        ├── Action: NavigateToPackStation
        └── Action: PlaceObject
```

注意几个设计细节：

**电量检查在最前面。** 整棵树的 root sequence 第一个子节点就是电量检查。因为 sequence 是从左到右执行的，如果电量低，机器人会先去充电，充满才继续后续任务。这是一种“前置条件”的经典模式。

**导航有重试和超时。** NavigateToShelf 被 Retry(3) 和 Timeout(60s) 两层 decorator 包裹。如果一次导航超时（可能遇到临时障碍物），会自动重试，最多 3 次。

**抓取有多层 fallback。** 直接抓取失败两次后，不是直接放弃，而是 fallback 到一个“换角度重试”的 sequence - 移动到另一个观察位置，重新检测，再尝试抓取。真实场景中抓取失败的常见原因就是观察角度不好导致位姿估计不准。

这就是行为树的威力：happy path（一切顺利时的路径）和异常处理逻辑在同一棵树里被清晰地表达，而且每个分支都可以独立调整。

<figure>
  <img src="/images/ch13/bt_replanning_recovery.png" alt="Nav2 中行为树的 replanning 和 recovery 流程" />
  <figcaption>Nav2 中的行为树 — 展示了导航任务中 replanning 和 recovery 行为的分支结构，每个异常情况都有对应的处理路径。图源：Nav2 Documentation</figcaption>
</figure>

---

## BehaviorTree.CPP 和 Groot

ROS 2 生态里行为树的标准实现是 **BehaviorTree.CPP** - 一个 C++ 库，Nav2 的整个导航行为编排就是基于它构建的。你在 Nav2 的配置文件里看到的那些 `<Sequence>`, `<Action>` 标签，就是 BehaviorTree.CPP 的 XML 格式。

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence>
      <Action ID="NavigateToShelf" goal="{shelf_pose}"/>
      <Action ID="DetectObject" detected_pose="{object_pose}"/>
      <Action ID="PickObject" target="{object_pose}"/>
    </Sequence>
  </BehaviorTree>
</root>
```

XML 写多了眼花也正常。这时候 **Groot** 就派上用场了 - 它是 BehaviorTree.CPP 配套的可视化编辑器。你可以用拖拽的方式搭建行为树，实时看到树的结构，还能在机器人运行时接入 Groot 查看当前正在执行哪个节点。

Groot 2 是付费版本，功能更完善。开源版本 Groot 基础功能够用，但大型项目建议上 Groot 2，调试效率差距很明显。

---

## 黑板（Blackboard）- 节点之间的共享数据通道

行为树的节点是独立的，但它们经常需要传递数据。感知节点检测到目标物体的位姿是 `[1.2, 0.5, 0.8]`，抓取节点需要知道这个位姿才能计算抓取方案。怎么传？

答案是 **Blackboard** - 一个键值对（key-value）存储，挂在行为树上，所有节点都可以读写。

```xml
<!-- 感知节点把检测结果写到 blackboard -->
<Action ID="DetectObject" detected_pose="{object_pose}"/>

<!-- 抓取节点从 blackboard 读取位姿 -->
<Action ID="PickObject" target="{object_pose}"/>
```

`{object_pose}` 就是 blackboard 上的一个 key。`DetectObject` 执行完后把结果写到这个 key，`PickObject` 从同一个 key 读取。

Blackboard 简单好用，但它本质上是全局变量。树一复杂、子树一多，blackboard 上的 key 容易撞名。BehaviorTree.CPP 4.x 引入了端口（port）系统来缓解这个问题 - 每个节点明确声明自己的输入端口和输出端口，数据流变得更显式。但在实际大型项目中，blackboard 的管理仍然是一个需要严格规范的事情。

---

## 反应式 vs 顺序式：两种执行模型

行为树有一个容易让人困惑的地方：它的 tick 机制。

**顺序式执行**比较直觉 - 执行到某个 action 节点，action 返回 RUNNING（正在执行中），下一次 tick 直接从这个 RUNNING 节点继续，不重新从根节点遍历。

**反应式执行**更强大也更复杂 - 每次 tick 都从根节点重新遍历。这意味着即使某个 action 正在执行中，如果树的更高优先级分支的条件发生了变化（比如突然检测到电量低了），机器人可以立刻中断当前动作去处理更紧急的事情。

Nav2 的默认行为树用的是反应式模型。它每次 tick 都会先检查“是不是应该 recovery？”、“全局路径需不需要重新规划？”，然后才继续执行当前的 controller。这就是为什么 Nav2 能在导航过程中动态响应障碍物 - 它不是在某个固定的 action 里死等，而是每个 tick 都在重新评估全局状态。

---

## 开发者踩坑指南

### 异常分支比 happy path 复杂 10 倍

这不是夸张。happy path 可能只有 5 个 action 节点串一条 sequence。但“导航失败了怎么办？”“抓取失败了怎么办？”“感知检测不到目标怎么办？”“超时了怎么办？”“同时有两个异常怎么办？” - 这些异常分支加起来，节点数量很容易是 happy path 的十倍。

一个实际建议：先把 happy path 搭好跑通，然后逐一添加异常处理。不要试图一开始就设计一棵“完美”的树。

### 调试噩梦：“当前到底在执行哪个分支？”

行为树一大就很难用肉眼追踪执行流。一棵 50 个节点的树，当前执行到了哪个叶节点？为什么走了这条分支而不是那条？哪个 condition 节点返回了 false 导致 fallback？

Groot 的实时可视化在这里是刚需而不是锦上添花。没有可视化工具，你就只能靠日志 - 在每个节点里加 print，然后盯着满屏的日志试图还原执行路径。

另一个实用技巧是善用 BehaviorTree.CPP 的日志回调（`TreeObserver`），把每次节点状态变化记录下来，事后可以回放整棵树的执行历史。

### 并发子树的同步

BehaviorTree.CPP 有一个 `Parallel` 节点，可以同时执行多个子节点。比如“一边导航一边用相机扫描环境”。听起来很美，但同步问题会让你头疼 - 如果导航先完成了，扫描还没完成怎么办？如果扫描发现了问题需要中断导航呢？

`Parallel` 节点有一个 `success_count` 参数控制“多少个子节点成功才算成功”，但实际使用中，并发场景的异常处理比顺序场景复杂得多。我的建议是：除非真的需要，尽量用 sequence 而不是 parallel。大多数机器人任务用顺序执行就够了。

---

## 行为树的边界和替代方案

行为树很强，但它不是万能的。

它最适合的场景是**结构化的任务流程** - 你能预先定义出任务的步骤和分支。仓库拣货、餐厅送餐、巡检路线，这些任务的流程是相对固定的，只是需要处理各种异常情况。

它不太擅长的场景是**开放式任务** - “帮我收拾桌子”。这句话背后有太多隐含的判断：桌上有什么东西？哪些要收走？收到哪里？什么顺序？这不是一棵预定义的行为树能优雅处理的。

也有一些框架在尝试不同的范式来解决任务编排问题 - 比如 DimOS 用 Module + Blueprint 的声明式组合，或者直接用 LLM agent 做高层任务拆解再调用底层技能。但行为树目前仍是 ROS 2 生态里最成熟、工具链最完善的选择。

行为树的输出是什么？它本身不产出数据，它产出的是**执行序列** - 按什么顺序调用哪些模块、传递什么参数、在什么条件下做什么分支决策。它是前面所有章节讲的模块（SLAM、Nav2、MoveIt、感知）的“总指挥”，把它们从独立的能力变成协调的行为。

下一层的问题是：这些行为在真机上跑之前，得先在一个安全的地方验证 - 这就是仿真要解决的事情了。
