# 洪泽龙 & 成梦莹的婚礼网站

这是一个以苹果风格设计的婚礼网站，采用纯HTML、CSS和JavaScript构建。网站包含婚礼倒计时、邀请函、婚礼流程、地点导航以及嘉宾祝福留言功能。

## 功能特点

- **苹果风格设计**：精美简约的UI设计，采用苹果官方字体和设计语言
- **婚礼倒计时**：自动计算并显示距离婚礼还有多少天、时、分、秒
- **电子邀请函**：优雅的婚礼邀请信息展示
- **婚礼流程**：时间线形式展示婚礼当天的活动安排
- **婚礼地点**：集成Google地图，方便宾客查找地点
- **祝福留言墙**：允许宾客上传照片和祝福语
- **One More Thing**：特别视频展示区域
- **响应式设计**：完美适配各种设备，从手机到桌面电脑

## 如何使用

1. 克隆或下载本仓库到您的计算机
2. 打开`index.html`文件在浏览器中预览网站
3. 根据需要修改内容和样式

## 自定义说明

### 修改婚礼信息

编辑`index.html`文件，更新以下内容：

- 新人姓名
- 婚礼日期和时间
- 婚礼地点
- 婚礼流程安排

### 修改倒计时

在`script.js`文件中，找到并修改婚礼日期：

```js
const weddingDate = new Date('January 1, 2026 14:00:00').getTime();
```

### 设置Google地图

1. 申请[Google Maps JavaScript API密钥](https://developers.google.com/maps/documentation/javascript/get-api-key)
2. 在`script.js`文件中，找到以下代码并替换YOUR_API_KEY：

```js
script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initGoogleMap';
```

3. 更新婚礼地点坐标：

```js
const weddingLocation = { lat: 39.9042, lng: 116.4074 }; // 替换为实际婚礼地点坐标
```

### 添加婚礼视频

在`index.html`文件中，找到"One More Thing"部分并替换视频占位符：

```html
<div class="video-wrapper">
    <!-- 将下面的占位符替换为实际视频 -->
    <p class="video-placeholder">视频即将上线</p>
    
    <!-- 添加视频，例如： -->
    <!-- <video controls>
         <source src="your-video.mp4" type="video/mp4">
         您的浏览器不支持视频播放。
    </video> -->
</div>
```

### 修改样式

所有样式都在`styles.css`文件中定义，您可以根据自己的喜好修改颜色、字体大小、间距等。

## 技术说明

- **HTML5**：页面结构
- **CSS3**：样式和动画，包括Flexbox、Grid布局和响应式设计
- **JavaScript**：交互功能，包括倒计时、地图集成和照片上传
- **Google Maps API**：地图集成
- **FileReader API**：本地照片预览功能

## 注意事项

- 本网站是为演示目的设计的静态网站，不包含服务器端功能
- 照片上传功能仅在本地预览，不会实际上传到服务器
- 要实现真正的照片上传和存储功能，需要添加服务器端代码

## 授权

您可以自由使用、修改和分发这个网站模板，用于您自己的婚礼或其他个人用途。

---

祝您的婚礼圆满成功！ 