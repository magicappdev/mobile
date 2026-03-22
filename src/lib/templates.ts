/**
 * Templates data for MagicAppDev mobile chat
 * Ported from web app templates.ts
 */

export type TemplateCategory =
	| 'all'
	| 'app'
	| 'landing'
	| 'component'
	| 'dashboard'

export interface Template {
	id: string
	name: string
	description: string
	category: Exclude<TemplateCategory, 'all'>
	prompt: string
	emoji: string
	free: boolean
	likes: number
}

export const TEMPLATE_CATEGORIES: Array<{id: TemplateCategory; label: string}> =
	[
		{id: 'all', label: 'All'},
		{id: 'app', label: 'Apps'},
		{id: 'landing', label: 'Landing'},
		{id: 'component', label: 'Components'},
		{id: 'dashboard', label: 'Dashboards'},
	]

export const QUICK_SUGGESTIONS = [
	{
		label: 'Contact Form',
		prompt:
			'Create a beautiful contact form with name, email, message fields, validation, and a success state',
	},
	{
		label: 'Mini Game',
		prompt:
			'Create a fun Snake game with smooth movement, score tracking, increasing difficulty, and a game over screen',
	},
	{
		label: 'Finance Calc',
		prompt:
			'Build a compound interest calculator with loan payment, savings goal, and investment projection tools',
	},
	{
		label: 'Weather App',
		prompt:
			'Create a weather dashboard with current conditions, 5-day forecast cards, and animated weather icons',
	},
	{
		label: 'Todo List',
		prompt:
			'Build a todo list with drag-to-reorder, categories, due dates, priority levels, and a progress ring',
	},
]

export const TEMPLATES: Template[] = [
	{
		id: 'landing-saas',
		name: 'SaaS Landing',
		description: 'Clean hero, features, pricing, and CTA sections.',
		category: 'landing',
		prompt:
			'Build a SaaS landing page with a bold hero section, feature grid, pricing table with 3 tiers, and a call-to-action footer',
		emoji: '🚀',
		free: true,
		likes: 2341,
	},
	{
		id: 'todo-app',
		name: 'Todo App',
		description: 'Task manager with categories and priorities.',
		category: 'app',
		prompt:
			'Build a todo list with drag-to-reorder, categories, due dates, priority levels, and a progress ring',
		emoji: '✅',
		free: true,
		likes: 1876,
	},
	{
		id: 'dashboard-analytics',
		name: 'Analytics Dashboard',
		description: 'Charts, KPIs, and data tables.',
		category: 'dashboard',
		prompt:
			'Create an analytics dashboard with line charts for revenue and users, KPI cards, a data table with sorting/filtering, and a date range picker',
		emoji: '📊',
		free: true,
		likes: 3102,
	},
	{
		id: 'snake-game',
		name: 'Snake Game',
		description: 'Classic snake with score and difficulty.',
		category: 'app',
		prompt:
			'Create a fun Snake game with smooth movement, score tracking, increasing difficulty, and a game over screen',
		emoji: '🐍',
		free: true,
		likes: 1543,
	},
	{
		id: 'portfolio',
		name: 'Portfolio',
		description: 'Personal site with projects and contact.',
		category: 'landing',
		prompt:
			'Design a personal portfolio with an animated hero, skills section, project cards with hover effects, and a contact form',
		emoji: '💼',
		free: true,
		likes: 2198,
	},
	{
		id: 'weather-app',
		name: 'Weather App',
		description: '5-day forecast with animated icons.',
		category: 'app',
		prompt:
			'Create a weather dashboard with current conditions, 5-day forecast cards, and animated weather icons',
		emoji: '⛅',
		free: true,
		likes: 987,
	},
	{
		id: 'calculator',
		name: 'Calculator',
		description: 'Scientific calculator with history.',
		category: 'component',
		prompt:
			'Build a scientific calculator with history, keyboard support, memory functions, and smooth button animations',
		emoji: '🧮',
		free: true,
		likes: 765,
	},
	{
		id: 'ecommerce',
		name: 'E-commerce',
		description: 'Product grid, cart, and checkout.',
		category: 'landing',
		prompt:
			'Create an e-commerce page with a product grid, quick-view modal, cart sidebar, and a multi-step checkout form',
		emoji: '🛒',
		free: false,
		likes: 4521,
	},
	{
		id: 'kanban',
		name: 'Kanban Board',
		description: 'Drag-and-drop project board.',
		category: 'dashboard',
		prompt:
			'Build a Kanban board with drag-and-drop columns, card creation, due dates, assignees, and a sprint progress bar',
		emoji: '📋',
		free: false,
		likes: 3876,
	},
	{
		id: 'timer',
		name: 'Pomodoro Timer',
		description: 'Focus timer with sessions and breaks.',
		category: 'component',
		prompt:
			'Create a Pomodoro timer with work/break sessions, audio notifications, session history, and a circular progress indicator',
		emoji: '⏱️',
		free: true,
		likes: 1234,
	},
	{
		id: 'markdown-editor',
		name: 'Markdown Editor',
		description: 'Live preview markdown editor.',
		category: 'component',
		prompt:
			'Build a markdown editor with live preview, toolbar for formatting, syntax highlighting, and export to HTML',
		emoji: '📝',
		free: true,
		likes: 892,
	},
	{
		id: 'finance-dash',
		name: 'Finance Dashboard',
		description: 'Budget, expenses, and savings.',
		category: 'dashboard',
		prompt:
			'Create a personal finance dashboard with monthly budget, expense categories, savings goals, and a spending trend chart',
		emoji: '💰',
		free: false,
		likes: 2654,
	},
]
