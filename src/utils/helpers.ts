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
 * Generate HTML document string for iframe preview
 */
export function generatePreviewHTML(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Preview</title>
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
}

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
