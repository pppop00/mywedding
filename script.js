// 婚礼网站JavaScript功能

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化倒计时
    initCountdown();
    
    // 初始化苹果地图
    initAppleMap();
    
    // 初始化照片上传功能
    initWishesForm();
    
    // 初始化问答功能
    initQuestionsForm();
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
    const wishesForm = document.getElementById('wishes-form');
    const wishesList = document.getElementById('wishes-list');
    
    if (wishesForm) {
        wishesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('name').value;
            const message = document.getElementById('message').value;
            const photoInput = document.getElementById('photo');
            
            // 创建新的祝福元素
            const wishElement = document.createElement('div');
            wishElement.className = 'wish-item';
            
            // 创建祝福内容
            const contentElement = document.createElement('div');
            contentElement.className = 'wish-content';
            contentElement.innerHTML = `
                <div class="wish-name">${name}</div>
                <div class="wish-message">${message}</div>
                <div class="wish-date">${new Date().toLocaleDateString()}</div>
            `;
            
            // 处理照片上传
            if (photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const photoURL = e.target.result;
                    
                    // 添加照片
                    const photoElement = document.createElement('div');
                    photoElement.className = 'wish-photo';
                    photoElement.innerHTML = `<img src="${photoURL}" alt="${name}的照片">`;
                    
                    // 将照片和内容添加到祝福元素
                    wishElement.appendChild(photoElement);
                    wishElement.appendChild(contentElement);
                    
                    // 添加到祝福列表
                    if (wishesList) {
                        wishesList.insertBefore(wishElement, wishesList.firstChild);
                    }
                };
                
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                // 如果没有照片，只添加内容
                wishElement.appendChild(contentElement);
                
                // 添加到祝福列表
                if (wishesList) {
                    wishesList.insertBefore(wishElement, wishesList.firstChild);
                }
            }
            
            // 重置表单
            wishesForm.reset();
            
            // 显示成功消息
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = '感谢您的祝福！';
            wishesForm.appendChild(successMessage);
            
            // 3秒后移除成功消息
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        });
    }
    
    // 添加示例祝福
    addSampleWishes();
}

// 添加示例祝福
function addSampleWishes() {
    const wishesList = document.getElementById('wishes-list');
    if (wishesList) {
        const sampleWishes = [
            {
                name: '张先生',
                message: '祝福你们新婚快乐，白头偕老！',
                date: '2025-12-25',
                hasPhoto: true
            },
            {
                name: '李女士',
                message: '愿你们的爱情像美酒一样，越陈越香！',
                date: '2025-12-26',
                hasPhoto: false
            }
        ];
        
        sampleWishes.forEach(wish => {
            const wishElement = document.createElement('div');
            wishElement.className = 'wish-item';
            
            // 添加示例照片
            if (wish.hasPhoto) {
                const photoElement = document.createElement('div');
                photoElement.className = 'wish-photo';
                photoElement.innerHTML = `<img src="https://picsum.photos/100/100?random=${Math.random()}" alt="${wish.name}的照片">`;
                wishElement.appendChild(photoElement);
            }
            
            const contentElement = document.createElement('div');
            contentElement.className = 'wish-content';
            contentElement.innerHTML = `
                <div class="wish-name">${wish.name}</div>
                <div class="wish-message">${wish.message}</div>
                <div class="wish-date">${wish.date}</div>
            `;
            
            wishElement.appendChild(contentElement);
            wishesList.appendChild(wishElement);
        });
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
            const q = query(
                collection(db, "questions"),
                orderBy("timestamp", "desc")
            );
            
            // 执行查询
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.log('没有找到问题');
                return;
            }
            
            console.log(`从Firebase加载了 ${querySnapshot.size} 个问题`);
            
            // 清空问题列表
            questionsList.innerHTML = '';
            
            // 添加每个问题到列表
            querySnapshot.forEach((docSnapshot) => {
                const questionData = docSnapshot.data();
                questionData.id = docSnapshot.id;  // 使用Firebase的文档ID
                
                // 创建问题元素并添加到列表
                const questionElement = createQuestionElement(questionData);
                questionsList.appendChild(questionElement);
            });
        } catch (error) {
            console.error('加载问题时出错:', error);
        }
    }
    
    // 设置实时监听
    function setupQuestionsListener() {
        const q = query(
            collection(db, "questions"),
            orderBy("timestamp", "desc")
        );
        
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
            const docRef = await addDoc(collection(db, "questions"), newQuestion);
            console.log('问题已保存到Firebase, ID:', docRef.id);
            
            // 不需要手动添加DOM元素，监听器会处理这个
        } catch (error) {
            console.error('添加问题到Firebase时出错:', error);
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
            
            if (docSnap.exists()) {
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
                const q = query(
                    collection(db, "questions"),
                    where("localId", "==", question.id)
                );
                
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
                    
                    await addDoc(collection(db, "questions"), firestoreQuestion);
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
                    <span class="answer-date">${questionData.answerDate}</span>
                </div>
            </div>
        `;
    }
    
    // 添加管理员控制按钮和编辑按钮
    html += `
        <div class="admin-controls">
    `;
    
    // 只有在没有回答时才显示编辑按钮
    if (!questionData.answer) {
        html += `
            <button class="edit-btn" data-id="${questionData.id}">编辑</button>
        `;
    }
    
    html += `
            <button class="delete-btn" data-id="${questionData.id}">删除</button>
        </div>
    `;
    
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