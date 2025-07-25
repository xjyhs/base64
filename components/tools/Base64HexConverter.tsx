'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Copy, Download, FileText, Trash2, Code, Hash, AlertTriangle } from 'lucide-react';
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
  
  // 确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
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

  // 显示确认对话框
  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialogConfig({ title, message, onConfirm });
    setShowConfirmDialog(true);
  };

  // 处理确认对话框的确认操作
  const handleConfirm = () => {
    setShowConfirmDialog(false);
    if (confirmDialogConfig?.onConfirm) {
      confirmDialogConfig.onConfirm();
    }
    setConfirmDialogConfig(null);
  };

  // 处理确认对话框的取消操作
  const handleCancel = () => {
    setShowConfirmDialog(false);
    setConfirmDialogConfig(null);
  };

  // Base64 转 Hex
  const decodeBase64ToHex = () => {
    if (!base64Input.trim()) {
      toast.error(t('messages.errorPaste'));
      return;
    }

    // 检查Base64格式
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64Input.trim())) {
      // 显示确认对话框
      showConfirmation(
        t('dialog.formatWarning'),
        t('messages.warningInvalidBase64'),
        () => performBase64Decode(true)
      );
      return;
    }

    performBase64Decode(false);
  };

  // 执行Base64解码
  const performBase64Decode = (forceConvert: boolean = false) => {
    setIsProcessing(true);
    
    try {
      // 解码Base64
      const decoded = atob(base64Input.trim());
      
      // 转换为十六进制
      let hex = '';
      for (let i = 0; i < decoded.length; i++) {
        hex += decoded.charCodeAt(i).toString(16).padStart(2, '0');
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

    // 检查十六进制格式
    const hexRegex = /^[0-9A-Fa-f\s]*$/;
    if (!hexRegex.test(hexInput.trim())) {
      // 显示确认对话框
      showConfirmation(
        t('dialog.formatWarning'),
        t('messages.warningInvalidHex'),
        () => performHexEncode(true)
      );
      return;
    }

    performHexEncode(false);
  };

  // 执行十六进制编码
  const performHexEncode = (forceConvert: boolean = false) => {
    setIsProcessing(true);
    
    try {
      let hexString = hexInput.trim().replace(/\s+/g, '');
      
      if (!forceConvert) {
        // 验证十六进制格式
        const hexRegex = /^[0-9A-Fa-f]*$/;
        if (!hexRegex.test(hexString)) {
          throw new Error(t('messages.errorInvalidHex'));
        }
      }
      
      // 确保偶数长度
      if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
      }
      
      // 转换为字符串
      let str = '';
      for (let i = 0; i < hexString.length; i += 2) {
        str += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
      }
      
      // 转换为Base64
      const encoded = btoa(str);
      
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
    toast.success(t('messages.textDownloaded'));
  };

  // 清空所有内容
  const clearAll = () => {
    setBase64Input('');
    setHexInput('');
    setHexOutput('');
    setBase64Output('');
    toast.success(t('messages.cleared'));
  };

  // 格式化十六进制
  const formatHexInput = () => {
    if (!hexInput.trim()) return;
    
    // 移除空格并转换为大写
    let formatted = hexInput.trim().replace(/\s+/g, '').toUpperCase();
    
    // 每两个字符添加一个空格
    formatted = formatted.replace(/(.{2})/g, '$1 ').trim();
    
    setHexInput(formatted);
    toast.success(t('messages.formatted'));
  };

  // 计算文本统计信息
  const getTextStats = (text: string) => {
    if (!text) return { length: 0, size: 0, lines: 0 };
    
    const lines = text.split('\n').length;
    const size = new Blob([text]).size;
    
    return {
      length: text.length,
      size,
      lines
    };
  };

  return (
    <>
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
                          {getTextStats(hexOutput).lines} {t('textStats.lines')}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={hexOutput}
                      readOnly
                      className="min-h-[300px] font-mono text-sm bg-gray-50 dark:bg-gray-900"
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
                      onClick={formatHexInput}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Code className="h-4 w-4" />
                      {t('actions.format')}
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
                          {base64Output.length} {t('textStats.characters')}
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

      {/* 确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {confirmDialogConfig?.title}
            </DialogTitle>
            <DialogDescription className="text-left">
              {confirmDialogConfig?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {t('dialog.cancel')}
            </Button>
            <Button onClick={handleConfirm} className="bg-orange-500 hover:bg-orange-600">
              {t('dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 