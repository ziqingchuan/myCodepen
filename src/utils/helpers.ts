/**
 * Debounce utility function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

/**
 * Generate HTML document string for iframe preview (React component only)
 */
export function generatePreviewHTML(code: string): string {
  // 检查是否包含 style 标签，如果有，提取并单独处理
  let cssContent = '';
  let reactCode = code;
  
  const styleMatch = code.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    cssContent = styleMatch[1];
    reactCode = code.replace(/<style>[\s\S]*?<\/style>/, '');
  }
  
  // 添加脚本以限制动画执行时间
  const animationControlScript = `
    // 3秒后停止所有动画
    setTimeout(() => {
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.animation) {
          el.style.animation = 'none';
        }
        if (style.animationName) {
          el.style.animationName = 'none';
        }
        if (style.transition) {
          el.style.transition = 'none';
        }
      });
    }, 3000);
  `;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    ${reactCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));

    // 优先使用 App 或 Component
    if (typeof App !== 'undefined') {
      root.render(<App />);
    } else if (typeof Component !== 'undefined') {
      root.render(<Component />);
    } else {
      root.render(
        <div style={{ padding: 20, color: '#ef4444', fontFamily: 'system-ui' }}>
          请确保导出名为 App 或 Component 的组件
        </div>
      );
    }
  </script>
  <script>
    ${animationControlScript}
  </script>
</body>
</html>`;
}

// 原有的 generatePreviewHTML 函数（已废弃，仅支持 HTML）
// export function generatePreviewHTML(code: string): string {
//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Code Preview</title>
//   <style>
//     body {
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       min-height: 100vh;
//       margin: 0;
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
//     }
//   </style>
// </head>
// <body>
//   ${code}
// </body>
// </html>`;
// }

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate preview screenshot (using html2canvas)
 */
export async function generatePreviewScreenshot(_iframeElement: HTMLIFrameElement): Promise<string | null> {
  try {
    // This would require html2canvas library
    // For now, we'll return null and handle this in the component
    return null;
  } catch (error) {
    console.error('Failed to generate screenshot:', error);
    return null;
  }
}

/**
 * Format date to YYYY-MM-DD format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate case title
 */
export function validateTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: '标题不能为空' };
  }
  if (title.length < 2) {
    return { valid: false, error: '标题至少需要2个字符' };
  }
  if (title.length > 50) {
    return { valid: false, error: '标题不能超过50个字符' };
  }
  return { valid: true };
}

/**
 * Validate code
 */
export function validateCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: '代码不能为空' };
  }
  return { valid: true };
}
