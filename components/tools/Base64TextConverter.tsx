'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Copy, 
  FileText, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Upload,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Base64TextConverterProps {
  onTabChange?: () => void;
}

export default function Base64TextConverter({ onTabChange }: Base64TextConverterProps) {
  const t = useTranslations('tools.base64-text');
  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');
  const [textInput, setTextInput] = useState('');
  const [base64Input, setBase64Input] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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

  // Base64 格式验证
  const isValidBase64 = (str: string): boolean => {
    try {
      const cleaned = str.replace(/\s/g, '');
      if (cleaned.length === 0) return false;
      if (cleaned.length % 4 !== 0) return false;
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Regex.test(cleaned);
    } catch {
      return false;
    }
  };

  // 文本编码为 Base64
  const encodeTextToBase64 = () => {
    if (!textInput.trim()) {
      toast.error(t('messages.errorPaste'));
      return;
    }

    const action = () => {
      try {
        const encoded = btoa(unescape(encodeURIComponent(textInput)));
        setBase64Output(encoded);
        toast.success(t('messages.success'));
      } catch (error) {
        toast.error(t('messages.errorFail') + (error as Error).message);
      }
    };

    if (textInput.length > 1000) {
      setPendingAction(() => action);
      setShowConfirmDialog(true);
    } else {
      action();
    }
  };

  // Base64 解码为文本
  const decodeBase64ToText = () => {
    if (!base64Input.trim()) {
      toast.error(t('messages.errorPaste'));
      return;
    }

    const action = () => {
      try {
        const cleaned = base64Input.replace(/\s/g, '');
        
        if (!isValidBase64(cleaned)) {
          toast.warning(t('messages.warningInvalidBase64'));
        }

        const decoded = decodeURIComponent(escape(atob(cleaned)));
        setTextOutput(decoded);
        toast.success(t('messages.success'));
      } catch (error) {
        toast.error(t('messages.errorFail') + (error as Error).message);
      }
    };

    if (base64Input.length > 1000) {
      setPendingAction(() => action);
      setShowConfirmDialog(true);
    } else {
      action();
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: 'text' | 'base64') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('messages.copied'));
    } catch (error) {
      toast.error(t('messages.copyFail'));
    }
  };

  // 下载文本文件
  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('messages.txtDownloaded'));
  };

  // 粘贴文本
  const pasteText = async (type: 'text' | 'base64') => {
    try {
      const text = await navigator.clipboard.readText();
      if (type === 'text') {
        setTextInput(text);
      } else {
        setBase64Input(text);
      }
      toast.success(t('messages.pasted'));
    } catch (error) {
      toast.error(t('messages.pasteFail'));
    }
  };

  // 清空内容
  const clearAll = () => {
    setTextInput('');
    setBase64Input('');
    setTextOutput('');
    setBase64Output('');
    toast.success(t('messages.cleared'));
  };

  // 确认对话框处理
  const handleConfirmDialog = (confirmed: boolean) => {
    if (confirmed && pendingAction) {
      pendingAction();
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  return (
    <div className="w-full space-y-8" onClick={handleComponentClick}>
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as 'decode' | 'encode');
        handleComponentClick();
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="decode" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('tabs.decode')}
          </TabsTrigger>
          <TabsTrigger value="encode" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t('tabs.encode')}
          </TabsTrigger>
        </TabsList>

        {/* Base64 解码为文本 */}
        <TabsContent value="decode" className="mt-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('labels.base64Input')}
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pasteText('base64')}
                        className="h-8 px-3"
                      >
                        {t('actions.paste')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAll}
                        className="h-8 px-3"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder={t('labels.base64Placeholder')}
                    className="min-h-[120px] font-mono text-sm"
                  />
                  <div className="flex gap-3">
                    <Button 
                      onClick={decodeBase64ToText}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!base64Input.trim()}
                    >
                      {t('actions.decode')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {textOutput && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {t('labels.textOutput')}
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(textOutput, 'text')}
                          className="h-8 px-3"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {t('actions.copy')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadText(textOutput, 'decoded-text.txt')}
                          className="h-8 px-3"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          {t('actions.download')}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={textOutput}
                      readOnly
                      className="min-h-[120px] bg-gray-50 font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* 文本编码为 Base64 */}
        <TabsContent value="encode" className="mt-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('labels.textInput')}
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pasteText('text')}
                        className="h-8 px-3"
                      >
                        {t('actions.paste')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAll}
                        className="h-8 px-3"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={t('labels.textPlaceholder')}
                    className="min-h-[120px] text-sm"
                  />
                  <div className="flex gap-3">
                    <Button 
                      onClick={encodeTextToBase64}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={!textInput.trim()}
                    >
                      {t('actions.encode')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 为按钮预留固定空间，避免布局跳动 */}
            <div className="h-12 flex gap-3">
              {base64Output && (
                <>
                  <Button 
                    onClick={() => copyToClipboard(base64Output, 'base64')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {t('actions.copy')}
                  </Button>
                  <Button 
                    onClick={() => downloadText(base64Output, 'encoded-base64.txt')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t('actions.downloadTxt')}
                  </Button>
                </>
              )}
            </div>

            {base64Output && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">
                      {t('labels.base64Output')}
                    </label>
                    <Textarea
                      value={base64Output}
                      readOnly
                      className="min-h-[120px] bg-gray-50 font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {t('dialog.formatWarning')}
            </DialogTitle>
            <DialogDescription>
              {t('dialog.largeTextWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleConfirmDialog(false)}
            >
              {t('dialog.cancel')}
            </Button>
            <Button
              onClick={() => handleConfirmDialog(true)}
            >
              {t('dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 