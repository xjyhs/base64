// lib/utils/workerManager.ts

interface WorkerTask {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  onProgress?: (progress: number) => void;
}

class WorkerManager {
  private worker: Worker | null = null;
  private tasks: Map<string, WorkerTask> = new Map();
  private isReady = false;

  constructor(workerPath: string) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      this.worker = new Worker(workerPath);
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);
      this.isReady = true;
    } catch (error) {
      console.error('WorkerManager: Failed to create worker:', error);
      this.worker = null;
    }
  }

  private handleMessage(event: MessageEvent) {
    const { id, type, payload } = event.data;
    
    if (!id || !this.tasks.has(id)) {
      return;
    }

    const task = this.tasks.get(id)!;

    if (type === 'progress') {
      task.onProgress?.(payload.progress);
    } else if (type === 'result') {
      if (payload.success) {
        task.resolve(payload);
      } else {
        task.reject(new Error(payload.error || 'Unknown worker error'));
      }
      this.tasks.delete(id);
    }
  }

  private handleError(error: ErrorEvent) {
    this.rejectAllTasks(new Error(`Worker error: ${error.message}`));
  }

  private rejectAllTasks(error: Error) {
    this.tasks.forEach((task) => {
      task.reject(error);
    });
    this.tasks.clear();
  }

  public async fileToBase64(file: File, onProgress?: (progress: number) => void): Promise<{data: string, sizeInfo: any}> {
    return this.postMessage('fileToBase64', { file }, onProgress);
  }

  public async base64ToBlob(base64: string, onProgress?: (progress: number) => void): Promise<{url: string, type: string, size: any}> {
    return this.postMessage('base64ToBlob', { base64 }, onProgress);
  }

  private postMessage(action: string, payload: any, onProgress?: (progress: number) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker || !this.isReady) {
        reject(new Error('Worker not available'));
        return;
      }

      const id = `${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      this.tasks.set(id, {
        resolve,
        reject,
        onProgress
      });

      this.worker.postMessage({ id, action, payload });

      // 超时处理
      setTimeout(() => {
        if (this.tasks.has(id)) {
          this.tasks.delete(id);
          reject(new Error('Worker operation timed out'));
        }
      }, 30000);
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
    this.tasks.clear();
  }
}

// 单例实例
let workerInstance: WorkerManager | null = null;

export function getWorkerManager(): WorkerManager {
  if (!workerInstance) {
    workerInstance = new WorkerManager('/workers/base64.worker.js');
  }
  return workerInstance;
}

export const base64Worker = typeof window !== 'undefined' ? getWorkerManager() : null; 