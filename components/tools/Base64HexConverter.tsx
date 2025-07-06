'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, FileText, Trash2, Code, Hash, ArrowUpDown, Type } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Base64HexConverterProps {
  onTabChange?: () => void;
}

export default function Base64HexConverter({ onTabChange }: Base64HexConverterProps) {
  const t = useTranslations('tools.base64-hex');
  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');
  const [base64Input, setBase64Input] = useState('');
  const [hexInput, setHexInput] = useState('');
  const [hexOutput, setHexOutput] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const hexInputRef = useRef<HTMLTextAreaElement>(null);
  const base64InputRef = useRef<HTMLTextAreaElement>(null);

  // 检查页面是否在顶部
  const isPageAtTop = () => {
    return window.scrollY < 100;
  };

  // 处理整个组件的点击事件
  const handleComponentClick = () => {
    if (isPageAtTop() && onTabChange) {
      onTabChange();
    }
  };

  // Base64 转 Hex
  const decodeBase64ToHex = () => {
    if (!base64Input.trim()) {
      toast.error(t('messages.errorPaste'));
      return;
    }

    setIsProcessing(true);
    
    try {
      // 验证Base64格式
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(base64Input.trim())) {
        throw new Error(t('messages.errorInvalidBase64'));
      }

      // 解码Base64到二进制
      const decoded = atob(base64Input.trim());
      
      // 转换为十六进制
      let hex = '';
      for (let i = 0; i < decoded.length; i++) {
        const byte = decoded.charCodeAt(i);
        hex += byte.toString(16).padStart(2, '0');
      }
      
      setHexOutput(hex.toUpperCase());
      toast.success(t('messages.success'));
    } catch (error: any) {
      const errorMessage = error.message || t('messages.errorUnknown');
      toast.error(t('messages.errorFail') + errorMessage);
      setHexOutput('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Hex 转 Base64
  const encodeHexToBase64 = () => {
    if (!hexInput.trim()) {
      toast.error(t('messages.errorInvalidHex'));
      return;
    }

    setIsProcessing(true);
    
    try {
      // 清理输入，移除空格和分隔符
      const cleanHex = hexInput.replace(/[\s\-:]/g, '');
      
      // 验证Hex格式
      const hexRegex = /^[0-9A-Fa-f]+$/;
      if (!hexRegex.test(cleanHex)) {
        throw new Error(t('messages.errorInvalidHex'));
      }

      // 确保是偶数长度
      const paddedHex = cleanHex.length % 2 === 0 ? cleanHex : '0' + cleanHex;
      
      // 转换为二进制字符串
      let binary = '';
      for (let i = 0; i < paddedHex.length; i += 2) {
        const byte = parseInt(paddedHex.substr(i, 2), 16);
        binary += String.fromCharCode(byte);
      }
      
      // 编码为Base64
      const encoded = btoa(binary);
      
      setBase64Output(encoded);
      toast.success(t('messages.success'));
    } catch (error: any) {
      const errorMessage = error.message || t('messages.errorUnknown');
      toast.error(t('messages.errorFail') + errorMessage);
      setBase64Output('');
    } finally {
      setIsProcessing(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t('messages.copied'));
    }).catch(() => {
      toast.error(t('messages.copyFail'));
    });
  };

  // 下载Hex文件
  const downloadHexFile = () => {
    if (!hexOutput) return;
    
    const blob = new Blob([hexOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.hex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('messages.hexDownloaded'));
  };

  // 下载Base64文本文件
  const downloadBase64Text = () => {
    if (!base64Output) return;
    
    const blob = new Blob([base64Output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'base64.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('messages.txtDownloaded'));
  };

  // 清空所有内容
  const clearAll = () => {
    setBase64Input('');
    setHexInput('');
    setHexOutput('');
    setBase64Output('');
    toast.success(t('messages.cleared'));
  };

  // 格式化Hex（添加空格分隔）
  const formatHex = () => {
    if (!hexInput.trim()) return;
    
    try {
      const cleanHex = hexInput.replace(/[\s\-:]/g, '');
      const formatted = cleanHex.replace(/(.{2})/g, '$1 ').trim();
      setHexInput(formatted.toUpperCase());
      toast.success(t('messages.formatted'));
    } catch (error) {
      toast.error(t('messages.errorInvalidHex'));
    }
  };

  // 转换为大写
  const toUpperCase = () => {
    if (!hexInput.trim()) return;
    setHexInput(hexInput.toUpperCase());
  };

  // 转换为小写
  const toLowerCase = () => {
    if (!hexInput.trim()) return;
    setHexInput(hexInput.toLowerCase());
  };

  // 计算文本统计信息
  const getTextStats = (text: string) => {
    if (!text) return { length: 0, size: 0, lines: 0, bytes: 0 };
    
    const lines = text.split('\n').length;
    const size = new Blob([text]).size;
    const bytes = text.length;
    
    return {
      length: text.length,
      size,
      lines,
      bytes
    };
  };

  return (
    <div className="w-full space-y-8" onClick={handleComponentClick}>
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as 'decode' | 'encode');
        handleComponentClick();
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="decode" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            {t('tabs.decode')}
          </TabsTrigger>
          <TabsTrigger value="encode" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            {t('tabs.encode')}
          </TabsTrigger>
        </TabsList>

        {/* Base64 转 Hex */}
        <TabsContent value="decode" className="mt-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Base64 {t('labels.inputLabel')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  ref={base64InputRef}
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder={t('labels.base64InputPlaceholder')}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={decodeBase64ToHex}
                    disabled={isProcessing || !base64Input.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isProcessing ? t('labels.loading') : t('actions.decode')}
                  </Button>
                  <Button 
                    onClick={clearAll}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('actions.clear')}
                  </Button>
                </div>
                
                {/* 为按钮预留固定空间，避免布局跳动 */}
                <div className="h-12 flex gap-3">
                  {hexOutput && (
                    <>
                      <Button 
                        onClick={() => copyToClipboard(hexOutput)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {t('actions.copy')}
                      </Button>
                      <Button 
                        onClick={downloadHexFile}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {t('actions.downloadHex')}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hex 输出 */}
            {hexOutput && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      {t('labels.resultTitle')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {getTextStats(hexOutput).length} {t('textStats.characters')}
                      </Badge>
                      <Badge variant="secondary">
                        {Math.floor(getTextStats(hexOutput).length / 2)} {t('textStats.bytes')}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={hexOutput}
                    readOnly
                    className="min-h-[200px] font-mono text-sm bg-gray-50 dark:bg-gray-900"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Hex 转 Base64 */}
        <TabsContent value="encode" className="mt-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Hex {t('labels.inputLabel')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  ref={hexInputRef}
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  placeholder={t('labels.hexInputPlaceholder')}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={encodeHexToBase64}
                    disabled={isProcessing || !hexInput.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isProcessing ? t('labels.loading') : t('actions.encode')}
                  </Button>
                  <Button 
                    onClick={formatHex}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {t('actions.format')}
                  </Button>
                  <Button 
                    onClick={toUpperCase}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    {t('actions.uppercase')}
                  </Button>
                  <Button 
                    onClick={toLowerCase}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    {t('actions.lowercase')}
                  </Button>
                  <Button 
                    onClick={clearAll}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('actions.clear')}
                  </Button>
                </div>
                
                {/* 为按钮预留固定空间，避免布局跳动 */}
                <div className="h-12 flex gap-3">
                  {base64Output && (
                    <>
                      <Button 
                        onClick={() => copyToClipboard(base64Output)}
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
              </CardContent>
            </Card>

            {/* Base64 输出 */}
            {base64Output && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      {t('labels.outputTitle')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {getTextStats(base64Output).length} {t('textStats.characters')}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={base64Output}
                    readOnly
                    className="min-h-[200px] font-mono text-sm bg-gray-50 dark:bg-gray-900"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 