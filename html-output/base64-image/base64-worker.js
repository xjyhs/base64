// Base64转换Web Worker
// 处理大文件转换，避免主线程阻塞

// 工具函数：将Base64字符串转换为Blob
function base64ToBlob(base64String, onProgress) {
  try {
    // 提取MIME类型和数据
    const parts = base64String.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const data = parts[1];
    
    // 分块处理大文件，避免内存溢出
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks = [];
    const totalChunks = Math.ceil(data.length / chunkSize);
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const bytes = atob(chunk);
      const byteArray = new Uint8Array(bytes.length);
      
      for (let j = 0; j < bytes.length; j++) {
        byteArray[j] = bytes.charCodeAt(j);
      }
      
      chunks.push(byteArray);

      // 计算并发送真实进度
      const progress = Math.round(((i / chunkSize + 1) / totalChunks) * 100);
      onProgress(progress, `正在解码... ${progress}%`);
    }
    
    return new Blob(chunks, { type: mime });
  } catch (error) {
    throw new Error('Invalid Base64 format: ' + error.message);
  }
}

// 工具函数：将文件转换为Base64
function fileToBase64(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = function(event) {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress, `正在读取文件... ${progress}%`);
      }
    };
    
    reader.onload = function(e) {
      try {
        const result = e.target.result;
        resolve({
          success: true,
          data: result,
          size: file.size,
          type: file.type,
          name: file.name
        });
      } catch (error) {
        reject({
          success: false,
          error: 'Failed to convert file: ' + error.message
        });
      }
    };
    
    reader.onerror = function() {
      reject({
        success: false,
        error: 'Failed to read file'
      });
    };
    
    reader.readAsDataURL(file);
  });
}

// 验证Base64图片格式
function validateBase64Image(base64String) {
  if (!base64String || typeof base64String !== 'string') {
    return false;
  }
  
  // 检查是否包含图片MIME类型
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
  const hasImageMime = imageTypes.some(type => base64String.includes(type));
  
  if (!hasImageMime) {
    return false;
  }
  
  // 检查Base64格式
  try {
    const parts = base64String.split(',');
    if (parts.length !== 2) return false;
    
    const data = parts[1];
    // 简单验证Base64字符
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(data);
  } catch {
    return false;
  }
}

// 获取文件大小信息
function getFileSizeInfo(sizeInBytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = sizeInBytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return {
    size: Math.round(size * 100) / 100,
    unit: units[unitIndex],
    bytes: sizeInBytes
  };
}

// 监听主线程消息
self.addEventListener('message', async function(e) {
  const { type, data, id } = e.data;
  
  try {
    let result;
    
    // 创建一个onProgress回调函数
    const onProgress = (progress, message) => {
      self.postMessage({ type: 'progress', id, progress, message });
    };
    
    switch (type) {
      case 'base64ToBlob':
        onProgress(0, '开始转换Base64...');
        
        // 验证Base64格式
        if (!validateBase64Image(data.base64)) {
          throw new Error('Invalid Base64 image format');
        }
        
        onProgress(10, '格式验证完成...');
        
        // 转换为Blob，并传递进度回调
        const blob = base64ToBlob(data.base64, (progress, message) => {
          // 将解码进度从10%映射到90%
          const scaledProgress = 10 + Math.round(progress * 0.8);
          onProgress(scaledProgress, message);
        });
        
        const url = URL.createObjectURL(blob);
        const sizeInfo = getFileSizeInfo(blob.size);
        
        result = {
          success: true,
          url: url,
          blob: blob,
          size: sizeInfo,
          type: blob.type
        };
        
        onProgress(100, '转换完成！');
        break;
        
      case 'fileToBase64':
        const fileData = data.file;
        onProgress(0, '开始读取文件...');
        
        // 转换文件，并传递进度回调
        result = await fileToBase64(fileData, (progress, message) => {
          // 将读取进度从0%映射到90%
          const scaledProgress = Math.round(progress * 0.9);
          onProgress(scaledProgress, message);
        });
        
        onProgress(100, '转换完成！');
        
        if (result.success) {
          result.sizeInfo = getFileSizeInfo(fileData.size);
        }
        
        break;
        
      case 'validateBase64':
        result = {
          success: true,
          isValid: validateBase64Image(data.base64),
          message: validateBase64Image(data.base64) ? 'Valid Base64 image' : 'Invalid Base64 format'
        };
        break;
        
      default:
        throw new Error('Unknown operation type: ' + type);
    }
    
    // 发送结果
    self.postMessage({ 
      type: 'result', 
      id, 
      result 
    });
    
  } catch (error) {
    // 发送错误
    self.postMessage({ 
      type: 'error', 
      id, 
      error: error.message 
    });
  }
});

// 发送Worker就绪消息
self.postMessage({ type: 'ready' }); 