/**
 * Theme types and definitions for MagicAppDev Ionic app
 */

export interface Theme {
	mode: 'light' | 'dark'
	colors: {
		background: string
		card: string
		cardElevated: string
		cardMuted: string
		input: string
		text: string
		textSecondary: string
		border: string
		primary: string
		primarySoft: string
		success: string
		successSoft: string
		warning: string
		warningSoft: string
		error: string
		errorSoft: string
		tabBar: string
		tabBarActive: string
		tabBarText: string
		shadow: string
		heroStart: string
		heroEnd: string
	}
}

export const lightTheme: Theme = {
	mode: 'light',
	colors: {
		background: '#F4F7FB',
		card: '#FFFFFF',
		cardElevated: '#FCFDFF',
		cardMuted: '#EEF4FF',
		input: '#F8FAFC',
		text: '#111827',
		textSecondary: '#64748B',
		border: '#D8E1F0',
		primary: '#2563EB',
		primarySoft: 'rgba(37, 99, 235, 0.14)',
		success: '#16A34A',
		successSoft: 'rgba(22, 163, 74, 0.14)',
		warning: '#D97706',
		warningSoft: 'rgba(217, 119, 6, 0.14)',
		error: '#DC2626',
		errorSoft: 'rgba(220, 38, 38, 0.14)',
		tabBar: 'rgba(255, 255, 255, 0.92)',
		tabBarActive: '#2563EB',
		tabBarText: '#64748B',
		shadow: 'rgba(15, 23, 42, 0.18)',
		heroStart: '#EFF6FF',
		heroEnd: '#EEF2FF',
	},
}

export const darkTheme: Theme = {
	mode: 'dark',
	colors: {
		background: '#020617',
		card: '#0F172A',
		cardElevated: '#111827',
		cardMuted: '#111C31',
		input: '#0B1220',
		text: '#F8FAFC',
		textSecondary: '#94A3B8',
		border: 'rgba(148, 163, 184, 0.16)',
		primary: '#60A5FA',
		primarySoft: 'rgba(96, 165, 250, 0.2)',
		success: '#4ADE80',
		successSoft: 'rgba(74, 222, 128, 0.18)',
		warning: '#FBBF24',
		warningSoft: 'rgba(251, 191, 36, 0.18)',
		error: '#F87171',
		errorSoft: 'rgba(248, 113, 113, 0.18)',
		tabBar: 'rgba(15, 23, 42, 0.92)',
		tabBarActive: '#60A5FA',
		tabBarText: '#94A3B8',
		shadow: 'rgba(2, 6, 23, 0.48)',
		heroStart: '#0F172A',
		heroEnd: '#172554',
	},
}

export type ThemeMode = 'light' | 'dark' | 'automatic'
