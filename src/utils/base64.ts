/**
 * Base64工具类
 * 提供文本和图片的编码解码功能
 */

export interface Base64ConvertResult {
  success: boolean;
  data?: string;
  size?: number;
  error?: string;
}

export interface ImageInfo {
  size: number;
  type: string;
  width?: number;
  height?: number;
}

export class Base64Utils {
  // 文件大小限制 (10MB)
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  
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
  static async fileToBase64(file: File): Promise<Base64ConvertResult> {
    try {
      // 检查文件大小
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: `文件大小超过限制 (${this.formatFileSize(this.MAX_FILE_SIZE)})`
        };
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
      });

      return {
        success: true,
        data: base64,
        size: file.size
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '转换失败'
      };
    }
  }

  /**
   * Base64转Blob
   */
  static base64ToBlob(base64: string, mimeType?: string): Blob {
    const byteCharacters = atob(base64.split(',')[1] || base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType || 'image/png' });
  }

  /**
   * 下载Base64图片
   */
  static downloadBase64Image(base64: string, filename: string = 'image'): void {
    try {
      // 提取MIME类型
      const mimeMatch = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*$/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      
      // 获取文件扩展名
      const extension = mimeType.split('/')[1] || 'png';
      
      const blob = this.base64ToBlob(base64, mimeType);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
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
      
      // 基本格式检查
      if (!base64Data || base64Data.length === 0) {
        return false;
      }
      
      // Base64字符集检查
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(base64Data)) {
        return false;
      }
      
      // 长度检查 (Base64长度必须是4的倍数)
      if (base64Data.length % 4 !== 0) {
        return false;
      }
      
      // 尝试解码
      atob(base64Data);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取图片信息
   */
  static getImageInfo(base64: string): ImageInfo | null {
    try {
      // 提取MIME类型
      const mimeMatch = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*$/);
      if (!mimeMatch) return null;
      
      const mimeType = mimeMatch[1];
      const type = mimeType.split('/')[1] || 'unknown';
      
      // 计算Base64数据大小
      const base64Data = base64.split(',')[1] || base64;
      const size = Math.round((base64Data.length * 3) / 4);
      
      return {
        size,
        type: type.toUpperCase(),
        width: undefined, // 需要创建Image对象才能获取尺寸
        height: undefined
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取图片尺寸 (异步)
   */
  static getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => {
        reject(new Error('无法加载图片'));
      };
      img.src = base64;
    });
  }

  /**
   * 压缩Base64图片
   */
  static compressImage(
    base64: string, 
    maxWidth: number = 1920, 
    maxHeight: number = 1080, 
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'));
          return;
        }
        
        // 计算新尺寸
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制并压缩
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        resolve(compressedBase64);
      };
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      img.src = base64;
    });
  }
} 