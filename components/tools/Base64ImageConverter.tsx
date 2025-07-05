'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { base64Worker } from '@/lib/utils/workerManager';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Download, Copy, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ProgressState {
  show: boolean;
  progress: number;
  message: string;
}

interface FileInfo {
  name: string;
  size: string;
  type: string;
}

interface Base64ImageConverterProps {
  onTabChange?: () => void;
}

export default function Base64ImageConverter({ onTabChange }: Base64ImageConverterProps) {
  const t = useTranslations('tools.base64-image');

  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [convertedImageUrl, setConvertedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isTextProcessing, setIsTextProcessing] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const debouncedBase64Input = useDebounce(base64Input, 300);

  const textStats = useMemo(() => {
    if (!debouncedBase64Input) return null;
    const length = debouncedBase64Input.length;
    const sizeKB = Math.round((length * 0.75) / 1024);
    const isLarge = length > 100000; // 100KB
    return { length, sizeKB, isLarge };
  }, [debouncedBase64Input]);

  useEffect(() => {
    return () => {
      // Clean up worker when component unmounts
      // base64Worker.terminate(); // This would terminate for all components, maybe not what we want if it's shared.
      if (convertedImageUrl) {
        URL.revokeObjectURL(convertedImageUrl);
      }
    };
  }, [convertedImageUrl]);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    e.preventDefault();
    
    if (!pastedText) return;

    setIsTextProcessing(true);
    toast.info(t('messages.processing'));

    // 使用setTimeout将繁重的任务推迟到下一个事件循环
    // 以便UI可以立即响应并显示加载状态
    setTimeout(() => {
        try {
            setBase64Input(pastedText);
            toast.success(t('messages.textPasted'));
        } catch (error) {
            toast.error(t('messages.errorFail'));
            console.error(error);
        } finally {
            setIsTextProcessing(false);
        }
    }, 10);
  };

  const convertBase64ToImage = useCallback(async () => {
    if (!base64Input.trim()) {
      toast.error(t('messages.errorPaste'));
      return;
    }

    if (!base64Worker) {
      toast.error('Worker not available');
      return;
    }

    setIsLoading(true);
    setFileInfo(null);

    try {
      const result = await base64Worker.base64ToBlob(
        base64Input,
        () => {} // Provide empty progress callback
      );
      
      if (result && result.url) {
        if (convertedImageUrl) URL.revokeObjectURL(convertedImageUrl);
        setConvertedImageUrl(result.url);
        setFileInfo({
          name: 'converted-image.png',
          size: `${result.size.size} ${result.size.unit}`,
          type: result.type || 'image/png',
        });
        toast.success(t('messages.success'));
      } else {
        toast.error(t('messages.errorInvalid'));
      }
    } catch (error) {
      toast.error(t('messages.errorFail') + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [base64Input, convertedImageUrl, t]);

  const convertImageToBase64 = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('messages.errorSelect'));
      return;
    }
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast.error(t('messages.errorSize'));
      return;
    }

    if (!base64Worker) {
      toast.error('Worker not available');
      return;
    }

    setIsLoading(true);
    setFileInfo(null);

    try {
      const result = await base64Worker.fileToBase64(
        file,
        () => {} // Provide empty progress callback
      );

      if (result && result.data) {
        setBase64Output(result.data);
        setFileInfo({
          name: file.name,
          size: `${result.sizeInfo.size} ${result.sizeInfo.unit}`,
          type: file.type,
        });
        toast.success(t('messages.success'));
      } else {
        toast.error(t('messages.errorUnknown'));
      }
    } catch (error) {
      toast.error(t('messages.errorFail') + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) convertImageToBase64(file);
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
    const file = e.dataTransfer.files?.[0];
    if (file) convertImageToBase64(file);
  };

  const downloadImage = () => {
    if (convertedImageUrl && fileInfo) {
      const link = document.createElement('a');
      link.href = convertedImageUrl;
      link.download = fileInfo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('messages.imageDownloaded'));
    }
  };

  const copyBase64 = async () => {
    const textToCopy = activeTab === 'encode' ? base64Output : base64Input;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast.success(t('messages.copied'));
      } catch {
        toast.error(t('messages.copyFail'));
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
      toast.success(t('messages.textDownloaded'));
    }
  };

  const clearAll = () => {
    setBase64Input('');
    setBase64Output('');
    if (convertedImageUrl) URL.revokeObjectURL(convertedImageUrl);
    setConvertedImageUrl('');
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info(t('messages.cleared'));
  };

  // 检查页面是否在顶部
  const isPageAtTop = () => {
    return window.scrollY < 100; // 如果滚动位置小于100px，认为在顶部
  };

  // 处理整个组件的点击事件
  const handleComponentClick = () => {
    if (isPageAtTop() && onTabChange) {
      onTabChange();
    }
  };

  return (
    <div className="w-full space-y-8" onClick={handleComponentClick}>
        <Tabs value={activeTab} onValueChange={(v) => {
            setActiveTab(v as 'decode' | 'encode');
            handleComponentClick();
        }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-2xl h-12">
                <TabsTrigger value="decode" className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    {t('tabs.decode')}
                </TabsTrigger>
                <TabsTrigger value="encode" className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    {t('tabs.encode')}
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="decode" className="mt-8">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700">
                            {t('tabs.decode')} - {t('labels.decodeLabel')}
                        </label>
                        <Textarea
                            placeholder={t('actions.paste')}
                            value={base64Input}
                            onChange={(e) => setBase64Input(e.target.value)}
                            onPaste={handlePaste}
                            className="min-h-[160px] resize-none border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-blue-500/20"
                            disabled={isLoading || isTextProcessing}
                        />
                        <div className="h-10 flex items-center">
                            {textStats && (
                                <div className="text-xs text-gray-500 flex justify-between items-center bg-gray-50 px-4 py-2 rounded-xl w-full">
                                    <span>{t('textStats.length')}: {textStats.length.toLocaleString()} {t('textStats.characters')} / {t('textStats.size')}: ~{textStats.sizeKB} KB</span>
                                    {textStats.isLarge && <span className="text-blue-600 font-medium">{t('textStats.optimizedHint')}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button 
                            onClick={convertBase64ToImage} 
                            disabled={isLoading || isTextProcessing || !base64Input}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                            {t('actions.decode')}
                        </Button>
                        <Button 
                            onClick={clearAll} 
                            variant="outline"
                            className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('actions.clear')}
                        </Button>
                    </div>
                </div>
            </TabsContent>
            
            <TabsContent value="encode" className="mt-8">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700">
                            {t('tabs.encode')} - {t('labels.encodeLabel')}
                        </label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200
                            ${dragOver 
                                ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-white"/>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-gray-900">{t('labels.dropzone')}</p>
                                    <p className="text-sm text-gray-500">{t('labels.supportedFormats')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 为按钮预留固定空间，避免布局跳动 */}
                    <div className="h-12 flex gap-3">
                        {base64Output && (
                            <>
                                <Button 
                                    onClick={copyBase64}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    {t('actions.copy')}
                                </Button>
                                <Button 
                                    onClick={downloadBase64Text}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {t('actions.downloadTxt')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </TabsContent>
        </Tabs>

        {/* The result area placeholder logic has been removed to simplify */}
        {(convertedImageUrl || base64Output) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{t('labels.resultTitle')}</h3>
                    <div className="flex items-center gap-4">
                        {fileInfo && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">{fileInfo.size}</span>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                    {fileInfo.type.split('/')[1]?.toUpperCase()}
                                </span>
                            </div>
                        )}
                        {activeTab === 'decode' && convertedImageUrl && (
                            <Button 
                                onClick={downloadImage}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {t('actions.downloadImage')}
                            </Button>
                        )}
                    </div>
                </div>
                
                {activeTab === 'decode' && convertedImageUrl && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <img src={convertedImageUrl} alt="Converted from Base64" className="max-w-full mx-auto rounded-xl" />
                    </div>
                )}
                
                {activeTab === 'encode' && base64Output && (
                    <div className="space-y-6">
                        <Textarea 
                            readOnly 
                            value={base64Output} 
                            className="min-h-[160px] resize-none border-gray-200 rounded-2xl bg-white font-mono text-sm"
                        />
                    </div>
                )}
            </div>
        )}
    </div>
  );
} 