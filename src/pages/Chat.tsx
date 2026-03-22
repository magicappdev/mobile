/**
 * Chat Screen – MagicAgent WebSocket chat
 *
 * Full feature parity with the web chat page:
 * – WebSocket connection to Cloudflare agent
 * – Landing state: hero, connection status, quick suggestions, template gallery
 * – Active state: message bubbles, streaming indicator, suggested prompts
 * – Generated project card: file list, inline code view, preview modal, save to project
 * – Export (share) and deploy (Cloudflare CLI instructions) action sheets
 * – Clear history
 */

import {
	IonActionSheet,
	IonAlert,
	IonButton,
	IonButtons,
	IonChip,
	IonContent,
	IonFooter,
	IonHeader,
	IonIcon,
	IonLabel,
	IonModal,
	IonPage,
	IonSpinner,
	IonTextarea,
	IonTitle,
	IonToolbar,
} from '@ionic/react'
import {
	checkmark,
	chevronDown,
	chevronForward,
	close,
	cloudUpload,
	code,
	eye,
	folderOpen,
	logoGithub,
	send,
	sparkles,
	star,
	trash,
} from 'ionicons/icons'
import {
	QUICK_SUGGESTIONS,
	TEMPLATES,
	TEMPLATE_CATEGORIES,
	type Template,
	type TemplateCategory,
} from '../lib/templates'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {api, AGENT_HOST} from '../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
	id: string
	role: 'user' | 'assistant' | 'system'
	content: string
	timestamp: number
}

interface GeneratedFile {
	path: string
	content: string
}

interface AgentGeneratedProject {
	projectName: string
	templateSlug: string
	files: GeneratedFile[]
	dependencies: Record<string, string>
	devDependencies: Record<string, string>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WS_URL = `wss://${AGENT_HOST}/agents/magic-agent/default`

function randomId() {
	return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── TemplateGallery ──────────────────────────────────────────────────────────

function TemplateGallery({onSelect}: {onSelect: (t: Template) => void}) {
	const [activeTab, setActiveTab] = useState<TemplateCategory>('all')
	const filtered =
		activeTab === 'all'
			? TEMPLATES
			: TEMPLATES.filter(t => t.category === activeTab)

	return (
		<div style={{marginTop: 16}}>
			{/* Category tabs */}
			<div
				style={{display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8}}
			>
				{TEMPLATE_CATEGORIES.map(cat => (
					<button
						key={cat.id}
						onClick={() => setActiveTab(cat.id)}
						style={{
							padding: '6px 14px',
							borderRadius: 20,
							border: 'none',
							fontSize: 13,
							fontWeight: 500,
							whiteSpace: 'nowrap',
							cursor: 'pointer',
							background:
								activeTab === cat.id
									? 'var(--ion-color-primary)'
									: 'var(--ion-color-step-100)',
							color: activeTab === cat.id ? '#fff' : 'var(--ion-color-medium)',
						}}
					>
						{cat.label}
					</button>
				))}
			</div>
			{/* Template grid */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 1fr)',
					gap: 10,
					marginTop: 12,
				}}
			>
				{filtered.map(template => (
					<button
						key={template.id}
						onClick={() => onSelect(template)}
						style={{
							textAlign: 'left',
							borderRadius: 14,
							overflow: 'hidden',
							border: '1px solid var(--ion-color-step-150)',
							cursor: 'pointer',
							background: 'var(--ion-color-step-50)',
							padding: 0,
						}}
					>
						<div
							style={{
								height: 60,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: 28,
								background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
							}}
						>
							{template.emoji}
						</div>
						<div style={{padding: '8px 10px'}}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'flex-start',
								}}
							>
								<span
									style={{
										fontSize: 12,
										fontWeight: 600,
										color: 'var(--ion-text-color)',
									}}
								>
									{template.name}
								</span>
								{!template.free && (
									<span
										style={{
											fontSize: 9,
											fontWeight: 700,
											padding: '2px 5px',
											borderRadius: 8,
											background: 'rgba(234,179,8,0.1)',
											color: '#ca8a04',
											border: '1px solid rgba(234,179,8,0.2)',
											marginLeft: 4,
										}}
									>
										PRO
									</span>
								)}
							</div>
							<p
								style={{
									fontSize: 10,
									color: 'var(--ion-color-medium)',
									margin: '3px 0 5px',
									lineHeight: 1.3,
								}}
							>
								{template.description}
							</p>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 4,
									fontSize: 10,
									color: 'var(--ion-color-step-400)',
								}}
							>
								<IonIcon icon={star} style={{fontSize: 10}} />
								<span>{template.likes.toLocaleString()}</span>
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	)
}

// ─── GeneratedProjectCard ─────────────────────────────────────────────────────

function GeneratedProjectCard({
	project,
	onSaveToProject,
	onExport,
	onDeploy,
}: {
	project: AgentGeneratedProject
	onSaveToProject: () => void
	onExport: () => void
	onDeploy: () => void
}) {
	const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
	const [showPreview, setShowPreview] = useState(false)

	const toggleFile = (path: string) => {
		setExpandedFiles(prev => {
			const next = new Set(prev)
			if (next.has(path)) next.delete(path)
			else next.add(path)
			return next
		})
	}

	// Build preview HTML: prefer index.html, fallback to first .html file
	const previewFile =
		project.files.find(f => f.path === 'index.html') ||
		project.files.find(f => f.path.endsWith('.html'))

	const depCount = Object.keys(project.dependencies).length

	return (
		<div
			style={{
				border: '1px solid var(--ion-color-step-200)',
				borderRadius: 16,
				overflow: 'hidden',
				background: 'var(--ion-color-step-50)',
				marginTop: 8,
			}}
		>
			{/* Header */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '12px 14px',
					borderBottom: '1px solid var(--ion-color-step-150)',
					background: 'var(--ion-color-step-100)',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
					<IonIcon
						icon={folderOpen}
						style={{color: 'var(--ion-color-warning)', fontSize: 16}}
					/>
					<span style={{fontWeight: 600, fontSize: 13}}>
						{project.projectName}
					</span>
					<span style={{fontSize: 11, color: 'var(--ion-color-medium)'}}>
						{project.files.length} files
					</span>
				</div>
			</div>

			{/* Action buttons */}
			<div
				style={{
					display: 'flex',
					gap: 8,
					padding: '10px 14px',
					flexWrap: 'wrap',
				}}
			>
				{previewFile && (
					<button
						onClick={() => setShowPreview(true)}
						style={actionBtnStyle('primary')}
					>
						<IonIcon icon={eye} style={{fontSize: 13, marginRight: 4}} />
						Preview
					</button>
				)}
				<button onClick={onSaveToProject} style={actionBtnStyle('secondary')}>
					<IonIcon icon={checkmark} style={{fontSize: 13, marginRight: 4}} />
					Save
				</button>
				<button onClick={onExport} style={actionBtnStyle('secondary')}>
					<IonIcon icon={logoGithub} style={{fontSize: 13, marginRight: 4}} />
					GitHub
				</button>
				<button onClick={onDeploy} style={actionBtnStyle('primary')}>
					<IonIcon icon={cloudUpload} style={{fontSize: 13, marginRight: 4}} />
					Deploy
				</button>
			</div>

			{/* File list */}
			<div style={{borderTop: '1px solid var(--ion-color-step-150)'}}>
				{project.files.map(file => (
					<div
						key={file.path}
						style={{borderBottom: '1px solid var(--ion-color-step-100)'}}
					>
						<button
							onClick={() => toggleFile(file.path)}
							style={{
								display: 'flex',
								alignItems: 'center',
								width: '100%',
								gap: 8,
								padding: '9px 14px',
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								textAlign: 'left',
							}}
						>
							<IonIcon
								icon={
									expandedFiles.has(file.path) ? chevronDown : chevronForward
								}
								style={{
									fontSize: 12,
									color: 'var(--ion-color-medium)',
									flexShrink: 0,
								}}
							/>
							<IonIcon
								icon={code}
								style={{
									fontSize: 12,
									color: 'var(--ion-color-warning)',
									flexShrink: 0,
								}}
							/>
							<span
								style={{
									fontFamily: 'monospace',
									fontSize: 11,
									color: 'var(--ion-color-light)',
								}}
							>
								{file.path}
							</span>
						</button>
						{expandedFiles.has(file.path) && (
							<pre
								style={{
									margin: 0,
									padding: '8px 14px 12px',
									background: 'rgba(0,0,0,0.3)',
									overflowX: 'auto',
									fontSize: 10,
									color: '#4ade80',
									lineHeight: 1.5,
									maxHeight: 200,
									overflow: 'auto',
								}}
							>
								<code>{file.content}</code>
							</pre>
						)}
					</div>
				))}
			</div>

			{/* Dependencies */}
			{depCount > 0 && (
				<div
					style={{
						padding: '10px 14px',
						borderTop: '1px solid var(--ion-color-step-150)',
					}}
				>
					<div
						style={{
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: 1,
							color: 'var(--ion-color-medium)',
							marginBottom: 6,
							textTransform: 'uppercase',
						}}
					>
						Dependencies
					</div>
					<div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
						{Object.entries(project.dependencies).map(([name, version]) => (
							<span
								key={name}
								style={{
									fontFamily: 'monospace',
									fontSize: 10,
									padding: '2px 8px',
									borderRadius: 6,
									background: 'var(--ion-color-step-150)',
									color: 'var(--ion-color-light)',
								}}
							>
								{name}@{version}
							</span>
						))}
					</div>
				</div>
			)}

			{/* Preview modal */}
			{showPreview && previewFile && (
				<IonModal isOpen onDidDismiss={() => setShowPreview(false)}>
					<IonHeader>
						<IonToolbar>
							<IonTitle style={{fontSize: 15}}>
								{project.projectName} – Preview
							</IonTitle>
							<IonButtons slot="end">
								<IonButton onClick={() => setShowPreview(false)}>
									<IonIcon slot="icon-only" icon={close} />
								</IonButton>
							</IonButtons>
						</IonToolbar>
					</IonHeader>
					<IonContent>
						<iframe
							srcDoc={previewFile.content}
							style={{width: '100%', height: '100%', border: 'none'}}
							sandbox="allow-scripts"
							title="Project preview"
						/>
					</IonContent>
				</IonModal>
			)}
		</div>
	)
}

function actionBtnStyle(variant: 'primary' | 'secondary'): React.CSSProperties {
	return {
		display: 'inline-flex',
		alignItems: 'center',
		padding: '6px 12px',
		borderRadius: 10,
		border: 'none',
		fontSize: 12,
		fontWeight: 600,
		cursor: 'pointer',
		background:
			variant === 'primary'
				? 'var(--ion-color-primary)'
				: 'var(--ion-color-step-200)',
		color: variant === 'primary' ? '#fff' : 'var(--ion-color-light)',
	}
}

// ─── Main Chat Component ──────────────────────────────────────────────────────

export default function Chat() {
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isConnected, setIsConnected] = useState(false)
	const [generatedProject, setGeneratedProject] =
		useState<AgentGeneratedProject | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)
	const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])
	const [showExportSheet, setShowExportSheet] = useState(false)
	const [showDeploySheet, setShowDeploySheet] = useState(false)
	const [showClearAlert, setShowClearAlert] = useState(false)
	const [showGithubCliAlert, setShowGithubCliAlert] = useState(false)
	const [showWranglerCliAlert, setShowWranglerCliAlert] = useState(false)
	const [githubCliName, setGithubCliName] = useState('')
	const [wranglerCliName, setWranglerCliName] = useState('')
	const [saveStatus, setSaveStatus] = useState<
		'idle' | 'saving' | 'saved' | 'error'
	>('idle')

	const wsRef = useRef<WebSocket | null>(null)
	const pendingFilesRef = useRef<GeneratedFile[]>([])
	const contentRef = useRef<HTMLIonContentElement>(null)
	const location = useLocation()
	const reconnectAttemptsRef = useRef(0)
	const maxReconnectAttempts = 3

	const isLanding = messages.length === 0

	// Auto-scroll on new messages
	useEffect(() => {
		if (contentRef.current) {
			void contentRef.current.scrollToBottom(300)
		}
	}, [messages, isGenerating])

	// Pre-fill prompt from ?prompt= query param
	useEffect(() => {
		const prompt = new URLSearchParams(location.search).get('prompt')
		if (prompt) setInput(v => v || prompt)
	}, [location.search])

	// WebSocket connection
	const connectWebSocket = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) return

		console.log('[Chat] Connecting to agent:', WS_URL)
		const ws = new WebSocket(WS_URL)

		ws.onopen = () => {
			console.log('[Chat] Agent connected')
			setIsConnected(true)
			reconnectAttemptsRef.current = 0
		}

		ws.onclose = () => {
			console.log('[Chat] Agent disconnected')
			setIsConnected(false)
			if (reconnectAttemptsRef.current < maxReconnectAttempts) {
				reconnectAttemptsRef.current++
				console.log(
					`[Chat] Reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`,
				)
				setTimeout(connectWebSocket, 3000)
			}
		}

		ws.onerror = () => {
			console.error('[Chat] WebSocket error')
			setIsConnected(false)
		}

		ws.onmessage = event => {
			try {
				const data = JSON.parse(event.data as string) as Record<string, unknown>

				if (data.type === 'history') {
					const historyMessages = (
						data.messages as Array<{
							id: string
							role: string
							content: string
							timestamp: number
						}>
					).map(m => ({
						id: m.id,
						role: m.role as ChatMessage['role'],
						content: m.content,
						timestamp: m.timestamp,
					}))
					setMessages(historyMessages)
				} else if (data.type === 'history_cleared') {
					setMessages([])
					setGeneratedProject(null)
					setSuggestedPrompts([])
				} else if (data.type === 'chat_chunk') {
					const chunk = data.content as string
					setMessages(prev => {
						const last = prev[prev.length - 1]
						if (last?.role === 'assistant' && last.id === 'streaming') {
							return [
								...prev.slice(0, -1),
								{...last, content: last.content + chunk},
							]
						}
						return [
							...prev,
							{
								id: 'streaming',
								role: 'assistant',
								content: chunk,
								timestamp: Date.now(),
							},
						]
					})
				} else if (data.type === 'chat_done') {
					setMessages(prev => {
						const last = prev[prev.length - 1]
						if (last?.id === 'streaming') {
							return [...prev.slice(0, -1), {...last, id: randomId()}]
						}
						return prev
					})
					setIsLoading(false)
					if (data.suggestedPrompts && Array.isArray(data.suggestedPrompts)) {
						setSuggestedPrompts(data.suggestedPrompts as string[])
					}
				} else if (data.type === 'error') {
					setIsLoading(false)
					setIsGenerating(false)
					setMessages(prev => [
						...prev,
						{
							id: randomId(),
							role: 'system',
							content: `Error: ${(data.message as string) || 'Something went wrong. Please try again.'}`,
							timestamp: Date.now(),
						},
					])
				} else if (data.type === 'generation_start') {
					setIsGenerating(true)
					pendingFilesRef.current = []
					setGeneratedProject(null)
				} else if (data.type === 'generation_file') {
					pendingFilesRef.current = [
						...pendingFilesRef.current,
						{path: data.path as string, content: data.content as string},
					]
				} else if (data.type === 'generation_complete') {
					const files = pendingFilesRef.current
					setGeneratedProject({
						projectName: data.projectName as string,
						templateSlug: data.templateSlug as string,
						files,
						dependencies: (data.dependencies as Record<string, string>) || {},
						devDependencies:
							(data.devDependencies as Record<string, string>) || {},
					})
					setIsGenerating(false)
				} else if (data.type === 'generation_error') {
					setIsGenerating(false)
					setMessages(prev => [
						...prev,
						{
							id: randomId(),
							role: 'system',
							content: `Generation failed: ${(data.error as string) || 'An error occurred during project generation.'}`,
							timestamp: Date.now(),
						},
					])
				}
			} catch (e) {
				console.error('[Chat] Failed to parse message', e)
			}
		}

		wsRef.current = ws
	}, [])

	useEffect(() => {
		connectWebSocket()
		return () => {
			wsRef.current?.close()
		}
	}, [connectWebSocket])

	const handleSubmit = useCallback(
		(promptText?: string) => {
			const text = (promptText ?? input).trim()
			if (!text || isLoading || !isConnected) return

			const userMsg: ChatMessage = {
				id: randomId(),
				role: 'user',
				content: text,
				timestamp: Date.now(),
			}
			setMessages(prev => [...prev, userMsg])
			setInput('')
			setSuggestedPrompts([])
			setIsLoading(true)

			wsRef.current?.send(JSON.stringify({type: 'chat', content: text}))
		},
		[input, isLoading, isConnected],
	)

	const clearHistory = () => {
		wsRef.current?.send(JSON.stringify({type: 'clear_history'}))
		setShowClearAlert(false)
	}

	const handleSaveToProject = async () => {
		if (!generatedProject) return
		setSaveStatus('saving')
		try {
			const project = await api.createProject({
				name: generatedProject.projectName,
				description: `Generated from template: ${generatedProject.templateSlug}`,
				status: 'draft',
			})
			await api.saveGeneratedProject(
				project.id,
				generatedProject.files.map(f => ({
					path: f.path,
					content: f.content,
					language: f.path.split('.').pop() || 'text',
				})),
			)
			setSaveStatus('saved')
			setTimeout(() => setSaveStatus('idle'), 3000)
		} catch (e) {
			console.error('[Chat] Save to project failed:', e)
			setSaveStatus('error')
			setTimeout(() => setSaveStatus('idle'), 3000)
		}
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle style={{fontSize: 16}}>
						{isLanding ? (
							'MagicAgent'
						) : (
							<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
								<IonIcon
									icon={sparkles}
									style={{color: 'var(--ion-color-warning)', fontSize: 16}}
								/>
								<span>MagicAgent</span>
								<span
									style={{
										width: 8,
										height: 8,
										borderRadius: '50%',
										background: isConnected ? '#4ade80' : '#facc15',
										flexShrink: 0,
									}}
								/>
							</div>
						)}
					</IonTitle>
					{!isLanding && (
						<IonButtons slot="end">
							<IonButton onClick={() => setShowClearAlert(true)}>
								<IonIcon
									slot="icon-only"
									icon={trash}
									style={{color: 'var(--ion-color-medium)'}}
								/>
							</IonButton>
						</IonButtons>
					)}
				</IonToolbar>
			</IonHeader>

			<IonContent ref={contentRef} fullscreen>
				{isLanding ? (
					/* ── Landing state ── */
					<div style={{padding: '24px 16px 120px'}}>
						{/* Connection pill */}
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								marginBottom: 24,
							}}
						>
							<span
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 6,
									fontSize: 12,
									padding: '5px 14px',
									borderRadius: 20,
									border: `1px solid ${isConnected ? 'rgba(74,222,128,0.3)' : 'rgba(250,204,21,0.3)'}`,
									color: isConnected ? '#4ade80' : '#facc15',
									background: isConnected
										? 'rgba(74,222,128,0.08)'
										: 'rgba(250,204,21,0.08)',
								}}
							>
								<span
									style={{
										width: 7,
										height: 7,
										borderRadius: '50%',
										background: isConnected ? '#4ade80' : '#facc15',
									}}
								/>
								{isConnected ? 'Agent connected' : 'Connecting to agent…'}
							</span>
						</div>

						{/* Hero */}
						<h1
							style={{
								fontSize: 28,
								fontWeight: 800,
								textAlign: 'center',
								margin: '0 0 10px',
								background:
									'linear-gradient(135deg, #fb923c, #ec4899, #a855f7)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}
						>
							What do you want to create?
						</h1>
						<p
							style={{
								textAlign: 'center',
								color: 'var(--ion-color-medium)',
								fontSize: 14,
								marginBottom: 24,
							}}
						>
							Describe your idea — MagicAgent builds it for you.
						</p>

						{/* Quick suggestion chips */}
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								gap: 8,
								justifyContent: 'center',
								marginBottom: 32,
							}}
						>
							{QUICK_SUGGESTIONS.map((s, i) => (
								<IonChip
									key={i}
									color="medium"
									onClick={() => {
										setInput(s.prompt)
									}}
									style={{fontSize: 12}}
								>
									<IonLabel>{s.label}</IonLabel>
								</IonChip>
							))}
						</div>

						{/* Template gallery */}
						<h2 style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>
							Start from a template
						</h2>
						<TemplateGallery onSelect={t => setInput(t.prompt)} />
					</div>
				) : (
					/* ── Chat state ── */
					<div style={{padding: '12px 16px 16px'}}>
						{messages.map(msg => (
							<div
								key={msg.id}
								style={{
									display: 'flex',
									flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
									gap: 10,
									marginBottom: 14,
									alignItems: 'flex-end',
								}}
							>
								{/* Avatar dot */}
								<div
									style={{
										width: 28,
										height: 28,
										borderRadius: '50%',
										flexShrink: 0,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 12,
										background:
											msg.role === 'user'
												? 'var(--ion-color-step-300)'
												: 'rgba(251,146,60,0.2)',
										color:
											msg.role === 'user'
												? 'var(--ion-color-light)'
												: '#fb923c',
									}}
								>
									{msg.role === 'user' ? 'U' : '✦'}
								</div>

								{/* Bubble */}
								<div
									style={{
										maxWidth: '78%',
										padding: '10px 14px',
										borderRadius:
											msg.role === 'user'
												? '18px 18px 4px 18px'
												: '18px 18px 18px 4px',
										fontSize: 14,
										lineHeight: 1.5,
										background:
											msg.role === 'user'
												? 'var(--ion-color-step-200)'
												: msg.role === 'system'
													? 'rgba(239,68,68,0.1)'
													: 'var(--ion-color-step-100)',
										color:
											msg.role === 'system'
												? '#f87171'
												: 'var(--ion-text-color)',
										border:
											msg.id === 'streaming'
												? '1px solid rgba(251,146,60,0.3)'
												: 'none',
									}}
								>
									{msg.content}
									{msg.id === 'streaming' && (
										<span
											style={{
												display: 'inline-block',
												width: 4,
												height: 14,
												marginLeft: 3,
												background: '#fb923c',
												borderRadius: 2,
												verticalAlign: 'text-bottom',
												animation: 'pulse 1s infinite',
											}}
										/>
									)}
								</div>
							</div>
						))}

						{/* Generating indicator */}
						{isGenerating && (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 10,
									color: 'var(--ion-color-medium)',
									marginBottom: 12,
								}}
							>
								<IonIcon
									icon={sparkles}
									style={{color: '#fb923c', fontSize: 16}}
								/>
								<span style={{fontSize: 13}}>Generating project…</span>
								<IonSpinner name="dots" style={{width: 20, height: 20}} />
							</div>
						)}

						{/* Generated project card */}
						{generatedProject && (
							<GeneratedProjectCard
								project={generatedProject}
								onSaveToProject={() => void handleSaveToProject()}
								onExport={() => setShowExportSheet(true)}
								onDeploy={() => setShowDeploySheet(true)}
							/>
						)}

						{/* Save status toast-style message */}
						{saveStatus !== 'idle' && (
							<div
								style={{
									marginTop: 10,
									padding: '8px 14px',
									borderRadius: 10,
									fontSize: 13,
									background:
										saveStatus === 'saving'
											? 'var(--ion-color-step-150)'
											: saveStatus === 'saved'
												? 'rgba(74,222,128,0.15)'
												: 'rgba(239,68,68,0.15)',
									color:
										saveStatus === 'saving'
											? 'var(--ion-color-medium)'
											: saveStatus === 'saved'
												? '#4ade80'
												: '#f87171',
								}}
							>
								{saveStatus === 'saving'
									? 'Saving to your projects…'
									: saveStatus === 'saved'
										? '✓ Saved to Projects'
										: '✗ Save failed — please try again'}
							</div>
						)}

						{/* Suggested prompts */}
						{suggestedPrompts.length > 0 && !isLoading && (
							<div
								style={{
									display: 'flex',
									gap: 8,
									overflowX: 'auto',
									marginTop: 12,
									paddingBottom: 4,
								}}
							>
								{suggestedPrompts.map((prompt, i) => (
									<button
										key={i}
										onClick={() => handleSubmit(prompt)}
										style={{
											flexShrink: 0,
											display: 'inline-flex',
											alignItems: 'center',
											gap: 6,
											padding: '6px 12px',
											borderRadius: 20,
											border: '1px solid var(--ion-color-step-200)',
											background: 'none',
											color: 'var(--ion-color-medium)',
											fontSize: 12,
											cursor: 'pointer',
											whiteSpace: 'nowrap',
										}}
									>
										<IonIcon
											icon={sparkles}
											style={{fontSize: 11, color: '#fb923c'}}
										/>
										{prompt}
									</button>
								))}
							</div>
						)}

						<div style={{height: 20}} />
					</div>
				)}
			</IonContent>

			{/* Input footer */}
			<IonFooter translucent>
				<IonToolbar style={{paddingTop: 6, paddingBottom: 6}}>
					<div
						style={{
							display: 'flex',
							alignItems: 'flex-end',
							gap: 10,
							padding: '0 16px 4px',
						}}
					>
						<div
							style={{
								flex: 1,
								background: 'var(--ion-color-step-100)',
								borderRadius: 18,
								border: '1px solid var(--ion-color-step-200)',
								padding: '8px 14px',
								minHeight: 42,
							}}
						>
							<IonTextarea
								value={input}
								placeholder={
									isLanding
										? 'Describe what you want to build…'
										: 'Continue the conversation…'
								}
								autoGrow
								rows={1}
								onIonInput={e => setInput(e.detail.value || '')}
								style={
									{
										'--background': 'transparent',
										'--padding-top': '0',
										'--padding-bottom': '0',
										'--padding-start': '0',
										fontSize: 14,
									} as React.CSSProperties
								}
								disabled={!isConnected}
							/>
						</div>
						<IonButton
							shape="round"
							disabled={!input.trim() || isLoading || !isConnected}
							onClick={() => handleSubmit()}
							style={
								{
									'--padding-start': '12px',
									'--padding-end': '12px',
								} as React.CSSProperties
							}
						>
							{isLoading ? (
								<IonSpinner name="crescent" style={{width: 18, height: 18}} />
							) : (
								<IonIcon slot="icon-only" icon={send} />
							)}
						</IonButton>
					</div>
					{!isConnected && (
						<div
							style={{
								textAlign: 'center',
								fontSize: 11,
								color: 'var(--ion-color-medium)',
								paddingBottom: 4,
							}}
						>
							Reconnecting to agent…
						</div>
					)}
				</IonToolbar>
			</IonFooter>

			{/* Clear history alert */}
			<IonAlert
				isOpen={showClearAlert}
				header="Clear Chat History"
				message="This will clear all messages and the generated project. Continue?"
				buttons={[
					{
						text: 'Cancel',
						role: 'cancel',
						handler: () => setShowClearAlert(false),
					},
					{text: 'Clear', role: 'destructive', handler: clearHistory},
				]}
				onDidDismiss={() => setShowClearAlert(false)}
			/>

			{/* Export (GitHub) action sheet */}
			<IonActionSheet
				isOpen={showExportSheet}
				header={
					generatedProject
						? `Export "${generatedProject.projectName}"`
						: 'Export Project'
				}
				buttons={[
					{
						text: 'Open GitHub (create repo)',
						icon: logoGithub,
						handler: () => {
							window.open(
								'https://github.com/new',
								'_blank',
								'noopener,noreferrer',
							)
						},
					},
					{
						text: 'View CLI instructions',
						icon: code,
						handler: () => {
							const name =
								generatedProject?.projectName
									.toLowerCase()
									.replace(/\s+/g, '-') || 'my-app'
							setGithubCliName(name)
							setShowGithubCliAlert(true)
						},
					},
					{text: 'Cancel', role: 'cancel'},
				]}
				onDidDismiss={() => setShowExportSheet(false)}
			/>

			{/* Deploy action sheet */}
			<IonActionSheet
				isOpen={showDeploySheet}
				header={
					generatedProject
						? `Deploy "${generatedProject.projectName}"`
						: 'Deploy Project'
				}
				buttons={[
					{
						text: 'Deploy to Cloudflare Pages',
						icon: cloudUpload,
						handler: () => {
							window.open(
								'https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/workers-sdk/tree/main/templates/worker-typescript',
								'_blank',
								'noopener,noreferrer',
							)
						},
					},
					{
						text: 'View wrangler CLI steps',
						icon: code,
						handler: () => {
							const name = generatedProject?.projectName || 'my-app'
							setWranglerCliName(name)
							setShowWranglerCliAlert(true)
						},
					},
					{text: 'Cancel', role: 'cancel'},
				]}
				onDidDismiss={() => setShowDeploySheet(false)}
			/>
			{/* GitHub CLI instructions alert */}
			<IonAlert
				isOpen={showGithubCliAlert}
				header="GitHub CLI commands"
				message={`cd ${githubCliName}\ngit init && git add .\ngit commit -m "Initial commit"\ngh repo create ${githubCliName} --public --push --source=.`}
				buttons={[
					{
						text: 'OK',
						role: 'cancel',
						handler: () => setShowGithubCliAlert(false),
					},
				]}
				onDidDismiss={() => setShowGithubCliAlert(false)}
			/>

			{/* Wrangler CLI steps alert */}
			<IonAlert
				isOpen={showWranglerCliAlert}
				header="Wrangler CLI steps"
				message={`cd ${wranglerCliName}\nnpx wrangler deploy`}
				buttons={[
					{
						text: 'OK',
						role: 'cancel',
						handler: () => setShowWranglerCliAlert(false),
					},
				]}
				onDidDismiss={() => setShowWranglerCliAlert(false)}
			/>
		</IonPage>
	)
}
