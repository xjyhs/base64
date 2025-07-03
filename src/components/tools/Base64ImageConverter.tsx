import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { workerManager } from '../../utils/workerManager';

// 防抖Hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 可靠的翻译系统
class TranslationManager {
  private translations: any = null;
  private isClient: boolean = false;
  private fallbackTranslations: any = null;
  private isReady: boolean = false;
  private readyCallbacks: Array<() => void> = [];

  constructor() {
    // 设置默认的英文翻译作为fallback
    this.fallbackTranslations = {
      converter: {
        tabs: {
          decode: "Base64 to Image",
          encode: "Image to Base64"
        },
        actions: {
          paste: "Paste Base64 encoding here...",
          decode: "Convert to Image",
          clear: "Clear",
          copy: "Copy",
          downloadImage: "Download Image",
          downloadTxt: "Download as TXT"
        },
        labels: {
          dropzone: "Drag and drop image here, or click to select file",
          resultTitle: "Conversion Result",
          outputTitle: "Base64 Output",
          loading: "Processing...",
          imageInfoTitle: "Image Information"
        },
        textStats: {
          length: "Length",
          size: "Size",
          largeTextWarning: "Large text detected, processing may take some time"
        },
        messages: {
          errorPaste: "Please enter Base64 encoding",
          errorInvalid: "Please enter a valid image Base64 encoding",
          success: "Conversion successful!",
          errorFail: "Conversion failed: ",
          errorSelect: "Please select an image file",
          errorSize: "File size cannot exceed 10MB",
          errorUnknown: "Conversion failed",
          imageDownloaded: "Image downloaded",
          copied: "Base64 encoding copied to clipboard",
          copyFail: "Copy failed, please select and copy manually",
          textDownloaded: "Base64 file downloaded",
          cleared: "Cleared all results",
          processing: "Processing text...",
          textProcessed: "Text processed successfully"
        },
        imageInfo: {
          name: "Name",
          size: "Size",
          type: "Type"
        }
      }
    };
  }

  init() {
    if (typeof window !== 'undefined') {
      this.isClient = true;
      
      // 检查翻译是否已经加载
      if ((window as any).translations) {
        this.translations = (window as any).translations;
        this.isReady = true;
        this.notifyReady();
      } else {
        // 如果翻译还未加载，等待一段时间后再检查
        const checkTranslations = () => {
          if ((window as any).translations) {
            this.translations = (window as any).translations;
            this.isReady = true;
            this.notifyReady();
          } else {
            // 如果仍然没有翻译，使用fallback
            setTimeout(() => {
              if (!(window as any).translations) {
                this.translations = this.fallbackTranslations;
                this.isReady = true;
                this.notifyReady();
              }
            }, 100);
          }
        };
        
        // 立即检查一次，然后延迟检查
        setTimeout(checkTranslations, 0);
      }
    } else {
      // 服务端渲染时使用fallback
      this.translations = this.fallbackTranslations;
      this.isReady = true;
    }
  }

  private notifyReady() {
    this.readyCallbacks.forEach(callback => callback());
    this.readyCallbacks = [];
  }

  onReady(callback: () => void) {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  t(key: string): string {
    if (!this.translations) {
      return key;
    }

    const keys = key.split('.');
    let result = this.translations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // 如果找不到翻译，返回原始key
      }
    }
    
    return typeof result === 'string' ? result : key;
  }

  isClientSide(): boolean {
    return this.isClient;
  }
}

// 创建全局翻译管理器实例
const translationManager = new TranslationManager();

// 翻译Hook
const useTranslation = () => {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    translationManager.init();
    translationManager.onReady(() => {
      setIsReady(true);
    });
  }, []);

  return {
    t: translationManager.t.bind(translationManager),
    isReady,
    isClient: translationManager.isClientSide()
  };
};

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ProgressState {
  show: boolean;
  progress: number;
  message: string;
}

export default function Base64ImageConverter() {
  const { t, isReady, isClient } = useTranslation();
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('decode');
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [convertedImageUrl, setConvertedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [progressState, setProgressState] = useState<ProgressState>({
    show: false,
    progress: 0,
    message: ''
  });
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  
  // 新增：文本处理优化状态
  const [isTextProcessing, setIsTextProcessing] = useState(false);
  const [textStats, setTextStats] = useState<{
    length: number;
    sizeKB: number;
    isLarge: boolean;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const converterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 使用防抖处理大型文本输入
  const debouncedBase64Input = useDebounce(base64Input, 300);

  // 计算文本统计信息
  const textStatistics = useMemo(() => {
    if (!base64Input) return null;
    
    const length = base64Input.length;
    const sizeKB = Math.round((length * 0.75) / 1024 * 100) / 100; // Base64大约比原始数据大33%
    const isLarge = length > 50000; // 50KB以上认为是大文本
    
    return { length, sizeKB, isLarge };
  }, [debouncedBase64Input]);

  // 更新文本统计
  useEffect(() => {
    setTextStats(textStatistics);
  }, [textStatistics]);

  // 组件初始化
  useEffect(() => {
    // 清理函数：组件卸载时销毁Worker
    return () => {
      workerManager.destroy();
    };
  }, []);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateProgress = (progress: number, message: string) => {
    setProgressState({
      show: true,
      progress: Math.min(100, Math.max(0, progress)),
      message
    });
  };

  const hideProgress = () => {
    setProgressState({
      show: false,
      progress: 0,
      message: ''
    });
  };

  // 滚动到功能区顶部
  const scrollToConverter = () => {
    if (converterRef.current) {
      // 考虑顶部菜单栏高度，预留80px空间
      const yOffset = -80;
      const element = converterRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  // 优化的文本输入处理
  const handleTextInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const length = value.length;
    
    // 对于大型文本，使用异步处理
    if (length > 50000) {
      setIsTextProcessing(true);
      
      // 使用setTimeout将处理推迟到下一个事件循环
      setTimeout(() => {
        setBase64Input(value);
        setIsTextProcessing(false);
      }, 0);
    } else {
      setBase64Input(value);
    }
  }, []);

  // 优化的粘贴处理
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const length = pastedText.length;
    
    if (length > 100000) { // 100KB以上的大文本
      e.preventDefault();
      setIsTextProcessing(true);
      
      showToast(t('converter.messages.processing'), 'info');
      
      // 分批处理大型文本
      const processLargeText = async () => {
        try {
          // 使用requestIdleCallback或setTimeout分批处理
          const chunkSize = 50000;
          let processedText = '';
          
          for (let i = 0; i < pastedText.length; i += chunkSize) {
            const chunk = pastedText.slice(i, i + chunkSize);
            processedText += chunk;
            
            // 给浏览器一些时间处理其他任务
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // 修复进度计算：使用已处理完成的字符数
            const processedLength = Math.min(i + chunkSize, pastedText.length);
            const progress = Math.round((processedLength / pastedText.length) * 100);
            updateProgress(progress, t('converter.messages.processing'));
          }
          
          setBase64Input(processedText);
          hideProgress();
          showToast(t('converter.messages.textProcessed'), 'success');
        } catch (error) {
          showToast(t('converter.messages.errorUnknown'), 'error');
          hideProgress();
        } finally {
          setIsTextProcessing(false);
        }
      };
      
      processLargeText();
    }
  }, [t]);

  const convertBase64ToImage = useCallback(async () => {
    if (!base64Input.trim()) {
      showToast(t('converter.messages.errorPaste'), 'error');
      return;
    }

    setIsLoading(true);
    setFileInfo(null);
    
    try {
      // 使用Worker进行转换
      const result = await workerManager.base64ToBlob(
        base64Input,
        updateProgress
      );
      
      if (result.success && result.url) {
        setConvertedImageUrl(result.url);
        
        // 设置文件信息
        if (result.size) {
          setFileInfo({
            name: 'converted-image',
            size: `${result.size.size} ${result.size.unit}`,
            type: result.type || 'image/*'
          });
        }
        
        showToast(t('converter.messages.success'), 'success');
        // 转换完成后滚动到功能区顶部
        setTimeout(scrollToConverter, 100);
      } else {
        showToast(t('converter.messages.errorFail'), 'error');
      }
    } catch (error) {
      showToast(t('converter.messages.errorFail') + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
      hideProgress();
    }
  }, [base64Input]);

  const convertImageToBase64 = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(t('converter.messages.errorSelect'), 'error');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB限制
      showToast('文件过大，请选择小于100MB的图片', 'error');
      return;
    }

    setIsLoading(true);
    setFileInfo(null);
    
    try {
      // 使用Worker进行转换
      const result = await workerManager.fileToBase64(
        file,
        updateProgress
      );
      
      if (result.success && result.data) {
        setBase64Output(result.data);
        
        // 设置文件信息
        if (result.sizeInfo) {
          setFileInfo({
            name: file.name,
            size: `${result.sizeInfo.size} ${result.sizeInfo.unit}`,
            type: file.type
          });
        }
        
        showToast(t('converter.messages.success'), 'success');
        // 转换完成后滚动到功能区顶部
        setTimeout(scrollToConverter, 100);
      } else {
        showToast(result.error || t('converter.messages.errorUnknown'), 'error');
      }
    } catch (error) {
      showToast(t('converter.messages.errorFail') + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
      hideProgress();
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
    if (convertedImageUrl && fileInfo) {
      const link = document.createElement('a');
      link.href = convertedImageUrl;
      link.download = fileInfo.name + '.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(t('converter.messages.imageDownloaded'), 'success');
    }
  };

  const copyBase64 = async () => {
    const textToCopy = activeTab === 'encode' ? base64Output : base64Input;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(t('converter.messages.copied'), 'success');
      } catch {
        showToast(t('converter.messages.copyFail'), 'error');
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
      showToast(t('converter.messages.textDownloaded'), 'success');
    }
  };

  const clearResults = () => {
    setBase64Input('');
    setBase64Output('');
    setConvertedImageUrl('');
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast(t('converter.messages.cleared'), 'info');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4" ref={converterRef}>
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

      {/* 进度条 */}
      {progressState.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700" style={{ width: '320px' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {progressState.message}
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ 
                width: `${Math.min(100, Math.max(0, progressState.progress))}%`
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {Math.round(progressState.progress)}%
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('decode')}
            className={`flex-1 p-4 text-lg font-semibold transition-colors duration-200 ${activeTab === 'decode' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {isClient ? t('converter.tabs.decode') : 'Base64 to Image'}
          </button>
          <button
            onClick={() => setActiveTab('encode')}
            className={`flex-1 p-4 text-lg font-semibold transition-colors duration-200 ${activeTab === 'encode' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {isClient ? t('converter.tabs.encode') : 'Image to Base64'}
          </button>
        </div>

        {/* Decode Tab */}
        {activeTab === 'decode' && (
          <div className="p-6">
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder={isClient ? t('converter.actions.paste') : 'Paste Base64 encoding here...'}
                value={base64Input}
                onChange={handleTextInput}
                onPaste={handlePaste}
                disabled={isTextProcessing}
              />
              
              {/* 文本处理状态指示器 */}
              {isTextProcessing && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">
                      {isClient ? t('converter.messages.processingText') : '处理大型文本中...'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* 文本统计信息 */}
            {textStats && (
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>
                    {isClient ? t('converter.stats.length') : '长度'}: {textStats.length.toLocaleString()} {isClient ? t('converter.stats.characters') : '字符'}
                  </span>
                  <span>
                    {isClient ? t('converter.stats.size') : '大小'}: ~{textStats.sizeKB} KB
                  </span>
                  {textStats.isLarge && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                      {isClient ? t('converter.stats.largeText') : '大型文本'}
                    </span>
                  )}
                </div>
                {textStats.isLarge && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    💡 {isClient ? t('converter.stats.optimizedHint') : '提示：大型文本使用优化处理'}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={convertBase64ToImage}
                disabled={isLoading || isTextProcessing}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                {isLoading ? (isClient ? t('converter.labels.loading') : 'Processing...') : (isClient ? t('converter.actions.decode') : 'Convert to Image')}
              </button>
              <button
                onClick={downloadImage}
                disabled={!convertedImageUrl}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                {isClient ? t('converter.actions.downloadImage') : 'Download Image'}
              </button>
            </div>
          </div>
        )}
        
        {/* Encode Tab */}
        {activeTab === 'encode' && (
          <div className="p-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
                ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
              <div className="space-y-2">
                <p className="text-gray-500 dark:text-gray-400">
                  {isClient ? t('converter.labels.dropzone') : 'Drag and drop image here, or click to select file'}
                </p>
                {fileInfo && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 inline-block">
                    <div>📁 {fileInfo.name}</div>
                    <div>📊 {fileInfo.size} • {fileInfo.type}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Section - 优化布局，移除Image Information */}
        {(convertedImageUrl || base64Output) && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            
            {/* Base64转图片结果 */}
            {convertedImageUrl && activeTab === 'decode' && (
              <>
                {/* Title with File Info */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {isClient ? t('converter.labels.resultTitle') : 'Conversion Result'}
                  </h3>
                  
                  {/* File Information */}
                  {fileInfo && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{fileInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                          {fileInfo.size}
                        </span>
                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs">
                          {fileInfo.type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Image Preview */}
                <div className="p-3 border rounded-lg bg-white dark:bg-gray-700">
                  <img src={convertedImageUrl} alt="Converted from Base64" className="max-w-full mx-auto rounded" />
                </div>
              </>
            )}
            
            {/* 图片转Base64结果 */}
            {base64Output && activeTab === 'encode' && (
              <>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">{isClient ? t('converter.labels.outputTitle') : 'Base64 Output'}</h3>
                {/* Base64 Output - 缩小高度 */}
                <div className="mb-3">
                  <textarea
                    readOnly
                    value={base64Output}
                    className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
                
                {/* 图片转Base64的操作按钮 - 横向铺满 */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={copyBase64}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm"
                  >
                    {isClient ? t('converter.actions.copy') : 'Copy'}
                  </button>
                  <button
                    onClick={downloadBase64Text}
                    className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                  >
                    {isClient ? t('converter.actions.downloadTxt') : 'Download as TXT'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 