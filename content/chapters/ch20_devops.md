## 开发环境与 DevOps

你刚入职一家软件公司，第一天最顺利的事情大概是：打开 README，跑一遍 `npm install`，然后 `npm run dev`，项目就跑起来了。哪怕环境有点问题，最多装个 nvm 切一下 Node 版本，十分钟搞定。

现在想象一下机器人版本的“第一天”。你打开项目文档，发现它写着：需要 Ubuntu 22.04（不是 24.04，不是 20.04，就是 22.04）、ROS 2 Humble（不是 Iron，不是 Jazzy）、OpenCV 4.5.4（不是 4.6，因为 4.6 有个 API 变了）、CUDA 11.8、cuDNN 8.6、PCL 1.12、Eigen 3.4，还有一堆你没听过的 C++ 库需要从源码编译。你花了一整天装好环境，编译了半小时，最后一个包报错说它需要另一个版本的 protobuf。你卸了重装，结果另外三个包又炸了。

这就是机器人开发的**环境地狱** - 它不是偶发事件，而是行业日常。整个工具链的 DevOps 体系，本质上都是在回答一个问题：怎么让开发者不再把时间浪费在“让代码能编译”这件事上。

---

### Web DevOps 和 Robot DevOps 的映射

如果你有 Web 或后端开发的 DevOps 经验，下面这张表会帮你快速定位：

| Web / 后端 | 机器人 | 关键差异 |
|-----------|-------|---------|
| nvm / pyenv | Docker 容器 | 机器人不只是语言版本问题，是整个 OS + 中间件版本绑定 |
| npm install / pip install | colcon build + rosdep | C++ 编译可能要几十分钟，不是秒级 |
| localhost:3000 | SSH + tmux 连真机 | 你的“服务器”是一台会动的物理设备 |
| Jest / Pytest | Gazebo / Isaac Sim 仿真测试 | 单元测试不够，需要在物理引擎里跑集成测试 |
| GitHub Actions | GitHub Actions + 仿真容器 | CI 里不只跑 lint 和测试，还要启动一个仿真环境 |
| docker-compose up | docker compose + X11 转发 + GPU 直通 | 机器人容器要访问 GPU、传感器设备、显示器 |

核心区别在于：Web DevOps 处理的是纯软件的确定性环境，而机器人 DevOps 要额外应对硬件绑定、实时性要求和物理世界的不确定性。

---

### Docker - 逃离环境地狱的救生舱

ROS 2 的发行版（distro）和 Ubuntu 版本是强绑定的。Humble 要求 Ubuntu 22.04，Iron 要求 22.04，Jazzy 要求 24.04。这不是“建议”，是“必须” - 因为底层的 DDS 库、系统依赖都是针对特定 Ubuntu 版本编译的。如果你同时参与两个项目，一个用 Humble 一个用 Jazzy，你需要两台不同系统版本的电脑。或者 - 你用 Docker。

Docker 在机器人开发中的角色比 Web 开发中更加核心。Web 开发者用 Docker 主要是为了部署一致性；机器人开发者用 Docker 是为了**开发本身能进行下去**。

一个典型的机器人项目 Docker 设置长这样：

```dockerfile
FROM ros:humble-desktop

# 安装项目特定依赖
RUN apt-get update && apt-get install -y \
    ros-humble-navigation2 \
    ros-humble-slam-toolbox \
    ros-humble-robot-localization \
    python3-pip

# 如果需要 GPU 加速的感知模型
# 基础镜像换成 nvidia/cuda，再在上面装 ROS 2

COPY . /ws/src/my_robot
WORKDIR /ws
RUN . /opt/ros/humble/setup.sh && colcon build
```

但机器人的 Docker 使用有几个 Web 开发者不会遇到的坑：

**GPU 直通**。你的感知模型需要 GPU 推理，容器里默认访问不到宿主机的 GPU。需要安装 NVIDIA Container Toolkit，然后用 `docker run --gpus all` 启动。这个工具链本身也有版本兼容问题 - 驱动版本、CUDA 版本、Container Toolkit 版本三者要对得上。

**设备访问**。容器里跑的程序需要直接读取 USB 摄像头、LiDAR、IMU 等硬件设备。你需要 `--device=/dev/ttyUSB0` 或者 `--privileged` 把设备映射进去。用 `--privileged` 最省事但也最不安全，生产环境不推荐。

**GUI 显示**。RViz2、Gazebo 这些可视化工具需要显示窗口。在 Linux 上需要做 X11 socket 挂载（`-v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY`），macOS 上要装 XQuartz，Windows 上要折腾 WSL2 的 GUI 转发。这个环节劝退了相当一部分初学者。

**网络配置**。ROS 2 的 DDS 通信走的是多播（multicast），Docker 默认的 bridge 网络不支持多播。你要么用 `--network=host`（最简单，容器共享宿主机网络），要么手动配置 DDS 的通信发现方式。多机器人场景下，这个问题会更复杂。

一个实用建议：开发阶段直接 `--network=host --privileged --gpus all`，别在网络和权限配置上浪费时间。等你要部署到生产环境时，再一个一个收紧权限。

顺便提一句，一些新兴平台（比如 DimOS）选择了完全不同的路径 - 用 `pip install` 加 Python-first 的方式绕过了 ROS 2 的版本绑定和 C++ 编译问题。但代价是你离开了 ROS 2 的包生态，Nav2、MoveIt、slam_toolbox 这些积累了十几年的成熟包都不能直接用了。这是一个 trade-off，没有哪边绝对更好。

---

### SSH + tmux - 远程调试真机的生存技能

Web 开发者的应用跑在云服务器上，你 SSH 进去看日志、重启服务，很正常。机器人开发者的“服务器”是一台装了 Jetson 的移动机器人，可能正在仓库里跑来跑去。你不可能每次调试都跑过去接显示器和键盘。

标准操作是：**SSH 连进机器人的板载电脑，用 tmux 管理多个终端会话**。

为什么是 tmux 而不是开多个 SSH 连接？因为一个 ROS 2 项目通常需要同时运行十几个节点 - SLAM 一个终端、Nav2 一个终端、感知模型一个终端、手臂控制一个终端、行为树一个终端……你需要同时看到它们所有的日志输出，还需要随时切换到某个终端去敲命令。更关键的是，如果你的 SSH 连接断了（WiFi 不稳定是常态），tmux 里的会话不会死 - 机器人上的程序继续跑着，你重新连上就能恢复。

一个典型的 tmux 工作流：

```bash
# SSH 连进机器人
ssh robot@192.168.1.100

# 创建或恢复 tmux session
tmux new-session -s debug    # 新建
tmux attach -t debug         # 恢复已有的

# tmux 里开多个 pane
# Ctrl+b % 左右分屏
# Ctrl+b " 上下分屏
# Ctrl+b o 切换 pane
```

实际开发中，很多团队会写一个 shell 脚本，一键在 tmux 里创建预设的窗口布局，每个窗口自动启动对应的 ROS 2 节点。**tmuxinator** 是一个常用工具，它允许你用 YAML 文件定义 tmux 的窗口布局和启动命令：

```yaml
# ~/.tmuxinator/robot_debug.yml
name: robot_debug
windows:
  - slam:
      layout: even-horizontal
      panes:
        - ros2 launch slam_toolbox online_async_launch.py
        - ros2 topic echo /map_metadata
  - navigation:
      panes:
        - ros2 launch nav2_bringup navigation_launch.py
  - perception:
      panes:
        - ros2 launch my_perception perception.launch.py
  - monitoring:
      panes:
        - ros2 topic hz /scan
        - ros2 topic hz /camera/image_raw
```

然后一条 `tmuxinator start robot_debug` 就把整个调试环境拉起来了。

踩坑提醒：SSH 连机器人时的网络问题是永恒的痛。机器人通过 WiFi 连接，带宽波动大，延迟不稳定。如果你需要在 SSH 里看摄像头画面或者点云可视化，带宽可能扛不住。更好的做法是在机器人本地录 rosbag（第 19 章讲过），事后拉下来在开发机上回放分析。实时可视化能通过 Foxglove 的 WebSocket bridge 做，它对带宽的优化比 X11 转发好得多。

---

### CI/CD for Robotics - 不只是跑 lint

Web 项目的 CI 流水线你闭着眼都能写：装依赖、跑 lint、跑单元测试、跑集成测试、构建产物、部署。整个流程几分钟。

机器人项目的 CI 要复杂得多，因为你的“集成测试”可能需要在一个物理仿真引擎里跑：改了导航算法后，机器人在仿真仓库里还能不能不撞墙地走到目标点？改了抓取策略后，机器人还能不能把杯子从桌上拿起来？这些不是 mock 一下就能验证的。

一个机器人项目的 CI 流水线大致分这几层：

**第一层：静态检查**。和 Web 项目一样 - lint、格式化、类型检查。ROS 2 的 C++ 代码用 ament_lint，Python 代码用 flake8/mypy。这一层秒级完成。

**第二层：编译和单元测试**。`colcon build` 编译所有包，然后 `colcon test` 跑单元测试。C++ 项目的编译可能要十几分钟，这是和 Web 项目最直观的区别。CI 里通常会利用 **ccache**（编译缓存）来加速增量编译，把重复编译的时间从十几分钟压到一两分钟。

**第三层：仿真集成测试**。这是机器人 CI 独有的。启动一个 Gazebo 或 Isaac Sim 仿真环境，在里面跑一个预设的测试场景 - 比如“机器人从 A 点导航到 B 点，必须在 60 秒内到达且不碰撞”。这一层需要 GPU 支持（如果用 Isaac Sim），CI 机器的配置要求远高于普通 Web 项目。**industrial_ci** 是一个专门为 ROS 项目设计的 GitHub Actions 工具包，它把 Docker 镜像构建、ROS 依赖安装、编译测试打包成了开箱即用的 Action，省去了大量手写 CI 配置的工作。

实际操作中，很多团队会把前两层放在每个 PR 触发，第三层只在合并到主分支或发版时触发 - 因为仿真测试太慢（一个场景可能跑几分钟），CI 资源也有限。

```yaml
# .github/workflows/robot_ci.yml 简化示意
name: Robot CI
on: [pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-22.04
    container:
      image: ros:humble-desktop
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: |
          rosdep update
          rosdep install --from-paths src --ignore-src -y
      - name: Build
        run: |
          source /opt/ros/humble/setup.bash
          colcon build --cmake-args -DCMAKE_BUILD_TYPE=Release
      - name: Test
        run: |
          source /opt/ros/humble/setup.bash
          source install/setup.bash
          colcon test
          colcon test-result --verbose
```

这只是基础版。真实项目里你还需要处理 GPU runner、仿真环境启动、测试结果的可视化报告（比如导航轨迹图、碰撞日志）等等。

---

### colcon - ROS 2 的构建系统

如果 ROS 2 是机器人的”操作系统”，那 **colcon** 就是它的构建工具 - 类似于 npm 之于 Node.js，cargo 之于 Rust。核心命令就那么几个：`colcon build` 编译、`colcon test` 测试、`source install/setup.bash` 激活环境。看起来简单，但这个构建系统贡献了 ROS 2 新手大约一半的怀疑人生时刻。

问题出在哪？colcon 不只是编译代码，它要同时管理 C++ 包、Python 包、甚至混合语言的包，还要处理它们之间的依赖关系、消息类型生成、编译缓存。Web 开发者不会遇到这种复杂度 - `npm install` 不需要关心包 A 是用 TypeScript 写的还是用 Rust 写的。

下面几个坑，几乎每个 ROS 2 新手都会踩一遍：

**”明明编译成功了，运行说找不到包”** - 这是最高频的问题。colcon 编译完后，产物放在 `install/` 目录里，但你的终端并不知道去那里找。你必须 `source install/setup.bash`，而且**每开一个新终端都要 source 一次**。大多数人会在 `~/.bashrc` 里加一行自动 source，但如果你同时开发多个 workspace，自动 source 反而会导致混乱 - 终端 A 里 source 了 workspace B 的环境，两边的包版本打架，报错信息完全看不懂。

**”我的机器上能编译，他的机器上炸了”** - colcon 根据每个包的 `package.xml` 里声明的依赖来决定编译顺序。如果你漏声明了一个依赖，你本地可能恰好因为编译顺序碰巧对了而通过，换一台干净机器就挂。这就是为什么 CI 如此重要 - 用 `colcon build --packages-up-to my_package` 可以只编译某个包和它声明的所有依赖，帮你验证依赖声明是否完整。

**”找不到消息类型”** - 如果你定义了自定义消息（第 8 章 DDS 那章提过），消息定义包必须先编译完，用这些消息的包才能编译。colcon 理论上根据依赖声明自动排序，但实践中经常因为缓存问题翻车。你改了一个 `.msg` 文件，重新 build，结果用到这个消息的包还在用旧的生成代码。遇到这种情况，`colcon build --cmake-clean-cache` 清掉缓存重来。

**”C++ 和 Python 混在一个包里，CMakeLists.txt 写到崩溃”** - 一个包里既有 C++ 节点又有 Python 节点，构建配置的写法非常容易出错。新手建议直接把它们拆成两个独立的包，通过 topic/service 通信，等你对 CMake 和 ament 构建系统都熟悉了再考虑混合包。

还有一个影响开发体验的细节：C++ 包每次改完代码都要重新编译（这可能要几分钟），而 Python 包如果用 `colcon build --symlink-install`，改了代码不需要重新 build - 因为 `install/` 目录里的文件只是指向 `src/` 的符号链接。这个参数建议开发阶段默认开启，能省掉大量等编译的时间。

---

### 开发者的日常工作流

把以上工具串起来，一个机器人开发者的典型日常大概是这样的：

在开发机上用 Docker 容器启动 ROS 2 环境，写代码、编译、在 Gazebo 仿真里跑通。提交 PR，CI 自动跑编译和基础测试。测试通过后，SSH 进真机，在 tmux 里拉最新代码、编译、启动节点，观察真机行为。发现参数需要调，改完重新启动节点 - 不需要重新编译（如果只是改了 YAML 参数文件或 Python 代码）。确认没问题后，推到主分支，CI 跑一遍完整的仿真回归测试。

这个流程没有 Web 开发的 hot reload 那么丝滑 - C++ 编译要等，仿真启动要等，真机测试更要一遍一遍地跑。但这已经是当前行业的“最佳实践”了。工具在变好，但距离 Web 开发的 DX（Developer Experience）还有很长的路要走。这也正是为什么机器人行业需要更多有软件工程背景的人进来 - 不只是写算法，还有太多开发工具和工作流的优化空间。
