// Web Worker管理器
// 处理与Base64转换Worker的通信

interface WorkerTask {
  id: string;
  type: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  onProgress?: (progress: number, message: string) => void;
}

interface WorkerResult {
  success: boolean;
  url?: string;
  blob?: Blob;
  data?: string;
  size?: {
    size: number;
    unit: string;
    bytes: number;
  };
  sizeInfo?: {
    size: number;
    unit: string;
    bytes: number;
  };
  type?: string;
  error?: string;
  isValid?: boolean;
  message?: string;
}

export class WorkerManager {
  private worker: Worker | null = null;
  private tasks: Map<string, WorkerTask> = new Map();
  private isReady = false;
  private initPromise: Promise<void> | null = null;
  private isClient = false;

  constructor() {
    // 只在客户端环境初始化
    this.isClient = typeof window !== 'undefined' && typeof Worker !== 'undefined';
    if (this.isClient) {
      this.initWorker();
    }
  }

  private async initWorker(): Promise<void> {
    if (!this.isClient) {
      throw new Error('Worker is not available in this environment');
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // 创建Worker - 使用相对路径
        this.worker = new Worker('./base64-worker.js');
        
        // 监听Worker消息
        this.worker.onmessage = (e) => {
          const { type, id, result, error, progress, message } = e.data;
          
          switch (type) {
            case 'ready':
              this.isReady = true;
              resolve();
              break;
              
            case 'result':
              this.handleResult(id, result);
              break;
              
            case 'error':
              this.handleError(id, error);
              break;
              
            case 'progress':
              this.handleProgress(id, progress, message);
              break;
              
            default:
              console.warn('Unknown worker message type:', type);
          }
        };
        
        // 处理Worker错误
        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
          reject(new Error('Worker initialization failed'));
        };
        
      } catch (error) {
        reject(error);
      }
    });

    return this.initPromise;
  }

  private handleResult(id: string, result: WorkerResult): void {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.delete(id);
      task.resolve(result);
    }
  }

  private handleError(id: string, error: string): void {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.delete(id);
      task.reject(new Error(error));
    }
  }

  private handleProgress(id: string, progress: number, message: string): void {
    const task = this.tasks.get(id);
    if (task && task.onProgress) {
      task.onProgress(progress, message);
    }
  }

  private generateTaskId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async ensureWorkerReady(): Promise<void> {
    if (!this.isClient) {
      throw new Error('Worker is not available in this environment');
    }
    
    if (!this.isReady) {
      await this.initWorker();
    }
  }

  /**
   * 将Base64字符串转换为图片Blob
   */
  async base64ToBlob(
    base64: string, 
    onProgress?: (progress: number, message: string) => void
  ): Promise<WorkerResult> {
    if (!this.isClient) {
      // 在服务端或不支持Worker的环境中，返回错误
      return {
        success: false,
        error: 'Worker not available in this environment'
      };
    }

    await this.ensureWorkerReady();
    
    return new Promise((resolve, reject) => {
      const id = this.generateTaskId();
      
      this.tasks.set(id, {
        id,
        type: 'base64ToBlob',
        resolve,
        reject,
        onProgress
      });
      
      this.worker!.postMessage({
        type: 'base64ToBlob',
        id,
        data: { base64 }
      });
    });
  }

  /**
   * 将文件转换为Base64字符串
   */
  async fileToBase64(
    file: File, 
    onProgress?: (progress: number, message: string) => void
  ): Promise<WorkerResult> {
    if (!this.isClient) {
      // 在服务端或不支持Worker的环境中，返回错误
      return {
        success: false,
        error: 'Worker not available in this environment'
      };
    }

    await this.ensureWorkerReady();
    
    return new Promise((resolve, reject) => {
      const id = this.generateTaskId();
      
      this.tasks.set(id, {
        id,
        type: 'fileToBase64',
        resolve,
        reject,
        onProgress
      });
      
      this.worker!.postMessage({
        type: 'fileToBase64',
        id,
        data: { file }
      });
    });
  }

  /**
   * 验证Base64图片格式
   */
  async validateBase64Image(base64: string): Promise<WorkerResult> {
    if (!this.isClient) {
      // 在服务端或不支持Worker的环境中，返回错误
      return {
        success: false,
        error: 'Worker not available in this environment'
      };
    }

    await this.ensureWorkerReady();
    
    return new Promise((resolve, reject) => {
      const id = this.generateTaskId();
      
      this.tasks.set(id, {
        id,
        type: 'validateBase64',
        resolve,
        reject
      });
      
      this.worker!.postMessage({
        type: 'validateBase64',
        id,
        data: { base64 }
      });
    });
  }

  /**
   * 销毁Worker
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.tasks.clear();
    this.isReady = false;
    this.initPromise = null;
  }
}

// 创建单例实例
export const workerManager = new WorkerManager(); 