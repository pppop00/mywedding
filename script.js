// 婚礼网站JavaScript功能

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化倒计时
    initCountdown();
    
    // 初始化苹果地图
    initAppleMap();
    
    // 检查Firebase是否已准备好
    if (window.firebaseServices && window.firebaseServices.db) {
        console.log('Firebase在DOMContentLoaded时已准备好，初始化数据功能');
        // 初始化照片上传功能
        initWishesForm();
        
        // 初始化问答功能
        initQuestionsForm();
    } else {
        console.log('等待Firebase准备就绪...');
        // 等待Firebase准备就绪的事件
        document.addEventListener('firebase-ready', function() {
            console.log('Firebase准备就绪事件触发，初始化数据功能');
            // 初始化照片上传功能
            initWishesForm();
            
            // 初始化问答功能
            initQuestionsForm();
        });
    }
});

// 倒计时功能
function initCountdown() {
    // 设定婚礼日期 - 2026年1月1日
    const weddingDate = new Date('January 1, 2026 14:00:00').getTime();
    
    // 更新倒计时
    function updateCountdown() {
        // 获取当前时间
        const now = new Date().getTime();
        
        // 计算剩余时间
        const distance = weddingDate - now;
        
        // 计算天、小时、分钟和秒
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // 更新DOM元素
        document.getElementById('days').textContent = padZero(days);
        document.getElementById('hours').textContent = padZero(hours);
        document.getElementById('minutes').textContent = padZero(minutes);
        document.getElementById('seconds').textContent = padZero(seconds);
        
        // 如果时间到了，显示特殊消息
        if (distance < 0) {
            clearInterval(countdownTimer);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    // 补零函数
    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }
    
    // 立即更新一次倒计时
    updateCountdown();
    
    // 设置每秒更新一次倒计时
    const countdownTimer = setInterval(updateCountdown, 1000);
}

// 苹果地图集成
function initAppleMap() {
    // 婚礼地点坐标 (MA, 02145 附近的坐标)
    const weddingLocation = { lat: 42.3954, lng: -71.0892 }; // 马萨诸塞州 02145 区域的大致坐标
    const weddingAddress = "333 Greatriver Rd, MA, 02145"; // 实际婚礼地址
    
    // 设置地图容器的内容
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // 初始化地图容器 - 使用更真实的地图
    initRealMap(mapContainer, weddingLocation, weddingAddress);
    
    // 处理路线规划
    const getDirectionsBtn = document.getElementById('get-directions');
    const startAddressInput = document.getElementById('start-address');
    
    if (getDirectionsBtn && startAddressInput) {
        getDirectionsBtn.addEventListener('click', function() {
            const startAddress = startAddressInput.value.trim();
            if (startAddress) {
                // 创建地图链接
                const appleMapUrl = `https://maps.apple.com/?saddr=${encodeURIComponent(startAddress)}&daddr=${encodeURIComponent(weddingAddress)}&dirflg=d`;
                const googleMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startAddress)}&destination=${encodeURIComponent(weddingAddress)}`;
                const baiduMapUrl = `https://api.map.baidu.com/direction?origin=${encodeURIComponent(startAddress)}&destination=${encodeURIComponent(weddingAddress)}&mode=driving&region=美国&output=html`;
                const aMapUrl = `https://uri.amap.com/navigation?from=&to=${weddingLocation.lng},${weddingLocation.lat},${encodeURIComponent(weddingAddress)}&mode=car&policy=1`;
                
                // 创建路线选项
                showDirectionsOptions(mapContainer, {
                    apple: appleMapUrl,
                    google: googleMapUrl,
                    baidu: baiduMapUrl,
                    amap: aMapUrl
                }, startAddress, weddingAddress);
            } else {
                alert('请输入您的出发地址');
            }
        });
        
        // 添加回车键提交功能
        startAddressInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getDirectionsBtn.click();
            }
        });
    }
}

// 初始化真实地图
function initRealMap(container, location, address) {
    // 清空容器
    container.innerHTML = '';
    
    // 创建地图内容
    const mapContent = document.createElement('div');
    mapContent.className = 'real-map';
    
    try {
        // 使用Trinity College教堂背景
        const fallbackMap = document.createElement('div');
        fallbackMap.className = 'fallback-map';
        fallbackMap.setAttribute('aria-label', '婚礼地点地图');
        mapContent.appendChild(fallbackMap);
    } catch (e) {
        console.error('加载地图背景失败', e);
        // 如果加载失败，使用备用颜色背景
        const fallbackMap = document.createElement('div');
        fallbackMap.className = 'fallback-map';
        fallbackMap.style.backgroundColor = '#f5f5f7';
        mapContent.appendChild(fallbackMap);
    }
    
    // 添加地图中心标记和呼吸效果
    const marker = document.createElement('div');
    marker.className = 'map-marker';
    marker.innerHTML = '<div class="marker-pin"></div><div class="marker-pulse"></div>';
    mapContent.appendChild(marker);
    
    // 添加地址信息
    const addressOverlay = document.createElement('div');
    addressOverlay.className = 'map-address-overlay';
    addressOverlay.innerHTML = `
        <h3>婚礼地点</h3>
        <p>${address}</p>
    `;
    mapContent.appendChild(addressOverlay);
    
    container.appendChild(mapContent);
    
    // 添加地图说明
    const mapInfo = document.createElement('div');
    mapInfo.className = 'map-info';
    mapInfo.innerHTML = `
        <p>上方显示的是婚礼地点位置。要获取详细的方位和路线，请在上方输入您的出发地址。</p>
    `;
    container.appendChild(mapInfo);
}

// 显示路线规划选项
function showDirectionsOptions(container, mapUrls, startAddress, destAddress) {
    // 创建路线选项区域
    const directionsOptions = document.createElement('div');
    directionsOptions.className = 'directions-options';
    
    // 顶部信息
    const infoSection = document.createElement('div');
    infoSection.className = 'directions-info';
    infoSection.innerHTML = `
        <h3>您的路线规划</h3>
        <p class="route-details">从 <span class="address-highlight">${startAddress}</span> 到 <span class="address-highlight">${destAddress}</span></p>
    `;
    
    // 地图选项按钮
    const buttonsSection = document.createElement('div');
    buttonsSection.className = 'map-options-grid';
    
    // 添加苹果地图选项
    const appleOption = createMapOption(
        'apple-maps-btn',
        '苹果地图',
        'Apple Maps',
        mapUrls.apple
    );
    
    // 添加谷歌地图选项
    const googleOption = createMapOption(
        'google-maps-btn',
        '谷歌地图',
        'Google Maps',
        mapUrls.google
    );
    
    // 添加百度地图选项
    const baiduOption = createMapOption(
        'baidu-maps-btn',
        '百度地图',
        'Baidu Maps',
        mapUrls.baidu
    );
    
    // 添加高德地图选项
    const amapOption = createMapOption(
        'amap-btn',
        '高德地图',
        'AMap',
        mapUrls.amap
    );
    
    // 添加所有选项到按钮区
    buttonsSection.appendChild(appleOption);
    buttonsSection.appendChild(googleOption);
    buttonsSection.appendChild(baiduOption);
    buttonsSection.appendChild(amapOption);
    
    // 组合所有元素
    directionsOptions.appendChild(infoSection);
    directionsOptions.appendChild(buttonsSection);
    
    // 替换容器内容
    container.innerHTML = '';
    container.appendChild(directionsOptions);
    
    // 恢复地图按钮
    const backBtn = document.createElement('button');
    backBtn.className = 'back-to-map-btn';
    backBtn.textContent = '返回地图视图';
    backBtn.addEventListener('click', function() {
        const weddingLocation = { lat: 42.3954, lng: -71.0892 };
        const weddingAddress = "333 Greatriver Rd, MA, 02145";
        initRealMap(container, weddingLocation, weddingAddress);
    });
    
    container.appendChild(backBtn);
}

// 创建单个地图选项
function createMapOption(className, title, subtitle, url) {
    const option = document.createElement('a');
    option.href = url;
    option.target = "_blank";
    option.rel = "noopener noreferrer";
    option.className = `map-option ${className}`;
    
    const content = document.createElement('div');
    content.className = 'map-option-content';
    
    // 添加地图图标
    const iconElement = document.createElement('div');
    iconElement.className = 'map-option-icon';
    
    // 根据不同地图类型设置不同图标
    if (className === 'apple-maps-btn') {
        iconElement.innerHTML = '<i class="fas fa-map-marked-alt"></i>';
    } else if (className === 'google-maps-btn') {
        iconElement.innerHTML = '<i class="fab fa-google"></i>';
    } else if (className === 'baidu-maps-btn') {
        iconElement.innerHTML = '<i class="fas fa-map-pin"></i>';
    } else if (className === 'amap-btn') {
        iconElement.innerHTML = '<i class="fas fa-location-arrow"></i>';
    }
    
    const titleElement = document.createElement('div');
    titleElement.className = 'map-option-title';
    titleElement.textContent = title;
    
    const subtitleElement = document.createElement('div');
    subtitleElement.className = 'map-option-subtitle';
    subtitleElement.textContent = subtitle;
    
    content.appendChild(iconElement);
    content.appendChild(titleElement);
    content.appendChild(subtitleElement);
    option.appendChild(content);
    
    return option;
}

// 祝福表单功能
function initWishesForm() {
    // 获取Firebase服务
    if (!window.firebaseServices) {
        console.error('Firebase服务尚未加载，祝福功能将无法正常工作');
        return;
    }
    
    const { 
        db, 
        collection, 
        addDoc, 
        getDocs, 
        serverTimestamp,
        query,
        orderBy,
        onSnapshot,
        where,
        storage
    } = window.firebaseServices;
    
    console.log('已成功获取Firebase服务用于祝福功能');
    
    // 创建加载指示器
    function createLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>正在上传照片，请稍候...</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .loading-indicator {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.8);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, Arial;
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f5f5f7;
                border-top: 4px solid #0071e3;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }
            .progress-bar {
                width: 80%;
                max-width: 300px;
                height: 6px;
                background-color: #f5f5f7;
                border-radius: 3px;
                margin-top: 10px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                width: 0%;
                background-color: #0071e3;
                transition: width 0.3s ease;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
        return loadingDiv;
    }
    
    // 更新进度指示器
    function updateProgress(loadingDiv, progress) {
        const progressFill = loadingDiv.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${Math.round(progress)}%`;
        }
    }
    
    const wishesForm = document.getElementById('wishes-form');
    const wishesList = document.getElementById('wishes-list');
    
    if (!wishesForm || !wishesList) {
        console.error('祝福表单或祝福列表元素不存在');
        return;
    }
    
    console.log('祝福表单已初始化');
    
    // 清空示例祝福
    wishesList.innerHTML = '';
    
    // 从Firebase加载祝福
    loadWishesFromFirebase();
    
    // 实时监听新祝福
    setupWishesListener();
    
    if (wishesForm) {
        wishesForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('name').value.trim();
            const message = document.getElementById('message').value.trim();
            const photoInput = document.getElementById('photo');
            
            if (!name || !message) {
                alert('请填写您的姓名和祝福语');
                return;
            }
            
            // 禁用提交按钮防止重复提交
            const submitBtn = wishesForm.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';
            
            try {
                if (photoInput.files && photoInput.files[0]) {
                    const file = photoInput.files[0];
                    // 文件大小限制（5MB）
                    const MAX_FILE_SIZE = 5 * 1024 * 1024;
                    
                    if (file.size > MAX_FILE_SIZE) {
                        showErrorMessage('图片大小不能超过5MB，请重新选择较小的图片');
                        submitBtn.disabled = false;
                        submitBtn.textContent = '发送祝福';
                        return;
                    }
                    
                    // 显示加载指示器
                    const loadingIndicator = createLoadingIndicator();
                    document.body.appendChild(loadingIndicator);
                    
                    // 创建唯一的文件名
                    const timestamp = new Date().getTime();
                    const fileName = `wishes/${timestamp}_${file.name}`;
                    
                    // 上传到Firebase Storage
                    const storageRef = storage.ref(fileName);
                    const uploadTask = storageRef.put(file);
                    
                    // 监听上传进度
                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            // 更新进度
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            updateProgress(loadingIndicator, progress);
                            console.log('上传进度: ' + progress + '%');
                        }, 
                        (error) => {
                            // 处理错误
                            console.error('照片上传失败:', error);
                            document.body.removeChild(loadingIndicator);
                            showErrorMessage('照片上传失败，请重试');
                            submitBtn.disabled = false;
                            submitBtn.textContent = '发送祝福';
                        }, 
                        async () => {
                            // 上传完成，获取下载URL
                            try {
                                const photoURL = await uploadTask.snapshot.ref.getDownloadURL();
                                console.log('照片上传成功，URL:', photoURL);
                                
                                // 添加祝福到Firebase (带照片URL)
                                const wishId = await addWishToFirebase(name, message, photoURL);
                                
                                // 移除加载指示器
                                document.body.removeChild(loadingIndicator);
                                
                                // 重置表单
                                wishesForm.reset();
                                
                                // 显示成功消息
                                showSuccessMessage(wishesForm, '感谢您的祝福！');
                                
                                // 恢复提交按钮
                                submitBtn.disabled = false;
                                submitBtn.textContent = '发送祝福';
                            } catch (error) {
                                console.error('获取照片URL失败:', error);
                                document.body.removeChild(loadingIndicator);
                                showErrorMessage('提交失败，请重试');
                                submitBtn.disabled = false;
                                submitBtn.textContent = '发送祝福';
                            }
                        }
                    );
                    
                } else {
                    // 无照片的祝福
                    const wishId = await addWishToFirebase(name, message, null);
                    
                    // 重置表单
                    wishesForm.reset();
                    
                    // 显示成功消息
                    showSuccessMessage(wishesForm, '感谢您的祝福！');
                    
                    // 恢复提交按钮
                    submitBtn.disabled = false;
                    submitBtn.textContent = '发送祝福';
                }
            } catch (error) {
                console.error('提交祝福时出错:', error);
                showErrorMessage('提交失败，请重试');
                submitBtn.disabled = false;
                submitBtn.textContent = '发送祝福';
            }
        });
    }
    
    // 从Firebase加载祝福
    async function loadWishesFromFirebase() {
        try {
            console.log('正在从Firebase加载祝福...');
            
            // 创建一个按时间戳降序排序的查询
            const wishesRef = collection("wishes");
            console.log('wishes集合引用创建成功', wishesRef);
            
            const q = query(wishesRef, orderBy("timestamp", "desc"));
            console.log('构建祝福查询对象成功', q);
            
            // 执行查询
            console.log('正在执行祝福查询...');
            const querySnapshot = await getDocs(q);
            console.log('祝福查询执行完成', querySnapshot);
            
            if (querySnapshot.empty) {
                console.log('没有找到祝福');
                return;
            }
            
            console.log(`从Firebase加载了 ${querySnapshot.size} 条祝福`);
            
            // 清空祝福列表
            wishesList.innerHTML = '';
            
            // 添加每条祝福到列表
            querySnapshot.forEach((docSnapshot) => {
                console.log('处理祝福文档:', docSnapshot.id);
                const wishData = docSnapshot.data();
                console.log('祝福数据:', wishData);
                const wishElement = createWishElement(wishData);
                wishesList.appendChild(wishElement);
            });
        } catch (error) {
            console.error('加载祝福时出错:', error);
            console.error('错误详情:', error.message, error.code);
            console.error('错误堆栈:', error.stack);
        }
    }
    
    // 设置实时监听
    function setupWishesListener() {
        const wishesRef = collection("wishes");
        const q = query(wishesRef, orderBy("timestamp", "desc"));
        
        onSnapshot(q, (querySnapshot) => {
            // 处理刚刚添加的新祝福
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const wishData = change.doc.data();
                    
                    // 检查是否已存在此祝福（避免重复添加）
                    let existingWishTimestamp = 0;
                    
                    // 处理不同类型的timestamp
                    if (wishData.timestamp) {
                        if (typeof wishData.timestamp.toMillis === 'function') {
                            existingWishTimestamp = wishData.timestamp.toMillis();
                        } else if (wishData.timestamp.seconds) {
                            existingWishTimestamp = wishData.timestamp.seconds * 1000;
                        } else if (wishData.timestamp._seconds) {
                            existingWishTimestamp = wishData.timestamp._seconds * 1000;
                        } else if (typeof wishData.timestamp === 'number') {
                            existingWishTimestamp = wishData.timestamp;
                        }
                    }
                    
                    console.log('新祝福时间戳:', existingWishTimestamp);
                    
                    const existingWishes = wishesList.querySelectorAll('.wish-item');
                    let isDuplicate = false;
                    
                    for (let i = 0; i < existingWishes.length; i++) {
                        const existingWish = existingWishes[i];
                        const timestamp = existingWish.getAttribute('data-timestamp');
                        if (timestamp && parseInt(timestamp) === existingWishTimestamp) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    
                    if (!isDuplicate) {
                        console.log('新祝福已添加');
                        const wishElement = createWishElement(wishData);
                        wishesList.insertBefore(wishElement, wishesList.firstChild);
                    }
                }
            });
        }, (error) => {
            console.error('监听祝福变化时出错:', error);
        });
    }
    
    // 添加祝福到Firebase
    async function addWishToFirebase(name, message, photoURL) {
        try {
            // 创建新祝福对象
            const newWish = {
                name: name,
                message: message,
                photoURL: photoURL, // 现在这将是Storage中的URL，而非DataURL
                date: new Date().toLocaleDateString('zh-CN'),
                timestamp: serverTimestamp()
            };
            
            // 添加到Firebase
            const wishesRef = collection("wishes");
            const docRef = await addDoc(wishesRef, newWish);
            console.log('祝福已保存到Firebase, ID:', docRef.id);
            
            // 不需要手动添加DOM元素，监听器会处理这个
            return docRef.id;
        } catch (error) {
            console.error('添加祝福到Firebase时出错:', error);
            console.error('错误详情:', error.message, error.code);
            throw error; // 重新抛出错误以便调用者处理
        }
    }
    
    // 创建祝福元素
    function createWishElement(wishData) {
        const wishElement = document.createElement('div');
        wishElement.className = 'wish-item';
        
        // 保存时间戳用于去重
        if (wishData.timestamp) {
            let timestampValue = 0;
            
            // 处理不同类型的timestamp
            if (typeof wishData.timestamp.toMillis === 'function') {
                // Firestore Timestamp对象
                timestampValue = wishData.timestamp.toMillis();
            } else if (wishData.timestamp.seconds) {
                // Firestore Timestamp原始格式
                timestampValue = wishData.timestamp.seconds * 1000;
            } else if (wishData.timestamp._seconds) {
                // 另一种Firestore格式
                timestampValue = wishData.timestamp._seconds * 1000;
            } else if (typeof wishData.timestamp === 'number') {
                // 已经是毫秒时间戳
                timestampValue = wishData.timestamp;
            } else {
                // 回退到日期字符串
                timestampValue = new Date(wishData.date || Date.now()).getTime();
            }
            
            wishElement.setAttribute('data-timestamp', timestampValue);
            console.log('祝福时间戳值:', timestampValue);
        }
        
        // 如果有照片，添加照片
        if (wishData.photoURL) {
            const photoElement = document.createElement('div');
            photoElement.className = 'wish-photo';
            photoElement.innerHTML = `<img src="${wishData.photoURL}" alt="${wishData.name}的照片">`;
            wishElement.appendChild(photoElement);
        }
        
        // 添加祝福内容
        const contentElement = document.createElement('div');
        contentElement.className = 'wish-content';
        contentElement.innerHTML = `
            <div class="wish-name">${wishData.name}</div>
            <div class="wish-message">${wishData.message}</div>
            <div class="wish-date">${wishData.date}</div>
        `;
        
        wishElement.appendChild(contentElement);
        return wishElement;
    }
}

// 平滑滚动功能
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // 考虑导航栏的高度
                behavior: 'smooth'
            });
        }
    });
});

// 问答功能
function initQuestionsForm() {
    const questionForm = document.getElementById('question-form');
    const questionsList = document.getElementById('questions-list');
    
    if (!questionForm || !questionsList) {
        console.error('问答表单初始化失败: 表单元素或列表元素不存在');
        return;
    }
    
    console.log('问答表单已初始化');
    
    // 添加编辑状态标记
    let isEditing = false;
    let editingQuestionId = null;
    const originalSubmitBtn = questionForm.querySelector('.ask-btn').textContent;
    
    // 确保Firebase已经加载
    if (!window.firebaseServices) {
        console.error('Firebase服务尚未加载，请稍后再试');
        return;
    }
    
    const { 
        db, 
        collection, 
        addDoc, 
        getDocs, 
        getDoc,
        doc, 
        deleteDoc, 
        updateDoc, 
        query, 
        orderBy, 
        onSnapshot,
        serverTimestamp,
        where
    } = window.firebaseServices;
    
    console.log('已成功获取Firebase服务用于问答功能');
    
    // 清空示例问题
    questionsList.innerHTML = '';
    
    // 从Firebase加载问题
    loadQuestionsFromFirebase();
    
    // 实时监听新问题
    setupQuestionsListener();
    
    // 从Firebase加载问题
    async function loadQuestionsFromFirebase() {
        try {
            console.log('正在从Firebase加载问题...');
            
            // 创建一个按时间戳降序排序的查询
            const questionsRef = collection("questions");
            console.log('questions集合引用创建成功', questionsRef);
            
            // 修复查询方法
            const q = query(questionsRef, orderBy("timestamp", "desc"));
            console.log('构建查询对象成功', q);
            
            // 执行查询
            console.log('正在执行查询...');
            const querySnapshot = await getDocs(q);
            console.log('查询执行完成', querySnapshot);
            
            if (querySnapshot.empty) {
                console.log('没有找到问题');
                return;
            }
            
            console.log(`从Firebase加载了 ${querySnapshot.size} 个问题`);
            
            // 清空问题列表
            questionsList.innerHTML = '';
            
            // 添加每个问题到列表
            querySnapshot.forEach((docSnapshot) => {
                console.log('处理问题文档:', docSnapshot.id);
                const questionData = docSnapshot.data();
                console.log('问题数据:', questionData);
                questionData.id = docSnapshot.id;  // 使用Firebase的文档ID
                
                // 创建问题元素并添加到列表
                const questionElement = createQuestionElement(questionData);
                questionsList.appendChild(questionElement);
            });
        } catch (error) {
            console.error('加载问题时出错:', error);
            console.error('错误详情:', error.message, error.code);
            console.error('错误堆栈:', error.stack);
        }
    }
    
    // 设置实时监听
    function setupQuestionsListener() {
        const questionsRef = collection("questions");
        const q = query(questionsRef, orderBy("timestamp", "desc"));
        
        onSnapshot(q, (querySnapshot) => {
            // 处理刚刚添加的新问题
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const questionData = change.doc.data();
                    questionData.id = change.doc.id;
                    
                    // 检查是否已存在此问题（避免重复添加）
                    const existingQuestion = document.querySelector(`.question-item[data-id="${questionData.id}"]`);
                    if (!existingQuestion) {
                        console.log('新问题已添加:', questionData.id);
                        const questionElement = createQuestionElement(questionData);
                        questionsList.insertBefore(questionElement, questionsList.firstChild);
                    }
                }
                
                if (change.type === "modified") {
                    const questionData = change.doc.data();
                    questionData.id = change.doc.id;
                    
                    // 更新已存在的问题
                    const questionElement = document.querySelector(`.question-item[data-id="${questionData.id}"]`);
                    if (questionElement) {
                        console.log('问题已更新:', questionData.id);
                        const updatedElement = createQuestionElement(questionData);
                        questionElement.replaceWith(updatedElement);
                    }
                }
                
                if (change.type === "removed") {
                    const questionId = change.doc.id;
                    
                    // 移除已删除的问题
                    const questionElement = document.querySelector(`.question-item[data-id="${questionId}"]`);
                    if (questionElement) {
                        console.log('问题已删除:', questionId);
                        questionElement.remove();
                    }
                }
            });
        }, (error) => {
            console.error('监听问题变化时出错:', error);
        });
    }
    
    // 提交问题表单
    questionForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止表单默认提交行为
        console.log('提交问题表单');
        
        const nameInput = document.getElementById('questioner-name');
        const questionInput = document.getElementById('question-text');
        
        if (!nameInput || !questionInput) {
            console.error('表单元素不存在');
            return;
        }
        
        const name = nameInput.value.trim();
        const question = questionInput.value.trim();
        
        console.log(`提交的问题：${name} - ${question}`);
        
        if (name && question) {
            if (isEditing && editingQuestionId) {
                // 更新Firebase中的问题
                updateQuestionInFirebase(editingQuestionId, name, question);
                
                // 重置编辑状态
                isEditing = false;
                editingQuestionId = null;
                questionForm.querySelector('.ask-btn').textContent = originalSubmitBtn;
                
                // 显示成功消息
                showSuccessMessage(questionForm, '问题已更新！');
                console.log('问题已更新');
            } else {
                // 添加问题到Firebase
                addQuestionToFirebase(name, question);
                
                // 显示成功消息
                showSuccessMessage(questionForm, '问题提交成功！我们会尽快回复。');
                console.log('问题提交成功');
            }
            
            // 重置表单
            questionForm.reset();
        } else {
            console.error('表单验证失败：姓名或问题为空');
        }
    });
    
    // 添加问题到Firebase
    async function addQuestionToFirebase(name, questionText) {
        try {
            // 创建新问题对象
            const newQuestion = {
                name: name,
                question: questionText,
                date: new Date().toLocaleDateString('zh-CN'),
                timestamp: serverTimestamp(), // 使用服务器时间戳
                answer: null,
                answerDate: null,
                answered: false
            };
            
            // 添加到Firebase
            const questionsRef = collection("questions");
            const docRef = await addDoc(questionsRef, newQuestion);
            console.log('问题已保存到Firebase, ID:', docRef.id);
            
            // 不需要手动添加DOM元素，监听器会处理这个
        } catch (error) {
            console.error('添加问题到Firebase时出错:', error);
            console.error('错误详情:', error.message, error.code);
        }
    }
    
    // 更新Firebase中的问题
    async function updateQuestionInFirebase(questionId, name, questionText) {
        try {
            const questionRef = doc(db, "questions", questionId);
            
            await updateDoc(questionRef, {
                name: name,
                question: questionText,
                date: new Date().toLocaleDateString('zh-CN'),
                updatedAt: serverTimestamp()
            });
            
            console.log('问题已在Firebase中更新');
            
            // 不需要手动更新DOM，监听器会处理这个
        } catch (error) {
            console.error('更新Firebase中的问题时出错:', error);
            console.error('错误详情:', error.message, error.code);
        }
    }
    
    // 编辑和删除问题功能
    questionsList.addEventListener('click', function(e) {
        // 删除按钮
        if (e.target.classList.contains('delete-btn')) {
            const questionId = e.target.getAttribute('data-id');
            if (questionId && confirm('确定要删除这个问题吗？')) {
                deleteQuestionFromFirebase(questionId);
            }
        }
        
        // 编辑按钮
        if (e.target.classList.contains('edit-btn')) {
            const questionId = e.target.getAttribute('data-id');
            if (questionId) {
                loadQuestionForEdit(questionId);
            }
        }
    });
    
    // 从Firebase删除问题
    async function deleteQuestionFromFirebase(questionId) {
        try {
            await deleteDoc(doc(db, "questions", questionId));
            console.log('问题已从Firebase删除');
            
            // 不需要手动从DOM移除，监听器会处理这个
        } catch (error) {
            console.error('从Firebase删除问题时出错:', error);
        }
    }
    
    // 加载问题到表单进行编辑
    async function loadQuestionForEdit(questionId) {
        try {
            const questionRef = doc(db, "questions", questionId);
            const docSnap = await getDoc(questionRef);
            
            if (docSnap.exists) {
                const questionData = docSnap.data();
                
                // 将问题数据填充到表单
                document.getElementById('questioner-name').value = questionData.name;
                document.getElementById('question-text').value = questionData.question;
                
                // 更新按钮文本和状态
                questionForm.querySelector('.ask-btn').textContent = '更新问题';
                isEditing = true;
                editingQuestionId = questionId;
                
                // 滚动到表单位置
                questionForm.scrollIntoView({ behavior: 'smooth' });
                
                console.log(`加载问题进行编辑: ${questionId}`);
            } else {
                console.error('找不到问题:', questionId);
            }
        } catch (error) {
            console.error('加载问题进行编辑失败:', error);
            console.error('错误详情:', error.message, error.code);
        }
    }
    
    // 从localStorage迁移问题到Firebase (如果需要)
    async function migrateQuestionsFromLocalStorage() {
        const savedQuestions = localStorage.getItem('weddingQuestions');
        if (!savedQuestions) {
            console.log('本地没有保存的问题，无需迁移');
            return;
        }
        
        try {
            const questions = JSON.parse(savedQuestions);
            console.log(`正在迁移 ${questions.length} 个问题到Firebase...`);
            
            for (const question of questions) {
                // 检查问题是否已添加到Firebase (使用ID作为检查)
                const questionsRef = collection("questions");
                const q = query(questionsRef, where("localId", "==", question.id));
                
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    // 问题尚未添加到Firebase
                    const firestoreQuestion = {
                        name: question.name,
                        question: question.question,
                        date: question.date,
                        localId: question.id, // 保存本地ID以防止重复迁移
                        timestamp: new Date(question.date),
                        answer: question.answer,
                        answerDate: question.answerDate,
                        answered: question.answer ? true : false
                    };
                    
                    await addDoc(collection("questions"), firestoreQuestion);
                    console.log(`问题已迁移 ID: ${question.id}`);
                } else {
                    console.log(`问题已存在，跳过: ${question.id}`);
                }
            }
            
            console.log('迁移完成，正在清除localStorage...');
            localStorage.removeItem('weddingQuestions');
        } catch (error) {
            console.error('迁移问题时出错:', error);
        }
    }
    
    // 尝试迁移本地问题
    setTimeout(migrateQuestionsFromLocalStorage, 3000);
}

// 创建问题元素
function createQuestionElement(questionData) {
    const questionElement = document.createElement('div');
    questionElement.className = 'question-item';
    questionElement.setAttribute('data-id', questionData.id);
    
    let html = `
        <div class="question-header">
            <span class="questioner">${questionData.name}</span>
            <span class="question-date">${questionData.date}</span>
        </div>
        <p class="question-content">${questionData.question}</p>
    `;
    
    // 如果有回答，显示回答内容
    if (questionData.answer) {
        html += `
            <div class="answer">
                <p class="answer-content">${questionData.answer}</p>
                <div class="answer-meta">
                    <span class="answer-by">洪泽龙 & 成梦莹</span>
                    <span class="answer-date">${questionData.answerDate || ''}</span>
                </div>
            </div>
        `;
    }
    
    // 管理员控制按钮部分已移除，普通用户无法看到编辑和删除按钮
    
    questionElement.innerHTML = html;
    return questionElement;
}

// 显示成功消息
function showSuccessMessage(formElement, message) {
    // 移除已有的成功消息
    const existingMessage = formElement.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建成功消息
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    formElement.appendChild(successMessage);
    
    // 3秒后移除成功消息
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// 显示错误消息
function showErrorMessage(message) {
    // 创建错误消息容器
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message-container';
    
    // 设置样式
    Object.assign(errorContainer.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 59, 48, 0.95)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, Arial',
        fontSize: '14px',
        maxWidth: '90%',
        textAlign: 'center',
        animationName: 'errorSlideIn',
        animationDuration: '0.3s'
    });
    
    // 添加消息内容
    errorContainer.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes errorSlideIn {
            from { transform: translate(-50%, 100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
    `;
    
    // 添加到文档
    document.head.appendChild(style);
    document.body.appendChild(errorContainer);
    
    // 自动移除
    setTimeout(() => {
        errorContainer.style.opacity = '0';
        errorContainer.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            if (document.body.contains(errorContainer)) {
                document.body.removeChild(errorContainer);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 300);
    }, 4000);
}