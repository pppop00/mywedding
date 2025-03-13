# 多功能活动网站模板

一款优雅的活动邀请网站，采用苹果设计语言打造，适用于婚礼、聚会和各类活动。

## 概览

这款网站提供了一个简洁而强大的方式来分享您的特别活动信息，让宾客轻松参与您的重要日子。

### 特点

- 精美的苹果风格界面
- 实时活动倒计时
- 互动式导航体验
- 智能地图路线规划
- 访客问答交流
- 照片与祝福分享
- 多平台设备支持

## 多功能应用场景

这个模板不仅适用于婚礼，还可用于以下场景：

### 1. 企业活动

- 产品发布会
- 年度庆典
- 客户答谢会
- 研讨会和工作坊

### 2. 个人庆典

- 生日派对
- 周年庆典
- 毕业典礼
- 退休庆祝

### 3. 社交聚会

- 同学会
- 家庭聚会
- 社区活动
- 俱乐部活动

### 4. 文化艺术活动

- 音乐会
- 艺术展览
- 电影首映
- 书籍发布

## 根据不同场景的定制指南

### 婚礼网站
- 保持现有的倒计时和地图功能
- 重点展示新人信息和婚礼流程
- 使用浪漫色调的设计风格

### 企业活动
- 修改色彩为公司品牌色
- 将"祝福留言"改为"反馈意见"
- 添加公司logo和产品信息
- 增加注册和签到功能

### 生日派对
- 调整为活泼的色彩风格
- 将"婚礼流程"改为"派对议程"
- 添加礼物心愿单功能
- 增加派对主题展示

### 同学聚会
- 添加照片墙功能
- 将问答区改为共享回忆区
- 保留地图功能帮助找到聚会地点
- 增加参与者名单展示

## 技术

该项目基于现代Web技术构建，融合了多种交互功能：

- **前端**：HTML5, CSS3, JavaScript
- **地图集成**：苹果地图, 谷歌地图, 百度地图, 高德地图
- **数据存储**：Firebase Firestore
- **媒体存储**：Firebase Storage
- **认证**：Firebase Authentication

## 开始使用

### 1. 配置您的Firebase项目

```javascript
// 1. 创建新的Firebase项目
// 2. 在index.html中找到并替换以下配置
const firebaseConfig = {
    apiKey: "您的API密钥",
    authDomain: "您的域名.firebaseapp.com",
    projectId: "您的项目ID",
    storageBucket: "您的存储桶名称",
    messagingSenderId: "您的消息发送者ID",
    appId: "您的应用ID"
};
```

### 2. 个性化您的活动信息

编辑`index.html`，替换以下内容：

- 活动名称和描述
- 活动日期和时间
- 主办方信息
- 地点信息
- 活动日程安排

### 3. 设置地图位置

在`script.js`中更新您的活动地点：

```javascript
const eventLocation = { lat: 42.3954, lng: -71.0892 };
const eventAddress = "333 Greatriver Rd, MA, 02145";
```

## 部署

### 选项1：GitHub Pages

1. 将代码推送至GitHub仓库
2. 启用GitHub Pages功能
3. 您的网站将在`https://[用户名].github.io/EventWeb`可用

### 选项2：传统Web主机

将所有文件上传至您的Web主机根目录。

## 核心功能说明

### 活动倒计时

自动计算并显示与活动日期的时间差，精确到秒。

### 多平台地图导航

支持四种主流地图平台，提供智能路线规划，轻松帮助参与者找到活动地点。

### 问题与回答

允许参与者提出问题，主办方可以回复，所有互动实时同步。

### 照片与祝福/留言

参与者可以上传照片和留言，分享对活动的期待或感想。

## 安全设置

### Firestore规则

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null || true;
    }
  }
}
```

### Storage规则

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /wishes/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## 自定义外观

`styles.css`文件包含所有视觉元素定义，您可以调整以下内容来符合您的活动主题：

- 颜色主题
- 字体大小
- 间距与排版
- 动画效果
- 响应式布局

## 支持

- 浏览器支持：Safari、Chrome、Firefox、Edge的最新版本
- 设备支持：iPhone、iPad、Mac、Windows PC和Android设备

---

原设计：洪泽龙

© 2025 • 用爱设计 • 珍藏美好 