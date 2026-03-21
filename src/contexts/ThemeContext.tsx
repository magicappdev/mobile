/**
 * Theme Context Provider for Ionic
 *
 * Provides theme management for the app including:
 * - Light/Dark/Automatic theme modes
 * - System theme detection
 * - Ionic theme integration via CSS variables
 */

/* eslint-disable react-refresh/only-export-components */
import React, {useEffect, useMemo, useState} from 'react'
import {darkTheme, lightTheme} from '../constants/theme'
import type {Theme, ThemeMode} from '../constants/theme'
import {storage} from '../lib/storage'

interface ThemeContextType {
	theme: Theme
	mode: ThemeMode
	setMode: (mode: ThemeMode) => Promise<void>
	isDark: boolean
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
	undefined,
)

const THEME_STORAGE_KEY = 'magicappdev_theme_mode'

export function ThemeProvider({
	children,
}: {
	children: React.ReactNode
}): React.ReactElement {
	const [mode, setModeState] = useState<ThemeMode>('automatic')

	// Detect system color scheme
	const systemColorScheme = useMemo(() => {
		if (
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
		) {
			return 'dark'
		}
		return 'light'
	}, [])

	const setMode = async (newMode: ThemeMode) => {
		setModeState(newMode)
		try {
			await storage.setItem(THEME_STORAGE_KEY, newMode)
		} catch (e) {
			console.error('Failed to save theme preference', e)
		}
	}

	// Load saved theme preference on mount
	useEffect(() => {
		const loadTheme = async () => {
			try {
				const savedMode = await storage.getItem(THEME_STORAGE_KEY)
				if (savedMode && ['light', 'dark', 'automatic'].includes(savedMode)) {
					setModeState(savedMode as ThemeMode)
				}
			} catch (e) {
				console.error('Failed to load theme preference', e)
			}
		}
		loadTheme()
	}, [])

	// Determine actual theme based on mode and system preference
	const isDark =
		mode === 'dark' || (mode === 'automatic' && systemColorScheme === 'dark')
	const theme = isDark ? darkTheme : lightTheme

	// Apply theme to document root for Ionic CSS variables
	useEffect(() => {
		const root = document.documentElement
		if (isDark) {
			root.setAttribute('color-scheme', 'dark')
			root.classList.add('dark')
		} else {
			root.setAttribute('color-scheme', 'light')
			root.classList.remove('dark')
		}

		// Set CSS variables for theme colors
		root.style.setProperty('--ion-background-color', theme.colors.background)
		root.style.setProperty('--ion-card-background', theme.colors.card)
		root.style.setProperty('--ion-text-color', theme.colors.text)
		root.style.setProperty('--ion-toolbar-background', theme.colors.background)
		root.style.setProperty('--ion-toolbar-color', theme.colors.text)
		root.style.setProperty('--ion-item-background', theme.colors.cardElevated)
		root.style.setProperty('--ion-border-color', theme.colors.border)
		root.style.setProperty('--ion-color-primary', theme.colors.primary)
		root.style.setProperty('--ion-color-success', theme.colors.success)
		root.style.setProperty('--ion-color-warning', theme.colors.warning)
		root.style.setProperty('--ion-color-danger', theme.colors.error)
		root.style.setProperty('--ion-tab-bar-background', theme.colors.tabBar)
		root.style.setProperty(
			'--ion-tab-bar-color-selected',
			theme.colors.tabBarActive,
		)
		root.style.setProperty('--ion-tab-bar-color', theme.colors.tabBarText)
		root.style.setProperty('--app-surface-color', theme.colors.card)
		root.style.setProperty(
			'--app-surface-elevated-color',
			theme.colors.cardElevated,
		)
		root.style.setProperty('--app-card-muted-color', theme.colors.cardMuted)
		root.style.setProperty('--app-input-background', theme.colors.input)
		root.style.setProperty(
			'--app-text-secondary-color',
			theme.colors.textSecondary,
		)
		root.style.setProperty('--app-border-color', theme.colors.border)
		root.style.setProperty('--app-primary-soft', theme.colors.primarySoft)
		root.style.setProperty('--app-success-soft', theme.colors.successSoft)
		root.style.setProperty('--app-warning-soft', theme.colors.warningSoft)
		root.style.setProperty('--app-error-soft', theme.colors.errorSoft)
		root.style.setProperty('--app-tab-bar-color', theme.colors.tabBar)
		root.style.setProperty('--app-tab-bar-active', theme.colors.tabBarActive)
		root.style.setProperty('--app-tab-bar-text-color', theme.colors.tabBarText)
		root.style.setProperty('--app-shadow-color', theme.colors.shadow)
		root.style.setProperty('--app-hero-start', theme.colors.heroStart)
		root.style.setProperty('--app-hero-end', theme.colors.heroEnd)
		document.body.style.backgroundColor = theme.colors.background
		document.body.style.color = theme.colors.text
	}, [isDark, theme])

	return (
		<ThemeContext.Provider value={{theme, mode, setMode, isDark}}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme(): ThemeContextType {
	const context = React.useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within ThemeProvider')
	}
	return context
}
