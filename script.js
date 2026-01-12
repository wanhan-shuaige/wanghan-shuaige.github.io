// ========== 1. 点击放大功能（使用事件委托，兼容动态添加的照片） ==========
// 在相册容器上监听点击事件，而不是在每个图片上单独绑定
document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    
    // 事件委托：监听相册区域的点击
    gallery.addEventListener('click', function(event) {
        // 检查点击的是否是图片
        if (event.target.tagName === 'IMG' && event.target.closest('.photo-card')) {
            openImageModal(event.target.src, event.target.alt);
        }
    });
    
    // 加载本地存储的照片
    loadLocalPhotos();
    
    // 初始化上传表单
    initUploadForm();
});

// 打开图片模态框（放大查看）
function openImageModal(src, alt) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'image-modal';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        cursor: pointer;
        animation: fadeIn 0.3s ease;
    `;
    
    // 创建放大后的图片
    const enlargedImg = document.createElement('img');
    enlargedImg.src = src;
    enlargedImg.alt = alt;
    enlargedImg.style.cssText = `
        max-width: 90%;
        max-height: 75vh;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
        object-fit: contain;
        cursor: default;
    `;
    
    // 创建描述文本
    const description = document.createElement('div');
    description.textContent = alt || '照片';
    description.style.cssText = `
        color: white;
        margin-top: 20px;
        font-size: 18px;
        text-align: center;
        max-width: 80%;
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    `;
    
    // 创建关闭提示
    const closeHint = document.createElement('div');
    closeHint.textContent = '点击任意位置关闭';
    closeHint.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        margin-top: 20px;
        font-size: 14px;
    `;
    
    // 点击遮罩层关闭
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
    
    // 按ESC键也可以关闭
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape' && document.body.contains(overlay)) {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
    
    // 添加到页面
    overlay.appendChild(enlargedImg);
    if (alt) overlay.appendChild(description);
    overlay.appendChild(closeHint);
    document.body.appendChild(overlay);
    
    // 添加CSS动画
    if (!document.querySelector('#modal-animation')) {
        const style = document.createElement('style');
        style.id = 'modal-animation';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== 2. 上传功能代码 ==========
function initUploadForm() {
    // 添加上传表单到页面
    const uploadForm = `
    <div id="upload-section" style="text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; border: 2px dashed #6c757d;">
        <h3 style="color: #2c3e50; margin-bottom: 10px;">📷 添加新照片到相册</h3>
        <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 20px;">
            支持 JPG、PNG 格式 | 仅保存在当前浏览器中
        </p>
        <div style="max-width: 500px; margin: 0 auto;">
            <div style="margin-bottom: 15px;">
                <input type="file" id="file-input" accept="image/*" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white;">
            </div>
            <div style="margin-bottom: 20px;">
                <input type="text" id="photo-desc" placeholder="为这张照片写段描述吧..." 
                       style="width: 100%; padding: 12px; border: 1px solid #3498db; border-radius: 8px; font-size: 16px;">
            </div>
            <button onclick="uploadLocalPhoto()" 
                    style="padding: 12px 30px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: transform 0.2s;">
                上传照片
            </button>
            <button onclick="clearAllPhotos()" 
                    style="padding: 12px 20px; margin-left: 10px; background: #e74c3c; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
                清空所有
            </button>
        </div>
    </div>
    `;
    
    const gallery = document.getElementById('gallery');
    gallery.insertAdjacentHTML('beforebegin', uploadForm);
}

// 上传本地照片
// 上传本地照片 - 修改后的版本
function uploadLocalPhoto() {
    const fileInput = document.getElementById('file-input');
    const descInput = document.getElementById('photo-desc');
    
    if (!fileInput.files[0]) {
        alert('请先选择一张照片！');
        return;
    }
    
    const file = fileInput.files[0];
    if (file.size > 5 * 1024 * 1024) {
        alert('文件太大！请选择小于5MB的图片。');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageDataUrl = e.target.result; // 获取图片的Base64数据
        const gallery = document.getElementById('gallery');
        const currentTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0,5);
        
        // 创建新的照片卡片 (已添加删除按钮)
        const newCard = document.createElement('div');
        newCard.className = 'photo-card';
        newCard.innerHTML = `
            <img src="${imageDataUrl}" alt="${descInput.value || '上传的照片'}">
            <p>${descInput.value || '新上传的照片'} 
                <small style="color: #7f8c8d; margin-left: 10px;">(${currentTime})</small>
            </p>
            <!-- 删除按钮，onclick 传递图片的唯一标识（Data URL） -->
            <button class="delete-btn" onclick="deletePhoto('${imageDataUrl}', this)">🗑️ 删除</button>
        `;
        
        // 插入到相册开头
        gallery.insertBefore(newCard, gallery.firstChild);
        
        // 保存到本地存储 (需要保存 imageDataUrl 用于后续匹配删除)
        saveToLocalStorage(imageDataUrl, descInput.value, currentTime);
        
        // 清空表单
        fileInput.value = '';
        descInput.value = '';
        
        showNotification('照片上传成功！');
    };
    
    reader.readAsDataURL(file);
}
// 保存到本地存储
function saveToLocalStorage(imageData, description) {
    let photos = JSON.parse(localStorage.getItem('localPhotos')) || [];
    
    // 添加到开头
    photos.unshift({
        data: imageData,
        desc: description || '上传的照片',
        time: new Date().toISOString(),
        displayTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0,5)
    });
    
    // 只保存最近30张
    if (photos.length > 30) {
        photos = photos.slice(0, 30);
    }
    
    localStorage.setItem('localPhotos', JSON.stringify(photos));
}

// 加载本地存储的照片
// 加载本地存储的照片 - 修改后的版本
function loadLocalPhotos() {
    const saved = JSON.parse(localStorage.getItem('localPhotos')) || [];
    const gallery = document.getElementById('gallery');
    
    saved.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.innerHTML = `
            <img src="${photo.data}" alt="${photo.desc}">
            <p>${photo.desc} 
                <small style="color: #7f8c8d; margin-left: 10px;">(${photo.displayTime || photo.time})</small>
            </p>
            <!-- 删除按钮，onclick 传递图片的唯一标识（Data URL） -->
            <button class="delete-btn" onclick="deletePhoto('${photo.data}', this)">🗑️ 删除</button>
        `;
        gallery.appendChild(card);
    });
}

// 清空所有照片
function clearAllPhotos() {
    if (confirm('确定要清空所有上传的照片吗？这个操作无法撤销！')) {
        localStorage.removeItem('localPhotos');
        location.reload(); // 重新加载页面
    }
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
    
    // 添加动画样式
    if (!document.querySelector('#notification-animation')) {
        const style = document.createElement('style');
        style.id = 'notification-animation';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}
// ========== 单个删除照片功能 ==========
function deletePhoto(imageDataUrl, buttonElement) {
    // 1. 弹窗确认，防止误触
    if (!confirm('确定要永久删除这张照片吗？')) {
        return;
    }
    
    // 2. 从 localStorage 的数据数组中删除这一项
    let photos = JSON.parse(localStorage.getItem('localPhotos')) || [];
    // 过滤掉 data 字段与当前图片 Data URL 不匹配的项
    const newPhotos = photos.filter(photo => photo.data !== imageDataUrl);
    // 保存更新后的数组
    localStorage.setItem('localPhotos', JSON.stringify(newPhotos));
    
    // 3. 从页面上移除这张照片的卡片
    // buttonElement 是点击的按钮，closest('.photo-card') 找到它所在的整个卡片div
    const photoCard = buttonElement.closest('.photo-card');
    if (photoCard) {
        // 添加一个淡出动画效果（可选）
        photoCard.style.transition = 'opacity 0.3s';
        photoCard.style.opacity = '0';
        setTimeout(() => {
            photoCard.remove();
            showNotification('照片已删除');
        }, 300);
    }
}