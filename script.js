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
        // 初始化祝福表单功能
        initWishesForm();
        
        // 初始化问答功能
        initQuestionsForm();
        
        // 延迟执行迁移，确保Firebase已经完全初始化
        setTimeout(migrateRSVPWishesData, 3000);
    } else {
        console.log('等待Firebase准备就绪...');
        // 等待Firebase准备就绪的事件
        document.addEventListener('firebase-ready', function() {
            console.log('Firebase准备就绪事件触发，初始化数据功能');
            // 初始化祝福表单功能
            initWishesForm();
            
            // 初始化问答功能
            initQuestionsForm();
            
            // 延迟执行迁移，确保Firebase已经完全初始化
            setTimeout(migrateRSVPWishesData, 3000);
        });
    }
    
    // 初始化分段控制器，即使Firebase尚未准备好
    initRSVPCountdown();
    initSegmentedControl();
    initPhotoPreview();
    
    // 创建成功提交反馈覆盖层
    createSuccessOverlay();
    
    // 切换分段控制器选中状态的CSS类
    const segments = document.querySelectorAll('.segment-btn');
    segments.forEach(segment => {
        segment.addEventListener('click', function() {
            if (this.getAttribute('data-target') === 'wishes-tab') {
                document.querySelector('.segmented-control').classList.add('second-active');
            } else {
                document.querySelector('.segmented-control').classList.remove('second-active');
            }
        });
    });
    
    // 初始化点击第一个选项卡
    document.querySelector('.segment-btn[data-target="rsvp-tab"]').click();
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

// 出席回复与祝福功能
function initWishesForm() {
    // 获取Firebase服务
    if (!window.firebaseServices) {
        console.error('Firebase服务尚未加载，出席回复与祝福功能将无法正常工作');
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
    
    console.log('已成功获取Firebase服务用于出席回复与祝福功能');
    
    // 初始化照片预览
    initPhotoPreview();
    
    // 创建成功反馈动画的HTML元素
    createSuccessOverlay();
    
    // 初始化分段控制器
    initSegmentedControl();
    
    // 初始化表单中的照片上传功能
    function initPhotoPreview() {
        const photoInput = document.getElementById('photo');
        const previewContainer = document.getElementById('photo-preview');
        
        // 全局变量，用于存储已上传的照片
        window.uploadedPhotos = [];
        
        if (photoInput && previewContainer) {
            photoInput.addEventListener('change', function() {
                // 检查是否已经达到最大照片数量
                const totalPhotos = window.uploadedPhotos.length + this.files.length;
                const MAX_PHOTOS = 5;
                
                if (totalPhotos > MAX_PHOTOS) {
                    alert(`最多只能上传${MAX_PHOTOS}张照片`);
                    return;
                }
                
                // 显示预览区域
                previewContainer.style.display = 'block';
                
                // 如果还没有预览网格，创建一个
                if (!document.querySelector('.photo-preview-grid')) {
                    previewContainer.innerHTML = '<div class="photo-preview-grid"></div>';
                }
                
                const previewGrid = document.querySelector('.photo-preview-grid');
                
                // 添加新选择的照片到预览
                for (let i = 0; i < this.files.length; i++) {
                    const file = this.files[i];
                    
                    // 检查文件大小
                    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
                    if (file.size > MAX_FILE_SIZE) {
                        alert(`照片 "${file.name}" 大小超过5MB，请选择较小的照片`);
                        continue;
                    }
                    
                    // 添加到全局数组
                    window.uploadedPhotos.push(file);
                    
                    // 创建预览
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const previewItem = document.createElement('div');
                        previewItem.className = 'preview-item';
                        
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = '照片预览';
                        
                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'remove-photo-btn';
                        removeBtn.innerHTML = '×';
                        removeBtn.setAttribute('data-filename', file.name);
                        removeBtn.addEventListener('click', function() {
                            // 从全局数组中移除
                            const index = window.uploadedPhotos.findIndex(f => f.name === file.name);
                            if (index !== -1) {
                                window.uploadedPhotos.splice(index, 1);
                            }
                            
                            // 从预览中移除
                            previewItem.remove();
                            
                            // 如果没有照片了，隐藏预览区域
                            if (window.uploadedPhotos.length === 0) {
                                previewContainer.style.display = 'none';
                            }
                        });
                        
                        previewItem.appendChild(img);
                        previewItem.appendChild(removeBtn);
                        previewGrid.appendChild(previewItem);
                    };
                    
                    reader.readAsDataURL(file);
                }
                
                // 重置input，允许选择相同的文件
                this.value = '';
            });
        }
    }
    
    // 创建加载指示器
    function createLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>正在处理，请稍候...</p>
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
    
    // 显示错误消息
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            .error-message {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #ff3b30;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, Arial;
                animation: slideDown 0.3s ease forwards;
            }
            @keyframes slideDown {
                from { transform: translate(-50%, -20px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translate(-50%, -20px)';
            errorDiv.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                if (document.body.contains(errorDiv)) {
                    document.body.removeChild(errorDiv);
                }
            }, 300);
        }, 3000);
    }
    
    const rsvpWishesForm = document.getElementById('rsvp-wishes-form');
    const wishesList = document.getElementById('wishes-list');
    
    if (!rsvpWishesForm || !wishesList) {
        console.error('出席回复与祝福表单或列表元素不存在');
        return;
    }
    
    console.log('出席回复与祝福表单已初始化');
    
    // 清空示例祝福
    wishesList.innerHTML = '';
    
    // 从Firebase加载回复与祝福
    loadRSVPWishesFromFirebase();
    
    // 实时监听新回复与祝福
    setupRSVPWishesListener();
    
    if (rsvpWishesForm) {
        rsvpWishesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取提交按钮
            const submitBtn = document.querySelector('.submit-btn');
            
            // 禁用提交按钮，防止重复提交
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner"></div>';
            
            // 获取表单数据
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                attending: document.getElementById('attending').checked,
                guestCount: document.getElementById('attending').checked ? parseInt(document.getElementById('guest-count').value) : 0,
                dietaryRestrictions: document.getElementById('dietary-restrictions').value,
                message: document.getElementById('message').value,
                date: new Date().toLocaleDateString('zh-CN')
            };
            
            console.log('收集的表单数据:', formData);
            
            // 获取已上传的照片文件
            const photoFiles = uploadedPhotos;
            
            // 如果有照片要上传
            if (photoFiles && photoFiles.length > 0) {
                // 显示上传进度
                const progressContainer = document.createElement('div');
                progressContainer.className = 'progress-container';
                progressContainer.innerHTML = `
                    <div class="progress-bar">
                        <div class="progress" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">上传照片: 0/${photoFiles.length}</div>
                `;
                document.getElementById('photo-preview').appendChild(progressContainer);
                
                // 上传所有照片
                const uploadPromises = [];
                const photoUrls = [];
                
                for (let i = 0; i < photoFiles.length; i++) {
                    const file = photoFiles[i];
                    const storageRef = storage.ref();
                    const photoRef = storageRef.child(`wishes-photos/${Date.now()}-${file.name}`);
                    
                    // 创建上传任务
                    const uploadTask = photoRef.put(file);
                    
                    // 创建Promise以等待所有上传完成
                    const promise = new Promise((resolve, reject) => {
                        // 监听上传进度
                        uploadTask.on('state_changed', 
                            (snapshot) => {
                                // 更新当前照片的上传进度
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                console.log(`照片 ${i+1}/${photoFiles.length} 上传进度: ${progress.toFixed(1)}%`);
                                
                                // 更新总体进度
                                const totalProgress = ((i / photoFiles.length) * 100) + (progress / photoFiles.length);
                                progressContainer.querySelector('.progress').style.width = `${totalProgress}%`;
                                progressContainer.querySelector('.progress-text').textContent = `上传照片: ${i}/${photoFiles.length}`;
                            }, 
                            (error) => {
                                // 上传失败
                                console.error("照片上传失败:", error);
                                reject(error);
                            }, 
                            () => {
                                // 上传成功，获取下载URL
                                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                    photoUrls.push(downloadURL);
                                    
                                    // 更新进度文本
                                    progressContainer.querySelector('.progress-text').textContent = `上传照片: ${i+1}/${photoFiles.length}`;
                                    
                                    resolve();
                                });
                            }
                        );
                    });
                    
                    uploadPromises.push(promise);
                }
                
                // 等待所有照片上传完成
                Promise.all(uploadPromises)
                    .then(() => {
                        // 保存表单数据和照片URL到Firebase
                        return saveFormDataWithPhotos(formData, photoUrls);
                    })
                    .then((success) => {
                        if (success) {
                            // 重置表单
                            rsvpWishesForm.reset();
                            document.getElementById('photo-preview').innerHTML = '';
                            document.getElementById('photo-preview').style.display = 'none';
                            uploadedPhotos = []; // 重置上传照片数组
                            
                            // 切换到祝福留言选项卡显示提交结果
                            document.querySelector('[data-target="wishes-tab"]').click();

                            // 显示成功动画
                            showSuccessAnimation();
                        } else {
                            // 显示错误信息
                            alert('提交失败，请稍后再试');
                        }
                    })
                    .catch((error) => {
                        console.error("提交表单时出错:", error);
                        alert('提交失败，请稍后再试');
                    })
                    .finally(() => {
                        // 恢复提交按钮
                        submitBtn.disabled = false;
                        submitBtn.textContent = '提交';
                    });
            } else {
                // 无照片，直接保存表单数据
                saveFormData(formData)
                    .then((success) => {
                        if (success) {
                            // 重置表单
                            rsvpWishesForm.reset();
                            
                            // 切换到祝福留言选项卡显示提交结果
                            document.querySelector('[data-target="wishes-tab"]').click();

                            // 显示成功动画
                            showSuccessAnimation();
                        } else {
                            // 显示错误信息
                            alert('提交失败，请稍后再试');
                        }
                    })
                    .catch((error) => {
                        console.error("提交表单时出错:", error);
                        alert('提交失败，请稍后再试');
                    })
                    .finally(() => {
                        // 恢复提交按钮
                        submitBtn.disabled = false;
                        submitBtn.textContent = '提交';
                    });
            }
        });
    }
    
    // 从Firebase加载回复与祝福
    async function loadRSVPWishesFromFirebase() {
        try {
            console.log('正在从Firebase加载回复与祝福...');
            
            // 直接从rsvp-wishes集合加载
            await loadFromCollection("rsvp-wishes");
            
        } catch (error) {
            console.error('加载回复与祝福时出错:', error);
            console.error('错误详情:', error.message, error.code);
            console.error('错误堆栈:', error.stack);
        }
        
        async function loadFromCollection(collectionName) {
            try {
                // 创建一个按时间戳降序排序的查询
                const wishesRef = collection(collectionName);
                console.log(`${collectionName}集合引用创建成功`, wishesRef);
                
                const q = query(wishesRef, orderBy("timestamp", "desc"));
                console.log(`构建${collectionName}查询对象成功`, q);
                
                // 执行查询
                console.log(`正在执行${collectionName}查询...`);
                const querySnapshot = await getDocs(q);
                console.log(`${collectionName}查询执行完成`, querySnapshot);
                
                if (querySnapshot.empty) {
                    console.log(`没有找到${collectionName}记录`);
                    return;
                }
                
                console.log(`从Firebase加载了 ${querySnapshot.size} 条${collectionName}记录`);
                
                // 添加每条记录到列表
                querySnapshot.forEach((docSnapshot) => {
                    console.log('处理文档:', docSnapshot.id);
                    const data = docSnapshot.data();
                    console.log('数据:', data);
                    const element = createRSVPWishElement(data, collectionName);
                    wishesList.appendChild(element);
                });
            } catch (error) {
                console.error(`加载${collectionName}时出错:`, error);
            }
        }
    }
    
    // 设置实时监听
    function setupRSVPWishesListener() {
        // 只监听rsvp-wishes集合
        setupCollectionListener("rsvp-wishes");
        
        function setupCollectionListener(collectionName) {
            const collectionRef = collection(collectionName);
            const q = query(collectionRef, orderBy("timestamp", "desc"));
            
            onSnapshot(q, (querySnapshot) => {
                // 处理刚刚添加的新记录
                querySnapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const data = change.doc.data();
                        
                        // 获取时间戳
                        let timestampValue = getTimestampValue(data);
                        
                        // 检查是否已存在此记录（避免重复添加）
                        const existingItems = wishesList.querySelectorAll('.wish-item');
                        let isDuplicate = false;
                        
                        for (let i = 0; i < existingItems.length; i++) {
                            const existingItem = existingItems[i];
                            const timestamp = existingItem.getAttribute('data-timestamp');
                            if (timestamp && parseInt(timestamp) === timestampValue) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        
                        if (!isDuplicate) {
                            console.log('新记录已添加');
                            const element = createRSVPWishElement(data, collectionName);
                            wishesList.insertBefore(element, wishesList.firstChild);
                        }
                    }
                });
            }, (error) => {
                console.error(`监听${collectionName}变化时出错:`, error);
            });
        }
    }
    
    // 从不同类型的时间戳获取毫秒值
    function getTimestampValue(data) {
        let timestampValue = 0;
        
        if (data.timestamp) {
            // 处理不同类型的timestamp
            if (typeof data.timestamp.toMillis === 'function') {
                // Firestore Timestamp对象
                timestampValue = data.timestamp.toMillis();
            } else if (data.timestamp.seconds) {
                // Firestore Timestamp原始格式
                timestampValue = data.timestamp.seconds * 1000;
            } else if (data.timestamp._seconds) {
                // 另一种Firestore格式
                timestampValue = data.timestamp._seconds * 1000;
            } else if (typeof data.timestamp === 'number') {
                // 已经是毫秒时间戳
                timestampValue = data.timestamp;
            } else {
                // 回退到日期字符串
                timestampValue = new Date(data.date || Date.now()).getTime();
            }
        }
        
        return timestampValue;
    }
    
    // 添加回复与祝福到Firebase
    async function addRSVPWishToFirebase(data) {
        try {
            // 创建新回复与祝福对象
            const newRSVPWish = {
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                attending: data.attendStatus === 'attending',  // 转换为布尔值
                guestCount: data.guestCount,
                dietaryRestrictions: data.dietary || null,
                message: data.message || null,
                photoUrls: data.photoURLs || [],
                date: new Date().toLocaleDateString('zh-CN'),
                timestamp: serverTimestamp(),
            };
            
            // 添加到Firebase
            const rsvpWishesRef = collection("rsvp-wishes");
            const docRef = await addDoc(rsvpWishesRef, newRSVPWish);
            console.log('回复与祝福已保存到Firebase, ID:', docRef.id);
            
            return docRef.id;
        } catch (error) {
            console.error('添加回复与祝福到Firebase时出错:', error);
            console.error('错误详情:', error.message, error.code);
            throw error; // 重新抛出错误以便调用者处理
        }
    }
    
    // 创建回复与祝福元素
    function createRSVPWishElement(data, collectionType) {
        const element = document.createElement('div');
        element.className = 'wish-item';
        
        // 保存时间戳用于去重
        const timestampValue = getTimestampValue(data);
        element.setAttribute('data-timestamp', timestampValue);
        
        let headerHTML = `
            <div class="wish-header">
                <h4 class="wish-name">${data.name}</h4>
                <span class="wish-date">${data.date || '未知日期'}</span>
            </div>
        `;
        
        let contentHTML = '<div class="wish-content">';
        
        // 根据集合类型和数据显示不同内容
        if (collectionType === "rsvp-wishes") {
            // 显示RSVP状态
            const statusText = data.attending ? 
                `<span class="status attending">参加婚礼</span>` : 
                `<span class="status not-attending">无法参加</span>`;
            
            contentHTML += `<div class="rsvp-status">${statusText}</div>`;
            
            // 如果参加，显示人数
            if (data.attending && data.guestCount) {
                contentHTML += `<div class="guest-count">参加人数: ${data.guestCount}人</div>`;
            }
            
            // 显示特殊要求（如果有）
            if (data.dietaryRestrictions) {
                contentHTML += `<div class="dietary-notes">饮食要求: ${data.dietaryRestrictions}</div>`;
            }
        }
        
        // 显示祝福消息（如果有）
        if (data.message) {
            contentHTML += `<p class="wish-message">${data.message}</p>`;
        }
        
        contentHTML += '</div>';
        
        // 如果有照片，添加照片
        let photoHTML = '';
        
        // 处理新版多照片格式
        if (data.photoUrls && Array.isArray(data.photoUrls) && data.photoUrls.length > 0) {
            photoHTML = '<div class="wish-photos-grid">';
            
            data.photoUrls.forEach(url => {
                photoHTML += `
                    <div class="wish-photo">
                        <img src="${url}" alt="${data.name}的照片" loading="lazy">
                    </div>
                `;
            });
            
            photoHTML += '</div>';
        } 
        // 处理旧版单照片格式
        else if (data.photoURL) {
            photoHTML = `
                <div class="wish-photo">
                    <img src="${data.photoURL}" alt="${data.name}的照片" loading="lazy">
                </div>
            `;
        }
        
        // 组合HTML
        element.innerHTML = headerHTML + photoHTML + contentHTML;
        
        return element;
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

// 初始化分段控制器
function initSegmentedControl() {
    const segments = document.querySelectorAll('.segment-btn');
    const contentTabs = document.querySelectorAll('.content-tab');
    const segmentedControl = document.querySelector('.segmented-control');
    
    segments.forEach((segment, index) => {
        segment.addEventListener('click', () => {
            // 移除所有segment的active类
            segments.forEach(s => s.classList.remove('active'));
            
            // 添加当前点击segment的active类
            segment.classList.add('active');
            
            // 根据点击的索引更新背景滑块位置
            if (index === 0) {
                segmentedControl.classList.remove('second-active');
            } else {
                segmentedControl.classList.add('second-active');
            }
            
            // 隐藏所有content tab
            contentTabs.forEach(tab => tab.classList.remove('active'));
            
            // 显示对应的content tab
            const targetId = segment.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // 如果切换到宾客留言选项卡，加载宾客留言
            if (targetId === 'wishes-tab') {
                loadGuestWishes();
            }
        });
    });
    
    // 显示或隐藏参加人数选择
    const attendingRadio = document.getElementById('attending');
    const notAttendingRadio = document.getElementById('not-attending');
    const guestCountContainer = document.getElementById('guest-count-container');
    
    function updateGuestCountVisibility() {
        if (attendingRadio.checked) {
            guestCountContainer.style.display = 'block';
        } else {
            guestCountContainer.style.display = 'none';
        }
    }
    
    // 初始设置
    updateGuestCountVisibility();
    
    // 添加事件监听器
    attendingRadio.addEventListener('change', updateGuestCountVisibility);
    notAttendingRadio.addEventListener('change', updateGuestCountVisibility);
    
    // 默认选中第一个选项卡
    segments[0].click();
}

// 加载宾客留言
function loadGuestWishes() {
    const wishesContainer = document.getElementById('guest-wishes-container');
    wishesContainer.innerHTML = '<div class="loading">加载祝福中...</div>';
    
    // 从Firebase获取祝福留言
    db.collection("rsvp-wishes").orderBy("timestamp", "desc").get()
        .then((querySnapshot) => {
            let wishesHTML = '';
            
            if (querySnapshot.empty) {
                wishesContainer.innerHTML = '<div class="no-wishes">目前还没有祝福留言，成为第一个留言的人吧！</div>';
                return;
            }
            
            console.log(`从rsvp-wishes加载了 ${querySnapshot.size} 条祝福留言`);
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log('祝福留言数据:', data);
                
                const hasPhotos = data.photoUrls && data.photoUrls.length > 0;
                const rsvpStatus = data.attending !== undefined ? 
                    (data.attending ? '<span class="status attending">参加</span>' : '<span class="status not-attending">无法参加</span>') : '';
                const guestCount = data.attending && data.guestCount ? 
                    `<div class="guest-count">共 ${data.guestCount} 人</div>` : '';
                const dietaryNotes = data.dietaryRestrictions ? 
                    `<div class="dietary-notes">饮食需求: ${data.dietaryRestrictions}</div>` : '';
                
                let photosHTML = '';
                if (hasPhotos) {
                    photosHTML += '<div class="wish-photos-grid">';
                    data.photoUrls.forEach(url => {
                        photosHTML += `<div class="wish-photo"><img src="${url}" alt="来自 ${data.name} 的照片"></div>`;
                    });
                    photosHTML += '</div>';
                }
                
                wishesHTML += `
                    <div class="wish-card">
                        <div class="wish-header">
                            <div class="wish-author">${data.name}</div>
                            ${rsvpStatus}
                        </div>
                        ${guestCount}
                        ${dietaryNotes}
                        <div class="wish-message">${data.message || ''}</div>
                        ${photosHTML}
                        <div class="wish-date">${formatTimestamp(data.timestamp)}</div>
                    </div>
                `;
            });
            
            wishesContainer.innerHTML = wishesHTML;
        })
        .catch((error) => {
            console.error("Error loading wishes: ", error);
            wishesContainer.innerHTML = '<div class="error">加载祝福时出错，请稍后再试</div>';
        });
}

// 格式化时间戳为易读格式
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 保存表单数据和照片URL到Firebase
function saveFormDataWithPhotos(formData, photoUrls) {
    // 组合表单数据和照片URL，确保使用正确的字段名
    const dataToSave = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        attending: formData.attending,
        guestCount: parseInt(formData.guestCount) || 0,
        dietaryRestrictions: formData.dietaryRestrictions || '',
        message: formData.message || '',
        photoUrls: photoUrls || [],
        date: formData.date || new Date().toLocaleDateString('zh-CN'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('保存到Firebase的数据:', dataToSave);
    
    // 保存到Firebase
    return db.collection("rsvp-wishes").add(dataToSave)
        .then(() => {
            console.log("表单数据和照片URL保存成功");
            return true;
        })
        .catch(error => {
            console.error("保存表单数据和照片URL时出错:", error);
            return false;
        });
}

// 保存表单数据（无照片）到Firebase
function saveFormData(formData) {
    // 添加时间戳，确保使用正确的字段名
    const dataToSave = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        attending: formData.attending,
        guestCount: parseInt(formData.guestCount) || 0,
        dietaryRestrictions: formData.dietaryRestrictions || '',
        message: formData.message || '',
        photoUrls: [],
        date: formData.date || new Date().toLocaleDateString('zh-CN'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('保存到Firebase的数据:', dataToSave);
    
    // 保存到Firebase
    return db.collection("rsvp-wishes").add(dataToSave)
        .then(() => {
            console.log("表单数据保存成功");
            return true;
        })
        .catch(error => {
            console.error("保存表单数据时出错:", error);
            return false;
        });
}

// 创建成功提交反馈覆盖层
function createSuccessOverlay() {
    // 如果已经存在，则不再创建
    if (document.getElementById('success-overlay')) {
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.id = 'success-overlay';
    
    overlay.innerHTML = `
        <div class="success-animation">
            <div class="success-icon">
                <svg viewBox="0 0 52 52" class="checkmark">
                    <circle cx="26" cy="26" r="25" fill="none" class="checkmark-circle"/>
                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" class="checkmark-check"/>
                </svg>
            </div>
            <h3>提交成功!</h3>
            <p>感谢您的回复与祝福</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// 显示成功动画
function showSuccessAnimation() {
    const overlay = document.getElementById('success-overlay');
    if (overlay) {
        overlay.classList.add('active');
        
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 3000);
    }
}

// 迁移数据从rsvp_wishes到rsvp-wishes
function migrateRSVPWishesData() {
    console.log('检查是否需要迁移数据...');
    
    // 检查是否存在旧的集合
    firebase.firestore().collection('rsvp_wishes').get()
        .then((snapshot) => {
            if (snapshot.empty) {
                console.log('没有找到旧数据，无需迁移');
                return;
            }
            
            console.log(`找到 ${snapshot.size} 条旧数据，开始迁移...`);
            
            // 迁移数据
            const batch = firebase.firestore().batch();
            const promises = [];
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                
                // 转换数据格式
                const newData = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone || null,
                    attending: data.attendStatus === 'attending' || data.attending === true,
                    guestCount: parseInt(data.guestCount) || 0,
                    dietaryRestrictions: data.dietary || data.dietaryRestrictions || null,
                    message: data.message || null,
                    photoUrls: data.photoURLs || data.photoUrls || [],
                    date: data.date || new Date().toLocaleDateString('zh-CN'),
                    timestamp: data.timestamp || firebase.firestore.FieldValue.serverTimestamp(),
                    migrated: true
                };
                
                // 添加到新集合
                const promise = firebase.firestore().collection('rsvp-wishes').add(newData)
                    .then(() => {
                        console.log(`已迁移文档ID: ${doc.id}`);
                        return firebase.firestore().collection('rsvp_wishes').doc(doc.id).delete();
                    })
                    .then(() => {
                        console.log(`已删除旧文档ID: ${doc.id}`);
                    });
                
                promises.push(promise);
            });
            
            return Promise.all(promises);
        })
        .then(() => {
            console.log('数据迁移完成');
        })
        .catch((error) => {
            console.error('迁移数据时出错:', error);
        });
}