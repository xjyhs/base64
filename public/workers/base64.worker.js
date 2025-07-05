// public/workers/base64.worker.js

/**
 * Calculates the size of a file and returns it in a human-readable format.
 */
function getFileSize(size) {
  if (size === 0) return { size: 0, unit: 'B' };
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return {
    size: Number((size / Math.pow(1024, i)).toFixed(2)),
    unit: ['B', 'KB', 'MB', 'GB', 'TB'][i],
  };
}

/**
 * Converts a File object to a Base64 string.
 */
function fileToBase64(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      onProgress(100);
      resolve(reader.result);
    };
    
    reader.onerror = reject;
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        // 只在进度变化显著时更新，减少通信开销
        if (progress % 10 === 0 || progress === 100) {
          onProgress(progress);
        }
      }
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a Base64 string to a Blob - optimized version
 */
function base64ToBlob(base64, onProgress) {
  try {
    onProgress(10);
    
    // 验证base64格式
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('Invalid base64 input');
    }
    
    // 提取数据部分
    const parts = base64.split(',');
    if (parts.length !== 2) {
      throw new Error('Invalid base64 format');
    }
    
    const header = parts[0];
    const data = parts[1];
    
    onProgress(30);
    
    // 提取MIME类型
    const mimeMatch = header.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    
    onProgress(50);
    
    // 解码base64 - 使用原生方法，比fetch更快
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    
    onProgress(70);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    onProgress(90);
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    onProgress(100);
    return blob;
  } catch (error) {
    throw new Error(`Base64 conversion failed: ${error.message}`);
  }
}

// 简化的消息处理
self.onmessage = async function(event) {
  const { id, action, payload } = event.data;

  function sendProgress(progress) {
    self.postMessage({ 
      id, 
      type: 'progress', 
      payload: { progress } 
    });
  }

  function sendResult(result) {
    self.postMessage({ 
      id, 
      type: 'result', 
      payload: result 
    });
  }

  try {
    if (action === 'fileToBase64') {
      const { file } = payload;
      const base64 = await fileToBase64(file, sendProgress);
      sendResult({
        success: true,
        data: base64,
        sizeInfo: getFileSize(file.size),
      });
    } else if (action === 'base64ToBlob') {
      const { base64 } = payload;
      const blob = base64ToBlob(base64, sendProgress);
      const url = URL.createObjectURL(blob);
      sendResult({
        success: true,
        url,
        size: getFileSize(blob.size),
        type: blob.type,
      });
    } else {
      sendResult({
        success: false,
        error: `Unknown action: ${action}`,
      });
    }
  } catch (error) {
    sendResult({
      success: false,
      error: error.message || String(error),
    });
  }
}; 