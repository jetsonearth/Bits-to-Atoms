## ROS 2 - 机器人世界的 Linux

前五章我们从传感器聊到执行器再到计算平台，把机器人的“身体”基本拆清楚了。传感器是眼睛耳朵，执行器是肌肉关节，Jetson 是大脑的硬件载体。

但一个人光有眼睛、肌肉和大脑还不够 - 这些器官之间需要一套神经系统把它们串起来。你的视觉皮层看到一只飞来的球，这个信号要传到运动皮层，运动皮层要协调几十块肌肉去接球。中间如果有任何一个环节断了或者慢了，球就砸脸上了。

机器人也面临同样的问题。一台机器人身上同时跑着几十个软件模块：相机驱动在发图像，LiDAR 驱动在发点云，SLAM 在建图，导航在规划路径，手臂控制在算轨迹，感知模型在识别物体……这些模块各自是独立的进程，分别由不同的团队甚至不同的公司开发。它们需要一套统一的方式来互相发现、互相通信、互相协调。

ROS 2（Robot Operating System 2）就是这套“神经系统”。

---

## ROS 到底是什么 - 名字有误导性

ROS 这个名字里有“Operating System”，但它**不是一个操作系统**。你的机器人底层跑的还是 Ubuntu Linux，ROS 2 是装在 Linux 上面的一层软件框架。

更准确的理解是：ROS 2 = **一套进程间通信框架** + **一大堆开源包** + **一种开发范式**。

这三件事缺一不可，但大部分人低估了后两者的重要性。

通信框架好理解 - 它定义了模块之间怎么互相发消息。但 ROS 2 真正的杀手锏是生态。Nav2（导航）、MoveIt 2（手臂规划）、slam_toolbox（建图）、ros2_control（电机驱动抽象）、image_pipeline（图像处理）……几乎机器人开发中你能想到的每一个功能模块，都有人已经写好了开源的 ROS 2 package。你不需要从零写一个 SLAM 系统，你 `apt install ros-humble-slam-toolbox`，配几个参数，启动，它就开始建图了。

开发范式则是指 ROS 2 让整个行业形成了一种共识：你写一个机器人功能模块，就把它封装成一个 ROS 2 node，暴露标准的 topic 和 service 接口，别人就能直接拿去用。这就像 Web 世界里大家约定好用 REST API 通信一样 - 不是因为 REST 在技术上最完美，而是因为所有人都用它，所以它成了标准。

如果你是 Web 开发者，可以这么对照理解：

| Web 世界 | ROS 2 世界 | 为什么类似 |
|---------|-----------|----------|
| npm / PyPI | rosdistro（ROS 包索引） | 包管理和分发 |
| 微服务 | Node（节点） | 独立进程，各管一件事 |
| Kafka / RabbitMQ | Topic（话题） | 发布/订阅消息通信 |
| REST API | Service（服务） | 请求/响应模式 |
| gRPC streaming | Action（动作） | 带进度反馈的长任务 |
| docker-compose | Launch 文件 | 一键启动一堆进程 |
| Kubernetes | Lifecycle 管理 | 节点的启动/暂停/关闭编排 |

---

## 为什么整个行业都绑在 ROS 上

答案很简单：**网络效应。**

机器人开发的核心痛点不是“从零写一个功能模块很难” - 难，但能克服。核心痛点是**从零写所有功能模块不现实**。一台能在仓库里自主导航和抓取的机器人，涉及 SLAM、导航、手臂规划、感知、行为调度、传感器驱动、电机控制、安全监控……每一个都是一个专业领域，每一个都需要几个月到几年的工程量。

ROS 2 的开源包生态让你可以站在别人肩膀上。你用 slam_toolbox 建图，用 Nav2 导航，用 MoveIt 2 做手臂规划，用 ros2_control 对接电机驱动。你只需要把精力放在你的差异化功能上 - 比如你的特定场景的感知算法、你的任务调度逻辑。

而且这个生态有自我强化效应：越多人用 ROS 2 → 越多人贡献高质量的包 → 新进入者越没有理由不用 ROS 2 → 越多人用 ROS 2。宇树的机器狗 SDK 基于 ROS 2，NVIDIA Isaac Sim 的 ROS bridge 连的是 ROS 2，Foxglove 的可视化工具对接的是 ROS 2 消息格式。整条工具链都围绕它建的。

不用 ROS 2 当然可以，但你等于放弃了一整个生态。也有一些项目（比如 Dimensional OS）尝试提供 Python-first、不强制依赖 ROS 2 的开发体验，降低入门门槛。但 ROS 2 的包生态优势 - 几千个经过实战验证的开源包 - 短期内没有替代品。

---

## ROS 1 和 ROS 2 - 你只需要知道一件事

你搜 ROS 教程的时候会发现大量 ROS 1 的内容。别看。

ROS 1 是 2007 年给实验室设计的，跑个 demo 没问题，但它有一个中心化的 master 进程 - 这东西一挂，整个系统就瘫了。实验室里无所谓，重启就行。你敢让仓库里搬货的机器人这么玩吗？

ROS 2 重写了通信层，换成了工业级的 **DDS（Data Distribution Service）** 协议 - 去中心化、消息可靠性可配置、多台机器人自动互相发现。DDS 在军工和航空领域已经用了十几年，不是什么新实验。

你现在入门，直接用 **Humble**（LTS，支持到 2027）或 **Jazzy**（更新，支持到 2029），绑定 Ubuntu 22.04 或 24.04。碰到 ROS 1 的教程、API、工具，跳过就行。

---

## 核心概念速通

接下来是六个你会天天打交道的概念。不用背 - 后面每一章讲导航、SLAM、手臂规划的时候，它们都会反复出现。这里先过一遍，建个印象，等你真正写代码的时候会发现”啊，那个东西就是这个”。

### Node - 一个进程，管一件事

**Node（节点）** 是 ROS 2 里最小的执行单元。一个 node 就是一个独立的进程（或者线程），负责一件明确的事。比如：
- 一个 node 负责读取 LiDAR 数据并发布点云
- 一个 node 负责跑 SLAM 算法
- 一个 node 负责做路径规划
- 一个 node 负责控制底盘电机

为什么要拆这么细？和微服务的道理一样：**隔离故障、独立开发、可替换。** 你的 SLAM 节点挂了，导航节点还在跑（虽然没有新地图它会原地等待）。你想把 slam_toolbox 换成自己写的 SLAM，只需要保证新节点发布的 topic 格式一样，其他节点完全不用改。

用 Python 写一个最简单的 ROS 2 node：

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')  # 节点名
        self.get_logger().info('Hello from my_node!')

def main():
    rclpy.init()
    node = MyNode()
    rclpy.spin(node)  # 保持节点运行，监听消息
    rclpy.shutdown()
```

就这么多。继承 `Node` 类，给个名字，调 `rclpy.spin()` 让它持续运行。所有的 ROS 2 节点，不管多复杂，骨架都是这个。

### Topic - 广播频道，pub/sub 模式

**Topic（话题）** 是节点之间最常用的通信方式。它的模式是 publish/subscribe - 发布者往一个 topic 上发消息，所有订阅了这个 topic 的节点都能收到。

类比：公司里的 Slack 频道。LiDAR 驱动节点往 `/scan` 频道里不停发消息（每秒 10-20 条），SLAM 节点和导航节点都订阅了这个频道，各自拿数据去做自己的事。LiDAR 节点不需要知道谁在听，SLAM 节点也不需要知道数据从哪来 - 松耦合。

Topic 上传输的消息有严格的类型定义（叫 **message type**），比如 `sensor_msgs/msg/LaserScan` 是 2D LiDAR 数据的标准格式，`geometry_msgs/msg/Twist` 是速度指令的标准格式。这些标准消息类型是 ROS 2 生态的另一个重要约定 - 不管谁写的 LiDAR 驱动，发出来的消息格式都一样，所以任何 SLAM 包都能直接对接。

### Service - 一问一答

**Service（服务）** 就是 HTTP API 的机器人版 - 请求/响应模式。你发一个请求”帮我算一条从 A 到 B 的路径”，对方算完把结果返回给你。一问一答，同步完成。

Topic 和 Service 的区别很直觉：传感器数据用 Topic（持续广播，谁爱听谁听），具体的一次性请求用 Service（我问你答）。

### Action - 带进度条的长任务

**Action（动作）** 解决的问题是：有些任务不是一瞬间能完成的。

你让机器人”导航到 3 号货架” - 这可能要走 30 秒。你不想干等着，你想知道它走到哪了、有没有被堵住、能不能中途取消。Action 就是为这种场景设计的：发送目标 → 持续收到进度反馈 → 拿到最终结果（或者中途取消）。

Nav2 的导航接口 `NavigateToPose`、MoveIt 2 的运动执行 `MoveGroup`，都是 Action。基本上，任何你想”发起、跟踪、可能中途喊停”的任务都用它。

### Parameter - 运行时可调的配置

**Parameter（参数）** 是节点的配置项，可以在运行时动态修改。

比如导航的最大速度、SLAM 的分辨率、感知模型的置信度阈值 - 这些你不想写死在代码里，因为不同场景需要不同的值。ROS 2 的 Parameter 系统让你可以在 launch 文件里设初始值，运行时通过命令行或者代码动态调整。

```bash
# 运行时改参数
ros2 param set /nav2_controller max_vel_x 0.5
```

这个东西简单但极度重要。机器人开发中大量的工作就是**调参** - 后面讲 Nav2 和 MoveIt 的章节里你会深刻体会到。

### Launch 文件 - 编排脚本

一台机器人通常要同时启动几十个 node。你不会想手动一个一个 `ros2 run` 吧？

**Launch 文件**就是 ROS 2 的编排脚本。它用 Python（或 XML/YAML）定义“启动哪些节点、传什么参数、怎么做 remapping”。一个 `ros2 launch` 命令就能把整台机器人的所有软件模块全部拉起来。

```python
# launch/robot_bringup.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(package='slam_toolbox', executable='async_slam_toolbox_node',
             parameters=[{'resolution': 0.05}]),
        Node(package='nav2_bringup', executable='bringup_launch'),
        Node(package='my_perception', executable='detector_node'),
    ])
```

它的角色和 docker-compose.yml 非常像 - 声明式地定义一组服务的启动配置。

---

## 类比：如果 ROS 2 是一家公司

把上面的概念串起来，想象 ROS 2 是一家公司的运作方式：

- **Node = 员工**。每个员工负责一件事 - 有人管视觉，有人管导航，有人管手臂。
- **Topic = Slack 群聊频道**。视觉组把识别结果往 `#perception-results` 频道里发，谁需要谁自己订阅。没人需要私聊 - 信息对所有订阅者公开。
- **Service = 工单系统**。你提交一个工单“帮我算一条路径”，路径规划组接单，算完把结果返回给你。一问一答，同步完成。
- **Action = 项目管理**。你发起一个项目“把货从 A 搬到 B”，执行团队接受后开始干活，每天给你发进度报告（feedback），干完了交付最终成果（result）。你随时可以叫停这个项目（cancel）。
- **Parameter = 公司政策配置**。“出差报销上限 5000 元” - 写在规章里，但 CEO 随时可以改成 8000 元，不需要重新注册公司。
- **Launch 文件 = 开业流程**。早上 9 点，一键启动：保安到岗、前台开机、空调打开、各部门上线。不用一个一个打电话叫人来。

---

## URDF - 机器人的“身份证”

ROS 2 的通信框架搞定了“模块之间怎么说话”的问题，但还有一个根本问题没解决：**ROS 2 怎么知道你的机器人长什么样？**

一台机器人有多少个关节、每个关节怎么连接、传感器装在哪个位置、整个身体的尺寸和质量分布是什么样的 - 这些信息对于 SLAM、导航、手臂规划来说是必需的。MoveIt 要算手臂的运动轨迹，它得知道手臂有几个关节、每个关节的旋转范围、臂长多少。Nav2 要做避障，它得知道机器人的外轮廓有多大。

**URDF（Unified Robot Description Format）** 就是存储这些信息的标准格式 - 一个 XML 文件，描述机器人的完整物理结构。

URDF 里定义两种基本元素：
- **Link（连杆）** - 机器人身体的一段刚性部件（比如大臂、小臂、底盘）
- **Joint（关节）** - 连接两个 link 的活动部分（比如肩关节、肘关节）

每个 joint 有类型（旋转、平移、固定）、旋转范围、所在位置。每个 link 有质量、惯量、碰撞模型和视觉模型。把所有的 link 和 joint 串起来，就构成了一棵“运动学树”。

```xml
<robot name="my_arm">
  <link name="base_link">
    <visual>
      <geometry><cylinder radius="0.05" length="0.1"/></geometry>
    </visual>
  </link>
  <joint name="shoulder" type="revolute">
    <parent link="base_link"/>
    <child link="upper_arm"/>
    <limit lower="-3.14" upper="3.14" effort="10" velocity="1.0"/>
  </joint>
  <link name="upper_arm">
    <!-- ... -->
  </link>
</robot>
```

URDF 是 ROS 2 生态里最基础的“接口契约”之一。你买了一台宇树 G1，宇树会提供它的 URDF。你换了一个新夹爪，你需要把夹爪的 URDF 挂到手臂的末端。你想在 Isaac Sim 里仿真你的机器人，第一步就是导入 URDF。

---

## ROS 2 在整个系统里的位置

ROS 2 本身不“做”什么 - 它不会建图、不会导航、不会抓东西。它是基础设施，让那些真正干活的模块能够互相通信和协调。

后面每一章讲的东西 - SLAM、导航、手臂规划、感知 - 都是跑在 ROS 2 上面的应用层。它们通过 topic 交换数据，通过 action 协调任务，通过 parameter 调整行为。你现在对这些概念有个印象就够了，真正的理解会在你第一次 `ros2 launch` 拉起一整台机器人的时候到来。
