'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, FileText, Trash2, Code, Minimize, Maximize, AlertCircle } from 'lucide-react';
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

  // Base64 转 JSON
  const decodeBase64ToJson = () => {
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

      // 解码Base64
      const decoded = atob(base64Input.trim());
      
      // 解析JSON
      const parsed = JSON.parse(decoded);
      
      // 格式化JSON
      const formatted = JSON.stringify(parsed, null, indentSize);
      
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

    setIsProcessing(true);
    
    try {
      // 验证JSON格式
      const parsed = JSON.parse(jsonInput);
      
      // 转换为Base64
      const jsonString = JSON.stringify(parsed);
      const encoded = btoa(jsonString);
      
      setBase64Output(encoded);
      toast.success(t('messages.success'));
    } catch (error: any) {
      const errorMessage = error.message || t('messages.errorUnknown');
      toast.error(t('messages.errorParseJson') + errorMessage);
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
  const formatJson = () => {
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
  const minifyJson = () => {
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
    if (!text) return { length: 0, size: 0, lines: 0, objects: 0, arrays: 0 };
    
    const lines = text.split('\n').length;
    const size = new Blob([text]).size;
    
    let objects = 0;
    let arrays = 0;
    
    try {
      const parsed = JSON.parse(text);
      const countObjects = (obj: any) => {
        if (Array.isArray(obj)) {
          arrays++;
          obj.forEach(countObjects);
        } else if (obj && typeof obj === 'object') {
          objects++;
          Object.values(obj).forEach(countObjects);
        }
      };
      countObjects(parsed);
    } catch (e) {
      // 忽略解析错误
    }
    
    return {
      length: text.length,
      size,
      lines,
      objects,
      arrays
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
            <FileText className="h-4 w-4" />
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
                      <FileText className="h-5 w-5" />
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
                  <FileText className="h-5 w-5" />
                  {t('labels.inputLabel')}
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
                    {isProcessing ? t('labels.loading') : 'Convert to Base64'}
                  </Button>
                  <Button 
                    onClick={formatJson}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Maximize className="h-4 w-4" />
                    {t('actions.format')}
                  </Button>
                  <Button 
                    onClick={minifyJson}
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
  );
} 