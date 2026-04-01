## ROS 2 - 机器人世界的 Linux

---

前五章我们从传感器聊到执行器再到计算平台，把机器人的"身体"基本拆清楚了。传感器是眼睛耳朵，执行器是肌肉关节，Jetson 是大脑的硬件载体。

但一个人光有眼睛、肌肉和大脑还不够 - 这些器官之间需要一套神经系统把它们串起来。你的视觉皮层看到一只飞来的球，这个信号要传到运动皮层，运动皮层要协调几十块肌肉去接球。中间如果有任何一个环节断了或者慢了，球就砸脸上了。

机器人也面临同样的问题。一台机器人身上同时跑着几十个软件模块：相机驱动在发图像，LiDAR 驱动在发点云，SLAM 在建图，导航在规划路径，手臂控制在算轨迹，感知模型在识别物体……这些模块各自是独立的进程，分别由不同的团队甚至不同的公司开发。它们需要一套统一的方式来互相发现、互相通信、互相协调。

ROS 2（Robot Operating System 2）就是这套"神经系统"。

---

## ROS 到底是什么 - 名字有误导性

ROS 这个名字里有"Operating System"，但它**不是一个操作系统**。你的机器人底层跑的还是 Ubuntu Linux，ROS 2 是装在 Linux 上面的一层软件框架。

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

机器人开发的核心痛点不是"从零写一个功能模块很难" - 难，但能克服。核心痛点是**从零写所有功能模块不现实**。一台能在仓库里自主导航和抓取的机器人，涉及 SLAM、导航、手臂规划、感知、行为调度、传感器驱动、电机控制、安全监控……每一个都是一个专业领域，每一个都需要几个月到几年的工程量。

ROS 2 的开源包生态让你可以站在别人肩膀上。你用 slam_toolbox 建图，用 Nav2 导航，用 MoveIt 2 做手臂规划，用 ros2_control 对接电机驱动。你只需要把精力放在你的差异化功能上 - 比如你的特定场景的感知算法、你的任务调度逻辑。

而且这个生态有自我强化效应：越多人用 ROS 2 → 越多人贡献高质量的包 → 新进入者越没有理由不用 ROS 2 → 越多人用 ROS 2。宇树的机器狗 SDK 基于 ROS 2，NVIDIA Isaac Sim 的 ROS bridge 连的是 ROS 2，Foxglove 的可视化工具对接的是 ROS 2 消息格式。整条工具链都围绕它建的。

不用 ROS 2 当然可以，但你等于放弃了一整个生态。也有一些项目（比如 DimOS）尝试提供 Python-first、不强制依赖 ROS 2 的开发体验，降低入门门槛。但 ROS 2 的包生态优势 - 几千个经过实战验证的开源包 - 短期内没有替代品。

---

## ROS 1 vs ROS 2：为什么必须迁移

ROS 1 诞生于 2007 年，最初是 Willow Garage（一家机器人研究公司）的内部项目，设计目标是让研究人员在实验室里快速搭建原型。它做得很好 - 好到整个学术界和大部分机器人公司都在用。

但 ROS 1 有几个致命的架构问题，让它无法走出实验室：

**单点故障。** ROS 1 有一个 rosmaster - 一个中心化的"名册服务"，所有节点启动时都要去 rosmaster 那里注册。如果 rosmaster 挂了，整个系统的节点发现就瘫痪了。这在实验室无所谓 - 重启就行。在生产环境里你敢让一台在仓库里搬货的机器人因为一个进程挂了就失联吗？

**没有实时性保证。** ROS 1 的通信基于自定义的 TCP/UDP 协议，没有 QoS（Quality of Service）机制。消息到底送到了没有？延迟多少？没人保证。对传感器数据这种"丢一帧无所谓"的消息还好，对导航指令这种"丢了可能撞墙"的消息就不行了。

**多机器人支持几乎为零。** ROS 1 的通信假设所有节点在同一个网络里、连着同一个 rosmaster。你想让两台机器人协作？要么搞复杂的 multi-master 方案，要么自己写桥接。

ROS 2 用 **DDS（Data Distribution Service）** 替换了 ROS 1 的整个通信层，一口气解决了这三个问题。

DDS 是一个工业级的通信中间件标准，在 ROS 出现之前就已经在军工、航空、金融等领域用了十几年。它是去中心化的（没有 master），支持细粒度的 QoS 配置（你可以指定这条消息必须可靠送达、那条消息丢了就算了），天然支持多机发现（同一网络里的 DDS 节点自动互相发现）。

ROS 2 目前主流的 DDS 实现有两个：**CycloneDDS**（Eclipse 基金会开发，轻量、性能好，是 ROS 2 Jazzy 的默认选项）和 **Fast DDS**（eProsima 开发，功能更丰富但配置复杂）。DDS 的细节会在下一章展开，这里只需要知道：ROS 2 底层的通信不再是玩具级别了。

ROS 2 目前的 LTS 版本是 **Humble**（2022-2027）和较新的 **Jazzy**（2024-2029），都绑定 Ubuntu 22.04 或 24.04。如果你现在入门，直接上 Humble 或 Jazzy，不需要碰 ROS 1。

---

## 核心概念速通

ROS 2 的五个核心概念 - Node、Topic、Service、Action、Parameter - 加上 Launch 文件，基本构成了你日常开发的全部"语法"。

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

### Service - 请求/响应，像 HTTP API

**Service（服务）** 是同步的请求/响应模式。一个节点当"服务端"，别的节点当"客户端"发请求。

什么时候用 Service 而不是 Topic？当你需要**一个明确的回复**的时候。比如你想让导航系统算一条从 A 到 B 的路径 - 你不是想持续订阅路径更新，你是想说"给我算一条路径"然后等结果回来。这就是 Service 的场景。

```python
# 客户端调用
future = client.call_async(request)
# 等待响应
response = future.result()
```

和 HTTP API 很像，对吧？但有一个关键区别：ROS 2 的 Service 是设计给机器人内部模块间通信的，不是给外部客户端调的。延迟在毫秒级，不走 HTTP 协议。

### Action - 长任务 + 进度反馈

**Action（动作）** 是 ROS 2 里最"重"的通信模式，专门为长时间运行的任务设计。

设想你让机器人"导航到 3 号货架"。这不是一个瞬间完成的操作 - 可能要走 30 秒。在这 30 秒里，你想知道：它走到哪了？进度多少？遇到障碍了吗？你可能还想中途取消 - "别去了，任务变了"。

Action 提供三个东西：
1. **Goal** - 发送目标（"去 3 号货架"）
2. **Feedback** - 持续的进度反馈（"当前距离目标 5.2 米"）
3. **Result** - 最终结果（"到了"或"到不了，路被堵了"）

Nav2 的导航接口就是一个 Action：`NavigateToPose`。MoveIt 2 的运动执行也是 Action：`MoveGroup`。基本上，任何需要"发起 → 执行中 → 完成"这个生命周期的任务都用 Action。

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

**Launch 文件**就是 ROS 2 的编排脚本。它用 Python（或 XML/YAML）定义"启动哪些节点、传什么参数、怎么做 remapping"。一个 `ros2 launch` 命令就能把整台机器人的所有软件模块全部拉起来。

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
- **Service = 工单系统**。你提交一个工单"帮我算一条路径"，路径规划组接单，算完把结果返回给你。一问一答，同步完成。
- **Action = 项目管理**。你发起一个项目"把货从 A 搬到 B"，执行团队接受后开始干活，每天给你发进度报告（feedback），干完了交付最终成果（result）。你随时可以叫停这个项目（cancel）。
- **Parameter = 公司政策配置**。"出差报销上限 5000 元" - 写在规章里，但 CEO 随时可以改成 8000 元，不需要重新注册公司。
- **Launch 文件 = 开业流程**。早上 9 点，一键启动：保安到岗、前台开机、空调打开、各部门上线。不用一个一个打电话叫人来。

---

## URDF - 机器人的"身份证"

ROS 2 的通信框架搞定了"模块之间怎么说话"的问题，但还有一个根本问题没解决：**ROS 2 怎么知道你的机器人长什么样？**

一台机器人有多少个关节、每个关节怎么连接、传感器装在哪个位置、整个身体的尺寸和质量分布是什么样的 - 这些信息对于 SLAM、导航、手臂规划来说是必需的。MoveIt 要算手臂的运动轨迹，它得知道手臂有几个关节、每个关节的旋转范围、臂长多少。Nav2 要做避障，它得知道机器人的外轮廓有多大。

**URDF（Unified Robot Description Format）** 就是存储这些信息的标准格式 - 一个 XML 文件，描述机器人的完整物理结构。

URDF 里定义两种基本元素：
- **Link（连杆）** - 机器人身体的一段刚性部件（比如大臂、小臂、底盘）
- **Joint（关节）** - 连接两个 link 的活动部分（比如肩关节、肘关节）

每个 joint 有类型（旋转、平移、固定）、旋转范围、所在位置。每个 link 有质量、惯量、碰撞模型和视觉模型。把所有的 link 和 joint 串起来，就构成了一棵"运动学树"。

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

URDF 是 ROS 2 生态里最基础的"接口契约"之一。你买了一台宇树 G1，宇树会提供它的 URDF。你换了一个新夹爪，你需要把夹爪的 URDF 挂到手臂的末端。你想在 Isaac Sim 里仿真你的机器人，第一步就是导入 URDF。

---

## 开发者踩坑指南

ROS 2 的学习曲线在机器人开发中是出了名的陡。不是因为每个概念有多难 - 上面讲的 node、topic、service 都不复杂 - 而是因为**细碎的坑特别多**。

**环境配置地狱。** ROS 2 的每个发行版绑定特定的 Ubuntu 版本。Humble 要 Ubuntu 22.04，Jazzy 要 Ubuntu 24.04。你的 CUDA 版本、Python 版本、各种依赖库的版本都要和 ROS 2 发行版匹配。新手最常见的第一天体验是：花 6 个小时装环境，装到怀疑人生。Docker 几乎是必备的 - 用官方的 `ros:humble` 或 `ros:jazzy` 镜像作为基础，能省掉 80% 的环境问题。

**source 这个文件。** ROS 2 安装后，每次打开新终端都要 `source /opt/ros/humble/setup.bash`（以及你自己的工作空间的 setup.bash）。忘了 source，你的 `ros2` 命令就找不到，你的包也找不到。无数新手在这个问题上浪费时间，error 信息还不够明显。建议直接写进 `.bashrc` 里。

**QoS 不匹配。** 这是 ROS 2 里最阴险的坑之一。如果发布者用 `RELIABLE` QoS 发消息，订阅者用 `BEST_EFFORT` 订阅（或者反过来），消息**静默丢失** - 不报错，不告警，就是收不到。你以为传感器坏了，其实是 QoS 配置不兼容。用 `ros2 topic info -v /your_topic` 可以查看发布者和订阅者各自的 QoS 设置，不匹配的一眼就能看出来。

**TF 树。** TF（Transform）是 ROS 2 里管理坐标系变换的系统。机器人身上每个传感器、每个关节都有自己的坐标系，TF 负责在这些坐标系之间做转换 - "相机看到的目标在相机坐标系下是 [1, 0, 0.5]，换算到机器人基座坐标系下是多少？"TF 的树状结构必须完整连通，任何一个断裂都会导致下游模块报错。调试 TF 问题是 ROS 2 开发的日常 - `ros2 run tf2_tools view_frames` 能把 TF 树画出来，是排查问题的第一步。

这些坑不是吓你。它们是每个 ROS 2 开发者必经的"新手村"任务。过了这个阶段，ROS 2 生态的生产力回报是非常高的 - 几百个成熟的开源包等着你用，社区活跃度也很高。

---

## ROS 2 的输出是什么，谁在用

ROS 2 本身不"输出"什么 - 它是基础设施。就像 Linux 内核不直接给用户提供功能，但所有应用都跑在它上面。

从开发者视角看，ROS 2 给你的是：
- 一套让模块之间能互相通信的管道
- 一个标准化的机器人描述格式（URDF）
- 一套构建和包管理工具（colcon + rosdep）
- 一个可以直接 `apt install` 的算法包生态

下一章会深入 DDS - ROS 2 通信层的核心。如果说这一章讲的是"ROS 2 是什么、为什么用它"，下一章讲的就是"它的消息到底是怎么送到的"。从 QoS 配置到带宽优化到多机通信，那些真正影响系统稳定性的通信细节，都藏在 DDS 这一层里。
