# 洪泽龙 & 成梦莹的婚礼网站

一款优雅的婚礼邀请网站，采用苹果设计语言打造。

## 概览

这款网站提供了一个简洁而强大的方式来分享您的婚礼信息，让宾客轻松参与您的特别日子。

### 特点

- 精美的苹果风格界面
- 实时婚礼倒计时
- 互动式导航体验
- 智能地图路线规划
- 宾客问答交流
- 照片与祝福分享
- 多平台设备支持

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

### 2. 个性化您的婚礼信息

编辑`index.html`，替换以下内容：

- 婚礼日期和时间
- 新人姓名
- 地点信息
- 婚礼流程安排

### 3. 设置地图位置

在`script.js`中更新您的婚礼地点：

```javascript
const weddingLocation = { lat: 42.3954, lng: -71.0892 };
const weddingAddress = "333 Greatriver Rd, MA, 02145";
```

## 部署

### 选项1：GitHub Pages

1. 将代码推送至GitHub仓库
2. 启用GitHub Pages功能
3. 您的网站将在`https://[用户名].github.io/WeddingWeb`可用

### 选项2：传统Web主机

将所有文件上传至您的Web主机根目录。

## 功能说明

### 婚礼倒计时

自动计算并显示与婚礼日期的时间差，精确到秒。

### 多平台地图导航

支持四种主流地图平台，提供智能路线规划，轻松帮助宾客找到婚礼地点。

### 问题与回答

允许宾客提出问题，新人可以回复，所有互动实时同步。

### 照片与祝福

宾客可以上传照片和留言，分享对新人的祝福。

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

`styles.css`文件包含所有视觉元素定义，您可以调整以下内容来符合您的喜好：

- 颜色主题
- 字体大小
- 间距与排版
- 动画效果
- 响应式布局

## 支持

- 浏览器支持：Safari、Chrome、Firefox、Edge的最新版本
- 设备支持：iPhone、iPad、Mac、Windows PC和Android设备

---

设计与开发：洪泽龙

© 2024 • 用爱设计 • 珍藏美好 