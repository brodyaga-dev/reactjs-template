import { useEffect, useRef, useState } from 'react';
import { onTaskLoad, onTaskRender, onTaskReward, onTaskReject } from '@/scripts/traffy';

interface TraffyContainerProps {
  className?: string;
  minHeight?: string;
}

// Static flag to track if Traffy has been initialized
let isTraffyInitialized = false;

export function TraffyContainer({ className = '', minHeight = '300px' }: TraffyContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [initAttempts, setInitAttempts] = useState(0);
  const hasInitializedRef = useRef(false);

  // Function to initialize Traffy
  const initializeTraffy = () => {
    // Prevent double initialization
    if (isTraffyInitialized || hasInitializedRef.current) {
      console.log('Traffy already initialized, skipping');
      setStatus('success');
      return;
    }

    if (!containerRef.current) {
      setStatus('error');
      setErrorMessage('Container reference is not available');
      return;
    }

    if (!window || !(window as any).Traffy) {
      setStatus('error');
      setErrorMessage('Traffy script is not loaded. Check console for details.');
      console.error('Traffy is not available on window object:', window);
      return;
    }

    try {
      console.log('Initializing Traffy with container:', containerRef.current);
      setInitAttempts(prev => prev + 1);
      
      // Check if config is available
      if ((window as any).traffyConfig) {
        console.log('Using traffyConfig:', (window as any).traffyConfig);
      } else {
        console.warn('traffyConfig not found in window object');
      }
      
      // Initialize Traffy with the container
      (window as any).Traffy.renderTasks(
        containerRef.current,
        {
          max_tasks: 1,
          onTaskLoad: (tasks: any) => {
            console.log('onTaskLoad called with:', tasks);
            onTaskLoad(tasks);
          },
          onTaskRender: (changeReward: any, changeCardTitle: any, changeDescription: any, changeButtonCheckText: any) => {
            console.log('onTaskRender called with functions');
            onTaskRender(changeReward, changeCardTitle, changeDescription, changeButtonCheckText);
          },
          onTaskReward: (task: any, signedToken: any) => {
            console.log('onTaskReward called with:', task, signedToken);
            onTaskReward(task, signedToken);
          },
          onTaskReject: (task: any) => {
            console.log('onTaskReject called with:', task);
            onTaskReject(task);
          }
        }
      );
      
      // Mark as initialized both locally and globally
      hasInitializedRef.current = true;
      isTraffyInitialized = true;
      
      setStatus('success');
      console.log('Traffy initialized successfully');
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Error initializing Traffy: ${message}`);
      console.error('Error initializing Traffy:', error);
    }
  };

  useEffect(() => {
    // Check if Traffy is available
    const checkTraffy = () => {
      if (window && (window as any).Traffy && containerRef.current) {
        console.log('Traffy found, initializing automatically...');
        initializeTraffy();
        return true;
      } else {
        console.log('Traffy not available yet, will retry...', {
          windowExists: !!window,
          traffyExists: !!(window && (window as any).Traffy),
          containerExists: !!containerRef.current
        });
        return false;
      }
    };

    // Initial check
    const isInitialized = checkTraffy();

    // Set up interval to check periodically if not initialized
    let interval: number | undefined;
    if (!isInitialized) {
      interval = window.setInterval(() => {
        if (checkTraffy()) {
          clearInterval(interval);
        }
      }, 1000);
    }

    // Clean up interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div 
      id="traffy-container"
      ref={containerRef} 
      className={`traffy-container ${className}`}
      style={{ minHeight, border: '1px dashed #ccc', position: 'relative' }}
    >
      {status === 'loading' && (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-gray-500">Loading Traffy tasks...</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <button 
            onClick={initializeTraffy}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Initialization (Attempt #{initAttempts})
          </button>
          <p className="text-xs text-gray-500 mt-2">Check browser console for more details</p>
        </div>
      )}
      
      {/* The Traffy content will be rendered here by the script */}
    </div>
  );
}

// Add the traffyConfig property to the Window interface
declare global {
  interface Window {
    traffyConfig?: {
      key: string;
      [key: string]: any;
    };
  }
}
