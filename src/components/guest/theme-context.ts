'use client';

import { createContext, useContext } from 'react';
import type { Theme } from '@/lib/types';

export const ThemeContext = createContext<Theme | null>(null);
export const useTheme = () => useContext(ThemeContext);