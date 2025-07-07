'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Download, Upload, Trash2, FileSpreadsheet, Eye, EyeOff, File } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import * as XLSX from 'xlsx';

interface Base64ExcelConverterProps {
  onTabChange?: () => void;
}

interface ExcelData {
  sheets: {
    name: string;
    data: any[][];
    rowCount: number;
    colCount: number;
  }[];
  fileName: string;
  fileSize: number;
}

export default function Base64ExcelConverter({ onTabChange }: Base64ExcelConverterProps) {
  const t = useTranslations('tools.base64-excel');
  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');
  const [base64Input, setBase64Input] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Output, setBase64Output] = useState('');
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [previewSheet, setPreviewSheet] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // 验证Excel文件类型
  const isValidExcelFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream' // 某些情况下的Excel文件
    ];
    
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
  };

  // Base64 转 Excel
  const decodeBase64ToExcel = useCallback(async () => {
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
      const binaryString = atob(base64Input.trim());
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 解析Excel
      const workbook = XLSX.read(bytes, { type: 'array' });
      const sheets = workbook.SheetNames.map(name => {
        const worksheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        return {
          name,
          data: data as any[][],
          rowCount: data.length,
          colCount: data.length > 0 ? Math.max(...data.map((row: any) => row.length)) : 0
        };
      });

      setExcelData({
        sheets,
        fileName: 'converted.xlsx',
        fileSize: bytes.length
      });
      
      setPreviewSheet(0);
      setShowPreview(true);
      toast.success(t('messages.success'));
    } catch (error: any) {
      const errorMessage = error.message || t('messages.errorUnknown');
      toast.error(t('messages.errorFail') + errorMessage);
      setExcelData(null);
      setShowPreview(false);
    } finally {
      setIsProcessing(false);
    }
  }, [base64Input, t]);

  // Excel 转 Base64
  const encodeExcelToBase64 = useCallback(async () => {
    if (!selectedFile) {
      toast.error(t('messages.errorFileType'));
      return;
    }

    if (!isValidExcelFile(selectedFile)) {
      toast.error(t('messages.errorFileType'));
      return;
    }

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // 转换为Base64
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      
      setBase64Output(base64);
      
      // 同时解析Excel用于预览
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheets = workbook.SheetNames.map(name => {
        const worksheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        return {
          name,
          data: data as any[][],
          rowCount: data.length,
          colCount: data.length > 0 ? Math.max(...data.map((row: any) => row.length)) : 0
        };
      });

      setExcelData({
        sheets,
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      });
      
      setPreviewSheet(0);
      setShowPreview(true);
      toast.success(t('messages.success'));
    } catch (error: any) {
      const errorMessage = error.message || t('messages.errorUnknown');
      toast.error(t('messages.errorFail') + errorMessage);
      setBase64Output('');
      setExcelData(null);
      setShowPreview(false);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, t]);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(t('messages.uploaded'));
    }
  };

  // 处理拖拽
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && isValidExcelFile(file)) {
      setSelectedFile(file);
      toast.success(t('messages.uploaded'));
    } else {
      toast.error(t('messages.errorFileType'));
    }
  };

  // 下载Excel文件
  const downloadExcel = () => {
    if (!excelData) return;
    
    try {
      const workbook = XLSX.utils.book_new();
      
      excelData.sheets.forEach(sheet => {
        const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      });
      
      XLSX.writeFile(workbook, excelData.fileName);
      toast.success(t('messages.downloaded'));
    } catch (error) {
      toast.error(t('messages.errorFail') + error);
    }
  };

  // 下载Base64文本
  const downloadBase64Text = () => {
    if (!base64Output) return;
    
    const blob = new Blob([base64Output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'excel_base64.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('messages.downloaded'));
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t('messages.copied'));
    }).catch(() => {
      toast.error(t('messages.copyFail'));
    });
  };

  // 清空所有内容
  const clearAll = () => {
    setBase64Input('');
    setSelectedFile(null);
    setBase64Output('');
    setExcelData(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success(t('messages.cleared'));
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 渲染Excel预览表格
  const renderPreviewTable = () => {
    if (!excelData || !excelData.sheets[previewSheet]) return null;
    
    const sheet = excelData.sheets[previewSheet];
    const maxRows = Math.min(sheet.data.length, 100); // 限制显示行数
    const maxCols = Math.min(sheet.colCount, 20); // 限制显示列数
    
    return (
      <div className="w-full overflow-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: maxCols }, (_, i) => (
                <TableHead key={i} className="min-w-24">
                  {String.fromCharCode(65 + i)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sheet.data.slice(0, maxRows).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: maxCols }, (_, colIndex) => (
                  <TableCell key={colIndex} className="text-sm">
                    {row[colIndex] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sheet.data.length > maxRows && (
          <div className="text-center text-sm text-gray-500 mt-2">
            {t('preview.tooManyRows')}
          </div>
        )}
        {sheet.colCount > maxCols && (
          <div className="text-center text-sm text-gray-500 mt-1">
            {t('preview.tooManyCols')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-8" onClick={handleComponentClick}>
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as 'decode' | 'encode');
        handleComponentClick();
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="decode" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {t('tabs.decode')}
          </TabsTrigger>
          <TabsTrigger value="encode" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t('tabs.encode')}
          </TabsTrigger>
        </TabsList>

        {/* Base64 转 Excel */}
        <TabsContent value="decode" className="mt-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
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
                    onClick={decodeBase64ToExcel}
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
                  {excelData && (
                    <>
                      <Button 
                        onClick={downloadExcel}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {t('actions.download')}
                      </Button>
                      <Button 
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {t('actions.preview')}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Excel 预览 */}
            {excelData && showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {t('labels.previewTitle')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {excelData.sheets.length} {t('textStats.sheets')}
                      </Badge>
                      <Badge variant="secondary">
                        {formatFileSize(excelData.fileSize)}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {excelData.sheets.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {excelData.sheets.map((sheet, index) => (
                        <Button
                          key={index}
                          variant={previewSheet === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPreviewSheet(index)}
                          className="flex-shrink-0"
                        >
                          {sheet.name}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {t('labels.rowCount')}: {excelData.sheets[previewSheet]?.rowCount || 0} | 
                    {t('labels.colCount')}: {excelData.sheets[previewSheet]?.colCount || 0}
                  </div>
                  
                  {renderPreviewTable()}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Excel 转 Base64 */}
        <TabsContent value="encode" className="mt-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Excel {t('labels.inputLabel')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {t('labels.dragDropText')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('labels.supportedFormats')}
                  </p>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 justify-center">
                        <File className="h-4 w-4" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(selectedFile.size)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={encodeExcelToBase64}
                    disabled={isProcessing || !selectedFile}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isProcessing ? t('labels.loading') : t('actions.encode')}
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
                        <Download className="mr-2 h-4 w-4" />
                        {t('actions.downloadBase64')}
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
                      <FileSpreadsheet className="h-5 w-5" />
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

            {/* Excel 预览 */}
            {excelData && showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {t('labels.previewTitle')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {excelData.sheets.length} {t('textStats.sheets')}
                      </Badge>
                      <Badge variant="secondary">
                        {formatFileSize(excelData.fileSize)}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {excelData.sheets.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {excelData.sheets.map((sheet, index) => (
                        <Button
                          key={index}
                          variant={previewSheet === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPreviewSheet(index)}
                          className="flex-shrink-0"
                        >
                          {sheet.name}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {t('labels.rowCount')}: {excelData.sheets[previewSheet]?.rowCount || 0} | 
                    {t('labels.colCount')}: {excelData.sheets[previewSheet]?.colCount || 0}
                  </div>
                  
                  {renderPreviewTable()}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 