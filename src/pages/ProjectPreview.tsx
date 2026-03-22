/**
 * Project Preview Screen - live HTML preview from project files.
 */
import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonPage,
	IonSpinner,
	IonTitle,
	IonToolbar,
} from '@ionic/react'
import React, {useState, useEffect} from 'react'
import {refreshOutline} from 'ionicons/icons'
import {useParams} from 'react-router-dom'
import type {ProjectFile} from '../types'
import {api} from '../lib/api'

function buildPreviewHtml(files: ProjectFile[]): string {
	const indexFile = files.find(
		f => f.path === 'index.html' || f.path.endsWith('/index.html'),
	)
	if (indexFile) return indexFile.content
	const reactFiles = files.filter(
		f =>
			f.path.endsWith('.tsx') ||
			f.path.endsWith('.jsx') ||
			f.path.endsWith('.ts') ||
			f.path.endsWith('.js'),
	)
	if (reactFiles.length > 0) {
		return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Preview</title>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>body{margin:0;font-family:-apple-system,sans-serif}#root{min-height:100vh}</style>
</head><body><div id="root"></div>
<script type="text/babel">
${reactFiles.map(f => `// ${f.path}\n${f.content}`).join('\n\n')}
</script></body></html>`
	}
	return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Preview</title>
<style>body{margin:0;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}.box{text-align:center;padding:2rem}h1{margin:0 0 1rem;font-size:1.75rem}.badge{display:inline-block;margin-top:1rem;padding:.25rem .75rem;background:rgba(255,255,255,.2);border-radius:999px;font-size:.875rem}</style>
</head><body><div class="box"><h1>&#x1F680; MagicAppDev</h1><p>Your app is ready to build!</p><div class="badge">${files.length} file${files.length !== 1 ? 's' : ''} in workspace</div></div></body></html>`
}

export default function ProjectPreview() {
	const {id} = useParams<{id: string}>()
	const [files, setFiles] = useState<ProjectFile[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [previewKey, setPreviewKey] = useState(0)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return
		setIsLoading(true)
		api
			.getProjectFiles(id)
			.then(data => {
				setFiles(data)
				setIsLoading(false)
			})
			.catch(e => {
				setError(e instanceof Error ? e.message : 'Failed to load files')
				setIsLoading(false)
			})
	}, [id])

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref={`/tabs/projects/${id}`} />
					</IonButtons>
					<IonTitle>Preview</IonTitle>
					<IonButtons slot="end">
						<IonButton
							onClick={() => setPreviewKey(k => k + 1)}
							disabled={isLoading}
						>
							<IonIcon slot="icon-only" icon={refreshOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				{isLoading ? (
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<div className="app-empty-icon">
								<IonSpinner name="crescent" />
							</div>
							<h2 className="app-section-title">Building preview...</h2>
							<p className="app-subtle-text">Loading your project files.</p>
						</section>
					</div>
				) : error ? (
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<h2 className="app-section-title">Preview unavailable</h2>
							<p className="app-subtle-text">{error}</p>
						</section>
					</div>
				) : (
					<iframe
						key={previewKey}
						srcDoc={files.length > 0 ? buildPreviewHtml(files) : ''}
						className="workspace-preview-frame"
						sandbox="allow-scripts allow-same-origin allow-forms"
						title="Project preview"
					/>
				)}
			</IonContent>
		</IonPage>
	)
}
