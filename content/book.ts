export interface Chapter {
  slug: string;
  number: number;
  fileTitle: string; // extracted from filename for display before md is loaded
}

export interface Part {
  number: number;
  title: string;
  subtitle: string;
  chapters: Chapter[];
}

export const bookTitle = "从代码到现实世界";
export const bookSubtitle = "AI 和软件开发者的机器人全栈指南";
export const bookTagline =
  "写给每一个写过 Python、训练过模型、但没没机会让一台机器在真实世界里动起来的人。";

export const parts: Part[] = [
  {
    number: 1,
    title: "全景图",
    subtitle: "先看清整座山",
    chapters: [
      { slug: "ch01_what_is_a_robot", number: 1, fileTitle: "一台机器人到底是什么？" },
      { slug: "ch02_full_stack_map", number: 2, fileTitle: "机器人开发的全栈地图" },
      { slug: "ch03_industry_players", number: 3, fileTitle: "这个行业里都有谁？" },
    ],
  },
  {
    number: 2,
    title: "硬件",
    subtitle: "机器人的身体",
    chapters: [
      { slug: "ch04_sensors", number: 4, fileTitle: "传感器" },
      { slug: "ch05_actuators", number: 5, fileTitle: "执行器" },
      { slug: "ch06_compute_platforms", number: 6, fileTitle: "计算平台" },
    ],
  },
  {
    number: 3,
    title: "操作系统",
    subtitle: "机器人的神经网络",
    chapters: [
      { slug: "ch07_ros2", number: 7, fileTitle: "ROS 2" },
      { slug: "ch08_dds", number: 8, fileTitle: "DDS 深入" },
    ],
  },
  {
    number: 4,
    title: "算法",
    subtitle: "机器人的大脑",
    chapters: [
      { slug: "ch09_slam", number: 9, fileTitle: "SLAM" },
      { slug: "ch10_nav2", number: 10, fileTitle: "Nav2" },
      { slug: "ch11_moveit", number: 11, fileTitle: "MoveIt 2" },
      { slug: "ch12_perception", number: 12, fileTitle: "感知" },
      { slug: "ch13_behavior_tree", number: 13, fileTitle: "行为树" },
    ],
  },
  {
    number: 5,
    title: "仿真与训练",
    subtitle: "在虚拟世界里先跑通",
    chapters: [
      { slug: "ch14_why_simulation", number: 14, fileTitle: "为什么需要仿真？" },
      { slug: "ch15_isaac_sim", number: 15, fileTitle: "NVIDIA Isaac Sim" },
    ],
  },
  {
    number: 6,
    title: "AI 与机器人的交汇",
    subtitle: "新范式",
    chapters: [
      { slug: "ch16_reinforcement_learning", number: 16, fileTitle: "强化学习" },
      { slug: "ch17_imitation_learning", number: 17, fileTitle: "模仿学习" },
      { slug: "ch18_foundation_models", number: 18, fileTitle: "Foundation Models" },
    ],
  },
  {
    number: 7,
    title: "工具链",
    subtitle: "开发者的日常装备",
    chapters: [
      { slug: "ch19_visualization", number: 19, fileTitle: "可视化与调试" },
      { slug: "ch20_devops", number: 20, fileTitle: "开发环境与 DevOps" },
    ],
  },
  {
    number: 8,
    title: "部署的残酷现实",
    subtitle: "从实验室到真实世界",
    chapters: [
      { slug: "ch21_deployment", number: 21, fileTitle: "真机部署" },
      { slug: "ch22_reliability", number: 22, fileTitle: "可靠性工程" },
      { slug: "ch23_fleet_management", number: 23, fileTitle: "车队管理" },
    ],
  },
  {
    number: 9,
    title: "产业现实",
    subtitle: "光鲜 Demo 背后的真相",
    chapters: [
      { slug: "ch24_business_models", number: 24, fileTitle: "商业模式" },
      { slug: "ch25_china_vs_global", number: 25, fileTitle: "中国 vs 全球" },
      { slug: "ch26_career_advice", number: 26, fileTitle: "入行建议" },
    ],
  },
];

export const allChapters = parts.flatMap((p) => p.chapters);

export function getPartForChapter(chapterNumber: number): Part | undefined {
  return parts.find((p) => p.chapters.some((c) => c.number === chapterNumber));
}

export function getAdjacentChapters(slug: string) {
  const idx = allChapters.findIndex((c) => c.slug === slug);
  return {
    prev: idx > 0 ? allChapters[idx - 1] : null,
    next: idx < allChapters.length - 1 ? allChapters[idx + 1] : null,
  };
}
