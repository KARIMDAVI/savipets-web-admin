/**
 * Variable Replacer
 * 
 * Utility for replacing variables in workflow templates.
 */

/**
 * Replace variables in string with trigger data
 */
export function replaceVariables(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}


