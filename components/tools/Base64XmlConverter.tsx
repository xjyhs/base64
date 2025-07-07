'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Copy, Download, FileText, Trash2, Code, FileCode, Maximize, Minimize, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Base64XmlConverterProps {
  onTabChange?: () => void;
}

export default function Base64XmlConverter({ onTabChange }: Base64XmlConverterProps) {
  const t = useTranslations('tools.base64-xml');
  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');
  const [base64Input, setBase64Input] = useState('');
  const [xmlInput, setXmlInput] = useState('');
  const [xmlOutput, setXmlOutput] = useState('');
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
  
  const xmlInputRef = useRef<HTMLTextAreaElement>(null);
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

  // XML格式化函数
  const formatXml = (xml: string, indent: number = 2): string => {
    const PADDING = ' '.repeat(indent);
    const reg = /(>)(<)(\/*)/g;
    let formatted = xml.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    
    return formatted.split('\r\n').map((line) => {
      let indent = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (line.match(/^<\/\w/)) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      
      const padding = PADDING.repeat(pad);
      pad += indent;
      
      return padding + line;
    }).join('\r\n');
  };

  // XML压缩函数
  const minifyXml = (xml: string): string => {
    return xml.replace(/>\s*</g, '><').trim();
  };

  // XML验证函数
  const validateXml = (xml: string): boolean => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const errors = doc.getElementsByTagName('parsererror');
      return errors.length === 0;
    } catch (error) {
      return false;
    }
  };

  // Base64 转 XML
  const decodeBase64ToXml = () => {
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
      
      // 尝试验证和格式化XML
      let formatted = decoded;
      if (!forceConvert && !validateXml(decoded)) {
        setIsProcessing(false);
        showConfirmation(
          t('dialog.formatWarning'),
          t('messages.warningInvalidXml'),
          () => performBase64Decode(true)
        );
        return;
      }
      
      // 如果是有效的XML，进行格式化
      if (validateXml(decoded)) {
        try {
          formatted = formatXml(decoded, indentSize);
        } catch (formatError) {
          // 格式化失败，使用原始内容
          formatted = decoded;
        }
      }
      
      setXmlOutput(formatted);
      toast.success(t('messages.success'));
    } catch (error: any) {
      const errorMessage = error.message || t('messages.errorUnknown');
      toast.error(t('messages.errorFail') + errorMessage);
      setXmlOutput('');
    } finally {
      setIsProcessing(false);
    }
  };

  // XML 转 Base64
  const encodeXmlToBase64 = () => {
    if (!xmlInput.trim()) {
      toast.error(t('messages.errorInvalidXml'));
      return;
    }

    // 尝试验证XML格式
    if (!validateXml(xmlInput)) {
      // 显示确认对话框
      showConfirmation(
        t('dialog.formatWarning'),
        t('messages.warningInvalidXml'),
        () => performXmlEncode(true)
      );
      return;
    }

    performXmlEncode(false);
  };

  // 执行XML编码
  const performXmlEncode = (forceConvert: boolean = false) => {
    setIsProcessing(true);
    
    try {
      // 转换为Base64
      const encoded = btoa(xmlInput);
      
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

  // 下载XML文件
  const downloadXmlFile = () => {
    if (!xmlOutput) return;
    
    const blob = new Blob([xmlOutput], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('messages.xmlDownloaded'));
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
    setXmlInput('');
    setXmlOutput('');
    setBase64Output('');
    toast.success(t('messages.cleared'));
  };

  // 格式化XML
  const formatXmlInput = () => {
    if (!xmlInput.trim()) return;
    
    if (!validateXml(xmlInput)) {
      toast.error(t('messages.errorInvalidXml'));
      return;
    }
    
    try {
      const formatted = formatXml(xmlInput, indentSize);
      setXmlInput(formatted);
      toast.success(t('messages.formatted'));
    } catch (error) {
      toast.error(t('messages.errorInvalidXml'));
    }
  };

  // 压缩XML
  const minifyXmlInput = () => {
    if (!xmlInput.trim()) return;
    
    if (!validateXml(xmlInput)) {
      toast.error(t('messages.errorInvalidXml'));
      return;
    }
    
    try {
      const minified = minifyXml(xmlInput);
      setXmlInput(minified);
      toast.success(t('messages.minified'));
    } catch (error) {
      toast.error(t('messages.errorInvalidXml'));
    }
  };

  // 验证XML
  const validateXmlInput = () => {
    if (!xmlInput.trim()) {
      toast.error(t('messages.errorInvalidXml'));
      return;
    }
    
    if (validateXml(xmlInput)) {
      toast.success(t('messages.validXml'));
    } else {
      toast.error(t('messages.invalidXml'));
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
              <FileCode className="h-4 w-4" />
              {t('tabs.encode')}
            </TabsTrigger>
          </TabsList>

          {/* Base64 转 XML */}
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
                      onClick={decodeBase64ToXml}
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
                    {xmlOutput && (
                      <>
                        <Button 
                          onClick={() => copyToClipboard(xmlOutput)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t('actions.copy')}
                        </Button>
                        <Button 
                          onClick={downloadXmlFile}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {t('actions.downloadXml')}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* XML 输出 */}
              {xmlOutput && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-5 w-5" />
                        {t('labels.resultTitle')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {getTextStats(xmlOutput).length} {t('textStats.characters')}
                        </Badge>
                        <Badge variant="secondary">
                          {getTextStats(xmlOutput).lines} {t('textStats.lines')}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={xmlOutput}
                      readOnly
                      className="min-h-[300px] font-mono text-sm bg-gray-50 dark:bg-gray-900"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* XML 转 Base64 */}
          <TabsContent value="encode" className="mt-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    XML {t('labels.inputLabel')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    ref={xmlInputRef}
                    value={xmlInput}
                    onChange={(e) => setXmlInput(e.target.value)}
                    placeholder={t('labels.xmlInputPlaceholder')}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={encodeXmlToBase64}
                      disabled={isProcessing || !xmlInput.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isProcessing ? t('labels.loading') : t('actions.encode')}
                    </Button>
                    <Button 
                      onClick={formatXmlInput}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Maximize className="h-4 w-4" />
                      {t('actions.format')}
                    </Button>
                    <Button 
                      onClick={minifyXmlInput}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Minimize className="h-4 w-4" />
                      {t('actions.minify')}
                    </Button>
                    <Button 
                      onClick={validateXmlInput}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {t('actions.validate')}
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