/**
 * Project Workspace Screen - mobile file editor
 */
import {
	IonAlert,
	IonActionSheet,
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonPage,
	IonSpinner,
	IonTitle,
	IonToast,
	IonToolbar,
} from '@ionic/react'
import {
	addOutline,
	saveOutline,
	trashOutline,
	chevronDown,
} from 'ionicons/icons'
import React, {useState, useEffect, useCallback} from 'react'
import {useParams} from 'react-router-dom'
import type {ProjectFile} from '../types'
import {api} from '../lib/api'

export default function ProjectWorkspace() {
	const {id} = useParams<{id: string}>()
	const [files, setFiles] = useState<ProjectFile[]>([])
	const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
	const [fileContent, setFileContent] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [isDirty, setIsDirty] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showFileSheet, setShowFileSheet] = useState(false)
	const [showNewFileAlert, setShowNewFileAlert] = useState(false)
	const [showDeleteAlert, setShowDeleteAlert] = useState(false)
	const [toast, setToast] = useState<{msg: string; color?: string} | null>(null)

	const loadFiles = useCallback(async () => {
		if (!id) return
		try {
			setIsLoading(true)
			setError(null)
			const data = await api.getProjectFiles(id)
			setFiles(data)
			if (data.length > 0) {
				setSelectedFile(data[0])
				setFileContent(data[0].content)
				setIsDirty(false)
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load files')
		} finally {
			setIsLoading(false)
		}
	}, [id])

	useEffect(() => {
		loadFiles()
	}, [loadFiles])

	const handleSelectFile = (file: ProjectFile) => {
		setSelectedFile(file)
		setFileContent(file.content)
		setIsDirty(false)
		setShowFileSheet(false)
	}

	const handleSave = async () => {
		if (!selectedFile || !id || isSaving) return
		setIsSaving(true)
		try {
			const updated = await api.updateProjectFile(id, selectedFile.id, {
				content: fileContent,
			})
			setSelectedFile(updated)
			setFiles(prev => prev.map(f => (f.id === updated.id ? updated : f)))
			setIsDirty(false)
		} catch (e) {
			setToast({
				msg: e instanceof Error ? e.message : 'Failed to save',
				color: 'danger',
			})
		} finally {
			setIsSaving(false)
		}
	}

	const handleCreateFile = async (name: string) => {
		if (!id || !name.trim()) return
		try {
			const newFile = await api.saveProjectFile(id, {
				path: name.trim(),
				content: '',
			})
			setFiles(prev => [...prev, newFile])
			setSelectedFile(newFile)
			setFileContent('')
			setIsDirty(false)
		} catch (e) {
			setToast({
				msg: e instanceof Error ? e.message : 'Failed to create file',
				color: 'danger',
			})
		}
	}

	const handleDeleteFile = async () => {
		if (!selectedFile || !id) return
		try {
			await api.deleteProjectFile(id, selectedFile.path)
			const remaining = files.filter(f => f.id !== selectedFile.id)
			setFiles(remaining)
			if (remaining.length > 0) {
				setSelectedFile(remaining[0])
				setFileContent(remaining[0].content)
			} else {
				setSelectedFile(null)
				setFileContent('')
			}
			setIsDirty(false)
		} catch (e) {
			setToast({
				msg: e instanceof Error ? e.message : 'Failed to delete file',
				color: 'danger',
			})
		}
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref={`/tabs/projects/${id}`} />
					</IonButtons>
					<IonTitle>Files</IonTitle>
					<IonButtons slot="end">
						{selectedFile && (
							<>
								<IonButton onClick={() => setShowDeleteAlert(true)}>
									<IonIcon slot="icon-only" icon={trashOutline} />
								</IonButton>
								<IonButton onClick={() => setShowNewFileAlert(true)}>
									<IonIcon slot="icon-only" icon={addOutline} />
								</IonButton>
								<IonButton
									onClick={() => void handleSave()}
									disabled={!isDirty || isSaving}
									color={isDirty ? 'primary' : undefined}
								>
									{isSaving ? (
										<IonSpinner name="crescent" />
									) : (
										<IonIcon slot="icon-only" icon={saveOutline} />
									)}
								</IonButton>
							</>
						)}
						{!selectedFile && (
							<IonButton onClick={() => setShowNewFileAlert(true)}>
								<IonIcon slot="icon-only" icon={addOutline} />
							</IonButton>
						)}
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			{files.length > 0 && (
				<div className="workspace-file-bar">
					<button
						type="button"
						className="workspace-file-tab"
						onClick={() => setShowFileSheet(true)}
					>
						<span className="workspace-file-name">
							{selectedFile?.path ?? 'Select file'}
						</span>
						<IonIcon icon={chevronDown} />
						{isDirty && <span className="workspace-dirty-dot" />}
					</button>
				</div>
			)}
			<IonContent fullscreen>
				{isLoading ? (
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<div className="app-empty-icon">
								<IonSpinner name="crescent" />
							</div>
							<h2 className="app-section-title">Loading files...</h2>
						</section>
					</div>
				) : error ? (
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<h2 className="app-section-title">Could not load files</h2>
							<p className="app-subtle-text">{error}</p>
							<div className="app-chip-row" style={{justifyContent: 'center'}}>
								<IonButton fill="outline" onClick={() => void loadFiles()}>
									Retry
								</IonButton>
							</div>
						</section>
					</div>
				) : files.length === 0 ? (
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<h2 className="app-section-title">No files yet</h2>
							<p className="app-subtle-text">
								Create the first file to start building.
							</p>
							<div className="app-chip-row" style={{justifyContent: 'center'}}>
								<IonButton onClick={() => setShowNewFileAlert(true)}>
									<IonIcon slot="start" icon={addOutline} />
									New File
								</IonButton>
							</div>
						</section>
					</div>
				) : (
					<textarea
						className="workspace-editor"
						value={fileContent}
						onChange={e => {
							setFileContent(e.target.value)
							setIsDirty(true)
						}}
						spellCheck={false}
						autoCapitalize="none"
						autoCorrect="off"
						autoComplete="off"
					/>
				)}
			</IonContent>
			<IonActionSheet
				isOpen={showFileSheet}
				onDidDismiss={() => setShowFileSheet(false)}
				header="Select File"
				buttons={[
					...files.map(f => ({
						text: f.path,
						handler: () => {
							handleSelectFile(f)
							return true
						},
					})),
					{text: 'Cancel', role: 'cancel'},
				]}
			/>
			<IonAlert
				isOpen={showNewFileAlert}
				onDidDismiss={() => setShowNewFileAlert(false)}
				header="New File"
				message="Enter a path for the new file (e.g. src/index.tsx):"
				inputs={[{name: 'name', type: 'text', placeholder: 'index.tsx'}]}
				buttons={[
					{text: 'Cancel', role: 'cancel'},
					{
						text: 'Create',
						handler: (data: {name: string}) => {
							void handleCreateFile(data.name)
						},
					},
				]}
			/>
			<IonAlert
				isOpen={showDeleteAlert}
				onDidDismiss={() => setShowDeleteAlert(false)}
				header="Delete File?"
				message={`Delete "${selectedFile?.path}"? This cannot be undone.`}
				buttons={[
					{text: 'Cancel', role: 'cancel'},
					{
						text: 'Delete',
						role: 'destructive',
						handler: () => void handleDeleteFile(),
					},
				]}
			/>
			<IonToast
				isOpen={toast !== null}
				onDidDismiss={() => setToast(null)}
				message={toast?.msg ?? ''}
				duration={3000}
				position="bottom"
				color={toast?.color ?? 'primary'}
			/>
		</IonPage>
	)
}
