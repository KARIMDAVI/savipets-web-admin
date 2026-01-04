/**
 * Theme Index
 */

export * from './light';
export * from './dark';

import { lightTheme } from './light';
import { darkTheme } from './dark';

export type Theme = typeof lightTheme | typeof darkTheme;

