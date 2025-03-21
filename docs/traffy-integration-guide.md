# Руководство по интеграции Traffy в React.js приложение

Это пошаговое руководство поможет вам интегрировать рекламную платформу Traffy в ваше React.js приложение.

## Шаг 1. Подготовка

### 1.1. Получите скрипт рекламной площадки

Если вы создатель Селлера (рекламной площадки), отправьте скрипт своему разработчику из приложения Traffy. Вы можете скопировать скрипт из карточки рекламной площадки.

Пример того, как выглядит скрипт:

```html
<script src="https://dvq1zz1g273yl.cloudfront.net/index_v1.1.0.min.js" traffy-key="Your Traffy Key" test="true"></script>
```

### 1.2. Разместите скрипт внутри head вашего приложения

Скрипт должен находиться после скрипта Telegram и до скрипта вашего MiniApp.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="#000000"/>
    <title>Telegram Mini App</title>
    
    <!-- Load Telegram Web App script -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
        
    <!-- Load Traffy script -->
    <script id="traffy-script" src="https://dvq1zz1g273yl.cloudfront.net/index_v1.1.0.min.js"
    traffy-key="9de22917bbd9750775c9483e111ad97be50bb9c7509fbb4e8c0772a4bc6a49fdy" test="true"
    ></script>

  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="/src/index.tsx" type="module"></script>
  </body>
</html>
```

### 1.3. Создайте контейнер и вызовите рендер (Traffy.renderTasks).

Создайте компонент для отображения Traffy заданий. Вы можете использовать React ref для доступа к DOM-элементу.

```tsx
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

```

## Шаг 2. Скрипт для функций

### 2.1. Опишите необходимые функции

Создайте файл с типами и функциями для работы с Traffy.

```tsx
// src/scripts/traffy.ts
export type Task = {
  company_id: number;
  title: string;
  link: string;
  photo_url: string;
};

// Происходит когда задания загрузились
export function onTaskLoad(tasks: Task[]) {
  console.log(tasks, "loaded");
}

// Происходит, когда пользователь не прошел проверку выполнения задания
export function onTaskReject(task: Task) {
  // alert(task)
}

// Происходит, когда пользователь прошел проверку выполнения задания
export function onTaskReward(task: Task, signedToken: string) {
  // Отправьте здесь запрос на ваш бэкенд для верификации выполнения задания
  // и начисления награды
  const url = new URL('Your Endpoint');
  url.searchParams.set("auth", "Your Auth");
  fetch(url.toString(), {
    method: "POST",
    body: JSON.stringify({
      task_id: task.company_id,
      hash: signedToken
    })
  }).then((res: Response) => {
    if(res.status === 200) {
      // setBalance(state.traffy_reward, "add")
    }
  }).catch(() => {
    // Обработка ошибок
  });
}

// Настройка внешнего вида Traffy-виджета
export function onTaskRender(
  // функция меняет текст кнопки (справа)
  changeReward: (str: string) => void, 
  // функция меняет название (дефолтное: "Subscribe on:")
  changeCardTitle: (str: string) => void,
  // функция меняет описание
  changeDescription: (str: string) => void, 
  // функция меняет текст кнопки в состоянии "проверка" (дефолтное: "Check")
  changeButtonCheckText: (str: string) => void, 
) {
  const reward = formatReward(12345); 
  changeReward(reward);
  
  // Пример кастомизации:
  // changeCardTitle("Подпишись на:");
  // changeDescription("Выполни задание и получи награду!");
  // changeButtonCheckText("Проверить");
}

function formatReward(amount: number): string {
  return `${amount} TON`;
}
```

### 2.2. Использование компонента

Теперь вы можете использовать TraffyContainer в любом месте вашего приложения:

```tsx
// src/pages/IndexPage/IndexPage.tsx или любой другой компонент
import type { FC } from 'react';
import { Page } from '@/components/Page.tsx';
import { TraffyContainer } from '@/components/TraffyScript/TraffyContainer';

export const IndexPage: FC = () => {
  return (
    <Page back={false}>
      {/* Add the TraffyContainer at the top of the page */}
      <div style={{ margin: '20px 0' }}>
        <h2 className="text-xl font-bold mb-4">Traffy Tasks</h2>
        <TraffyContainer minHeight="100px" />
      </div>
    </Page>
  );
};

```

## Шаг 3. Верификация и награды

Когда пользователь выполняет задание, Traffy вызывает функцию `onTaskReward` с параметрами `task` и `signedToken`. Ваш бэкенд должен проверить этот токен с помощью Traffy API.

### 3.1. Серверная верификация

```tsx
// Пример серверного кода для верификации
import { verifyTraffyToken } from 'your-api-client';

async function verifyTaskCompletion(taskId: number, signedToken: string) {
  try {
    // Проверка токена через Traffy API
    const isValid = await verifyTraffyToken(taskId, signedToken);
    
    if (isValid) {
      // Начисление награды пользователю
      await updateUserBalance(userId, rewardAmount);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid token' };
    }
  } catch (error) {
    console.error('Error verifying task:', error);
    return { success: false, error: 'Verification failed' };
  }
}
```

## Шаг 4. Стилизация и тестирование

### 4.1. Кастомизация внешнего вида

Вы можете настроить внешний вид Traffy через функцию `onTaskRender`:

```tsx
export function onTaskRender(
  changeReward,
  changeCardTitle,
  changeDescription,
  changeButtonCheckText
) {
  // Изменение награды
  changeReward('100 TON');
  
  // Изменение заголовка карточки
  changeCardTitle('Заработай тон за подписку:');
  
  // Изменение описания
  changeDescription('Подпишись на канал и получи награду после проверки!');
  
  // Изменение текста кнопки проверки
  changeButtonCheckText('Проверить подписку');
}
```

### 4.2. Тестирование

Для тестирования установите атрибут `test="true"` в скрипте Traffy:

```html
<script 
  src="https://dvq1zz1g273yl.cloudfront.net/index_v1.1.0.min.js" 
  traffy-key="Your Traffy Key" 
  test="true"
></script>
```

В React.js:

```tsx
<script
  src="https://dvq1zz1g273yl.cloudfront.net/index_v1.1.0.min.js"
  traffy-key="Your Traffy Key"
  test="true"
/>
```

Режим тестирования позволяет проверить работу Traffy без реального списания средств.

## Шаг 5. Деплой и боевой режим

Когда вы готовы к запуску в боевом режиме:

1. Удалите атрибут `test="true"` из скрипта Traffy
2. Убедитесь, что верификация задания на бэкенде работает корректно
3. Проверьте начисление наград пользователям

## Заключение

Поздравляем! Теперь вы интегрировали Traffy в ваше React.js приложение. Пользователи могут выполнять задания и получать награды, а вы можете монетизировать свое приложение через рекламную площадку Traffy.

Для получения дополнительной информации обратитесь к официальной документации Traffy или свяжитесь с их службой поддержки. 