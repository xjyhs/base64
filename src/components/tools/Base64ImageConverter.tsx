import React, { useState, useRef, useCallback } from 'react';
import { Base64Utils } from '../../utils/base64';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Base64ImageConverter() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('decode');
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [convertedImageUrl, setConvertedImageUrl] = useState('');
  const [imageInfo, setImageInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateBase64Image = (base64String: string): boolean => {
    try {
      if (!base64String.includes('data:image/')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const convertBase64ToImage = useCallback(async () => {
    if (!base64Input.trim()) {
      showToast('请输入Base64编码', 'error');
      return;
    }

    if (!validateBase64Image(base64Input)) {
      showToast('请输入有效的图片Base64编码', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const blob = Base64Utils.base64ToBlob(base64Input);
      const url = URL.createObjectURL(blob);
      setConvertedImageUrl(url);
      
      // 获取图片信息
      const info = Base64Utils.getImageInfo(base64Input);
      setImageInfo(info);
      
      showToast('转换成功！', 'success');
    } catch (error) {
      showToast('转换失败：' + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [base64Input]);

  const convertImageToBase64 = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('文件大小不能超过10MB', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await Base64Utils.fileToBase64(file);
      if (result.success && result.data) {
        setBase64Output(result.data);
        
        // 设置图片信息
        setImageInfo({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
        });
        
        showToast('转换成功！', 'success');
      } else {
        showToast(result.error || '转换失败', 'error');
      }
    } catch (error) {
      showToast('转换失败：' + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      convertImageToBase64(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      convertImageToBase64(file);
    }
  };

  const downloadImage = () => {
    if (convertedImageUrl) {
      const link = document.createElement('a');
      link.href = convertedImageUrl;
      link.download = imageInfo?.name || 'converted-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('图片已下载', 'success');
    }
  };

  const copyBase64 = async () => {
    const textToCopy = activeTab === 'encode' ? base64Output : base64Input;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Base64编码已复制到剪贴板', 'success');
      } catch {
        showToast('复制失败，请手动选择复制', 'error');
      }
    }
  };

  const downloadBase64Text = () => {
    const textToDownload = activeTab === 'encode' ? base64Output : base64Input;
    if (textToDownload) {
      const blob = new Blob([textToDownload], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'base64-data.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Base64文件已下载', 'success');
    }
  };

  const clearResults = () => {
    setBase64Input('');
    setBase64Output('');
    setConvertedImageUrl('');
    setImageInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('已清除所有结果', 'info');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <style>{`
        [data-theme="dark"] .bg-white { background-color: rgb(31 41 55) !important; }
        [data-theme="dark"] .bg-gray-50 { background-color: rgb(55 65 81) !important; }
        [data-theme="dark"] .bg-gray-100 { background-color: rgb(55 65 81) !important; }
        [data-theme="dark"] .border-gray-200 { border-color: rgb(75 85 99) !important; }
        [data-theme="dark"] .border-gray-300 { border-color: rgb(75 85 99) !important; }
        [data-theme="dark"] .text-gray-900 { color: rgb(255 255 255) !important; }
        [data-theme="dark"] .text-gray-600 { color: rgb(156 163 175) !important; }
        [data-theme="dark"] .text-gray-700 { color: rgb(209 213 219) !important; }
        [data-theme="dark"] .hover\\:bg-gray-200:hover { background-color: rgb(75 85 99) !important; }
        [data-theme="dark"] .hover\\:border-gray-400:hover { border-color: rgb(107 114 128) !important; }
      `}</style>
      
      {/* Toast消息 */}
      {toast && (
        <div className={`
          fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-white font-medium text-sm
          shadow-2xl transition-all duration-300 ease-out
          ${toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
        `}>
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
        {/* 标签页切换 */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
              activeTab === 'encode'
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => {
              setActiveTab('encode');
              clearResults();
            }}
          >
            <span className="text-lg">📷</span>
            <span>图片转Base64</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
              activeTab === 'decode'
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => {
              setActiveTab('decode');
              clearResults();
            }}
          >
            <span className="text-lg">🖼️</span>
            <span>Base64转图片</span>
          </button>
        </div>

        <div>
          {activeTab === 'encode' ? (
            // 图片转Base64模式
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  选择图片文件
                </h3>
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ease-out ${
                    dragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-5xl mb-4">📁</div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      点击选择图片或拖拽到此处
                    </p>
                    <p className="text-sm text-gray-600">
                      支持 PNG、JPG、GIF、WebP 等格式，最大 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {base64Output && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Base64 编码结果
                    </h3>
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        onClick={copyBase64}
                      >
                        <span>📋</span> 复制编码
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        onClick={downloadBase64Text}
                      >
                        <span>💾</span> 下载文件
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="w-full h-48 p-4 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={base64Output}
                    readOnly
                    placeholder="Base64编码将显示在这里..."
                  />
                </div>
              )}
            </div>
          ) : (
            // Base64转图片模式
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  输入Base64编码
                </h3>
                <textarea
                  className="w-full h-48 p-4 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder="请粘贴Base64编码内容..."
                />
                <div className="flex gap-3 mt-4">
                  <button 
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isLoading || !base64Input.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                    onClick={convertBase64ToImage}
                    disabled={isLoading || !base64Input.trim()}
                  >
                    {isLoading ? '转换中...' : '转换为图片'}
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setBase64Input('')}
                  >
                    清空内容
                  </button>
                </div>
              </div>

              {convertedImageUrl && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      图片预览
                    </h3>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      onClick={downloadImage}
                    >
                      <span>⬇️</span> 下载图片
                    </button>
                  </div>
                  <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 text-center">
                    <img 
                      src={convertedImageUrl} 
                      alt="转换后的图片" 
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 清除按钮区域 */}
          {(base64Output || convertedImageUrl) && (
            <div className="text-center pt-6 border-t border-gray-200 mt-6">
              <button
                className="flex items-center gap-2 px-6 py-3 mx-auto border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                onClick={clearResults}
              >
                <span>🗑️</span> 清除所有结果
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 