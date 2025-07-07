'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Copy, Download, FileText, Trash2, Code, Braces, Maximize, Minimize, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Base64JsonConverterProps {
  onTabChange?: () => void;
}

export default function Base64JsonConverter({ onTabChange }: Base64JsonConverterProps) {
  const t = useTranslations('tools.base64-json');
  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');
  const [base64Input, setBase64Input] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  
  // 确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
  const jsonInputRef = useRef<HTMLTextAreaElement>(null);
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

  // Base64 转 JSON
  const decodeBase64ToJson = () => {
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
      
      // 尝试解析JSON
      let formatted = decoded;
      try {
        const parsed = JSON.parse(decoded);
        formatted = JSON.stringify(parsed, null, indentSize);
      } catch (jsonError) {
        if (!forceConvert) {
          setIsProcessing(false);
          showConfirmation(
            t('dialog.formatWarning'),
            t('messages.warningInvalidJson'),
            () => performBase64Decode(true)
          );
          return;
        }
        // 如果强制转换，使用原始解码结果
        formatted = decoded;
      }
      
      setJsonOutput(formatted);
      toast.success(t('messages.success'));
    } catch (error: any) {
      const errorMessage = error.message || t('messages.errorUnknown');
      toast.error(t('messages.errorFail') + errorMessage);
      setJsonOutput('');
    } finally {
      setIsProcessing(false);
    }
  };

  // JSON 转 Base64
  const encodeJsonToBase64 = () => {
    if (!jsonInput.trim()) {
      toast.error(t('messages.errorInvalidJson'));
      return;
    }

    // 尝试验证JSON格式
    try {
      JSON.parse(jsonInput);
      performJsonEncode(false);
    } catch (jsonError) {
      // 显示确认对话框
      showConfirmation(
        t('dialog.formatWarning'),
        t('messages.warningInvalidJson'),
        () => performJsonEncode(true)
      );
    }
  };

  // 执行JSON编码
  const performJsonEncode = (forceConvert: boolean = false) => {
    setIsProcessing(true);
    
    try {
      let jsonString = jsonInput;
      
      if (!forceConvert) {
        try {
          const parsed = JSON.parse(jsonInput);
          jsonString = JSON.stringify(parsed);
        } catch (jsonError) {
          // 这种情况不应该发生，因为我们已经在上面检查过了
          jsonString = jsonInput;
        }
      }
      
      // 转换为Base64
      const encoded = btoa(jsonString);
      
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

  // 下载JSON文件
  const downloadJsonFile = () => {
    if (!jsonOutput) return;
    
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('messages.jsonDownloaded'));
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
    setJsonInput('');
    setJsonOutput('');
    setBase64Output('');
    toast.success(t('messages.cleared'));
  };

  // 格式化JSON
  const formatJsonInput = () => {
    if (!jsonInput.trim()) return;
    
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setJsonInput(formatted);
      toast.success(t('messages.formatted'));
    } catch (error) {
      toast.error(t('messages.errorInvalidJson'));
    }
  };

  // 压缩JSON
  const minifyJsonInput = () => {
    if (!jsonInput.trim()) return;
    
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonInput(minified);
      toast.success(t('messages.minified'));
    } catch (error) {
      toast.error(t('messages.errorInvalidJson'));
    }
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
              <Braces className="h-4 w-4" />
              {t('tabs.encode')}
            </TabsTrigger>
          </TabsList>

          {/* Base64 转 JSON */}
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
                      onClick={decodeBase64ToJson}
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
                    {jsonOutput && (
                      <>
                        <Button 
                          onClick={() => copyToClipboard(jsonOutput)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t('actions.copy')}
                        </Button>
                        <Button 
                          onClick={downloadJsonFile}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {t('actions.downloadJson')}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* JSON 输出 */}
              {jsonOutput && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Braces className="h-5 w-5" />
                        {t('labels.resultTitle')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {getTextStats(jsonOutput).length} {t('textStats.characters')}
                        </Badge>
                        <Badge variant="secondary">
                          {getTextStats(jsonOutput).lines} {t('textStats.lines')}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={jsonOutput}
                      readOnly
                      className="min-h-[300px] font-mono text-sm bg-gray-50 dark:bg-gray-900"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* JSON 转 Base64 */}
          <TabsContent value="encode" className="mt-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Braces className="h-5 w-5" />
                    JSON {t('labels.inputLabel')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    ref={jsonInputRef}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={t('labels.jsonInputPlaceholder')}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={encodeJsonToBase64}
                      disabled={isProcessing || !jsonInput.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isProcessing ? t('labels.loading') : t('actions.encode')}
                    </Button>
                    <Button 
                      onClick={formatJsonInput}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Maximize className="h-4 w-4" />
                      {t('actions.format')}
                    </Button>
                    <Button 
                      onClick={minifyJsonInput}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Minimize className="h-4 w-4" />
                      {t('actions.minify')}
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