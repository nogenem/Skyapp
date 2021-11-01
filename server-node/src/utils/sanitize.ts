const map: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

// https://stackoverflow.com/a/48226843
export default (string: string): string => {
  if (typeof string !== 'string') return '';
  return string.replace(/[&<>"'/]/gi, match => map[match]);
};
