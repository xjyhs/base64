'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Download, Copy, Trash2, File, Loader2, Eye } from 'lucide-react';

interface FileInfo {
  name: string;
  size: string;
  type: string;
}

interface Base64PdfConverterProps {
  onTabChange?: () => void;
}

export default function Base64PdfConverter({ onTabChange }: Base64PdfConverterProps) {
  const t = useTranslations('tools.base64-pdf');

  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [convertedPdfUrl, setConvertedPdfUrl] = useState('');
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
      if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
      }
    };
  }, [convertedPdfUrl]);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    e.preventDefault();
    
    if (!pastedText) return;

    setIsTextProcessing(true);
    toast.info(t('messages.processing'));

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

  const base64ToBlob = (base64: string, mimeType: string = 'application/pdf') => {
    const byteCharacters = atob(base64.replace(/^data:.*,/, ''));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const convertBase64ToPdf = useCallback(async () => {
    if (!base64Input.trim()) {
      toast.error(t('messages.errorPaste'));
      return;
    }

    setIsLoading(true);
    setFileInfo(null);

    try {
      const blob = base64ToBlob(base64Input, 'application/pdf');
      const url = URL.createObjectURL(blob);
      
      if (convertedPdfUrl) URL.revokeObjectURL(convertedPdfUrl);
      setConvertedPdfUrl(url);
      
      const sizeKB = Math.round(blob.size / 1024);
      const sizeDisplay = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      
      setFileInfo({
        name: 'converted-file.pdf',
        size: sizeDisplay,
        type: 'application/pdf',
      });
      
      toast.success(t('messages.success'));
    } catch (error) {
      toast.error(t('messages.errorInvalid'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [base64Input, convertedPdfUrl, t]);

  const convertPdfToBase64 = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error(t('messages.errorSelect'));
      return;
    }
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast.error(t('messages.errorSize'));
      return;
    }

    setIsLoading(true);
    setFileInfo(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setBase64Output(result);
          const sizeKB = Math.round(file.size / 1024);
          const sizeDisplay = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
          
          setFileInfo({
            name: file.name,
            size: sizeDisplay,
            type: file.type,
          });
          toast.success(t('messages.success'));
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        toast.error(t('messages.errorFail'));
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(t('messages.errorFail'));
      setIsLoading(false);
    }
  }, [t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) convertPdfToBase64(selectedFile);
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) convertPdfToBase64(droppedFile);
  };

  const downloadPdf = () => {
    if (!convertedPdfUrl) return;
    
    const link = document.createElement('a');
    link.href = convertedPdfUrl;
    link.download = fileInfo?.name || 'converted-file.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('messages.pdfDownloaded'));
  };

  const viewPdf = () => {
    if (!convertedPdfUrl) return;
    window.open(convertedPdfUrl, '_blank');
  };

  const copyBase64 = async () => {
    if (!base64Output) return;
    
    try {
      await navigator.clipboard.writeText(base64Output);
      toast.success(t('messages.copied'));
    } catch (error) {
      toast.error(t('messages.copyFailed'));
    }
  };

  const downloadBase64Text = () => {
    if (!base64Output) return;
    
    const blob = new Blob([base64Output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'base64-pdf.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t('messages.textDownloaded'));
  };

  const clearAll = () => {
    setBase64Input('');
    setBase64Output('');
    if (convertedPdfUrl) URL.revokeObjectURL(convertedPdfUrl);
    setConvertedPdfUrl('');
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
              <div className="relative">
                <Textarea
                  placeholder={t('actions.paste')}
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  onPaste={handlePaste}
                  className="min-h-[160px] resize-none border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={isLoading || isTextProcessing}
                />
                {isTextProcessing && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{t('labels.processingText')}</span>
                    </div>
                  </div>
                )}
              </div>
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
                onClick={convertBase64ToPdf} 
                disabled={isLoading || isTextProcessing || !base64Input}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <File className="mr-2 h-4 w-4" />}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
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

      {/* 结果显示区域 */}
      {(convertedPdfUrl || base64Output) && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{t('labels.resultTitle')}</h3>
            <div className="flex items-center gap-4">
              {fileInfo && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{fileInfo.size}</span>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                    PDF
                  </span>
                </div>
              )}
              {activeTab === 'decode' && convertedPdfUrl && (
                <Button 
                  onClick={downloadPdf}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('actions.downloadPdf')}
                </Button>
              )}
            </div>
          </div>
          
          {activeTab === 'decode' && convertedPdfUrl && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <iframe 
                src={convertedPdfUrl} 
                className="w-full h-[600px] rounded-xl border-0"
                title="PDF Preview"
              />
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