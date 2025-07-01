/**
 * Base64工具类
 * 提供文本和图片的编码解码功能
 */

export interface Base64ConvertResult {
  success: boolean;
  data?: string;
  error?: string;
  size?: number;
}

export class Base64Utils {
  /**
   * 文本转Base64
   */
  static textToBase64(text: string): string {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      throw new Error('文本转换失败');
    }
  }

  /**
   * Base64转文本
   */
  static base64ToText(base64: string): string {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      throw new Error('Base64解码失败');
    }
  }

  /**
   * 文件转Base64
   */
  static fileToBase64(file: File): Promise<Base64ConvertResult> {
    return new Promise((resolve) => {
      if (!file) {
        resolve({ success: false, error: '请选择文件' });
        return;
      }

      // 检查文件大小 (限制10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        resolve({ success: false, error: '文件大小不能超过10MB' });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          resolve({ 
            success: true, 
            data: result,
            size: file.size
          });
        } catch (error) {
          resolve({ success: false, error: '文件读取失败' });
        }
      };

      reader.onerror = () => {
        resolve({ success: false, error: '文件读取失败' });
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Base64转图片Blob
   */
  static base64ToBlob(base64: string, mimeType: string = 'image/png'): Blob | null {
    try {
      // 移除data:image/...;base64,前缀
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      return null;
    }
  }

  /**
   * 下载Base64图片
   */
  static downloadBase64Image(base64: string, filename: string = 'image'): void {
    try {
      // 检测图片类型
      let mimeType = 'image/png';
      let extension = 'png';

      if (base64.includes('data:image/')) {
        const typeMatch = base64.match(/data:image\/([^;]+)/);
        if (typeMatch) {
          extension = typeMatch[1];
          mimeType = `image/${extension}`;
        }
      }

      const blob = this.base64ToBlob(base64, mimeType);
      if (!blob) {
        throw new Error('转换失败');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('下载失败');
    }
  }

  /**
   * 验证Base64格式
   */
  static isValidBase64(str: string): boolean {
    try {
      // 移除data URL前缀
      const base64Data = str.includes(',') ? str.split(',')[1] : str;
      return btoa(atob(base64Data)) === base64Data;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取Base64图片信息
   */
  static getImageInfo(base64: string): { size: number; type: string; width?: number; height?: number } | null {
    try {
      const blob = this.base64ToBlob(base64);
      if (!blob) return null;

      let type = 'unknown';
      if (base64.includes('data:image/')) {
        const typeMatch = base64.match(/data:image\/([^;]+)/);
        if (typeMatch) {
          type = typeMatch[1];
        }
      }

      return {
        size: blob.size,
        type
      };
    } catch (error) {
      return null;
    }
  }
} 