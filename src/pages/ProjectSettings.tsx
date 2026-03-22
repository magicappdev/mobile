/**
 * Project Settings Screen - rename, reconfigure, and delete a project.
 */
import {
	IonAlert,
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonPage,
	IonSelect,
	IonSelectOption,
	IonSpinner,
	IonTextarea,
	IonTitle,
	IonToast,
	IonToolbar,
} from '@ionic/react'
import React, {useState, useEffect, useCallback} from 'react'
import {saveOutline, trashOutline} from 'ionicons/icons'
import {useHistory, useParams} from 'react-router-dom'
import type {Project} from '../types'
import {api} from '../lib/api'

export default function ProjectSettings() {
	const {id} = useParams<{id: string}>()
	const history = useHistory()
	const [project, setProject] = useState<Project | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [showDeleteAlert, setShowDeleteAlert] = useState(false)
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [status, setStatus] = useState<Project['status']>('draft')

	const loadProject = useCallback(async () => {
		if (!id) return
		try {
			setIsLoading(true)
			const data = await api.getProject(id)
			setProject(data)
			setName(data.name)
			setDescription(data.description ?? '')
			setStatus(data.status)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load project')
		} finally {
			setIsLoading(false)
		}
	}, [id])

	useEffect(() => {
		loadProject()
	}, [loadProject])

	const handleSave = async () => {
		if (!id || isSaving) return
		setIsSaving(true)
		try {
			const updated = await api.updateProject(id, {
				name: name.trim() || project?.name,
				description: description.trim(),
				status,
			})
			setProject(updated)
			setToastMessage('Settings saved')
			setShowToast(true)
		} catch (e) {
			setToastMessage(e instanceof Error ? e.message : 'Failed to save')
			setShowToast(true)
		} finally {
			setIsSaving(false)
		}
	}

	const handleDelete = async () => {
		if (!project || isDeleting) return
		setIsDeleting(true)
		try {
			await api.deleteProject(project.id)
			history.push('/tabs/projects')
		} catch (e) {
			setToastMessage(e instanceof Error ? e.message : 'Failed to delete')
			setShowToast(true)
			setIsDeleting(false)
		}
	}

	if (isLoading) {
		return (
			<IonPage>
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="start">
							<IonBackButton defaultHref={`/tabs/projects/${id}`} />
						</IonButtons>
						<IonTitle>Settings</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent className="app-page-content">
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<div className="app-empty-icon">
								<IonSpinner name="crescent" />
							</div>
							<h2 className="app-section-title">Loading settings...</h2>
						</section>
					</div>
				</IonContent>
			</IonPage>
		)
	}

	if (error || !project) {
		return (
			<IonPage>
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="start">
							<IonBackButton defaultHref={`/tabs/projects/${id}`} />
						</IonButtons>
						<IonTitle>Settings</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent className="app-page-content">
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<h2 className="app-section-title">
								{error ?? 'Project not found'}
							</h2>
						</section>
					</div>
				</IonContent>
			</IonPage>
		)
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref={`/tabs/projects/${id}`} />
					</IonButtons>
					<IonTitle>Settings</IonTitle>
					<IonButtons slot="end">
						<IonButton
							onClick={() => void handleSave()}
							disabled={isSaving}
							color="primary"
						>
							{isSaving ? (
								<IonSpinner name="crescent" />
							) : (
								<IonIcon slot="icon-only" icon={saveOutline} />
							)}
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent className="app-page-content">
				<div className="app-page-stack">
					<section className="app-card app-hero-card">
						<div className="app-eyebrow">Project Settings</div>
						<h1 className="app-hero-title app-hero-title--compact">
							{project.name}
						</h1>
						<p className="app-hero-copy">
							Update your project details or remove it from your workspace.
						</p>
					</section>
					<section className="app-card">
						<IonList lines="inset">
							<IonListHeader>
								<IonLabel>General</IonLabel>
							</IonListHeader>
							<IonItem className="app-form-item">
								<IonLabel position="stacked">Project Name</IonLabel>
								<IonInput
									value={name}
									onIonInput={e => setName(String(e.detail.value ?? ''))}
									placeholder="My Awesome App"
									clearInput
								/>
							</IonItem>
							<IonItem className="app-form-item">
								<IonLabel position="stacked">Description</IonLabel>
								<IonTextarea
									value={description}
									onIonInput={e => setDescription(String(e.detail.value ?? ''))}
									placeholder="What does this project do?"
									autoGrow
									rows={3}
								/>
							</IonItem>
							<IonItem className="app-form-item">
								<IonLabel>Status</IonLabel>
								<IonSelect
									value={status}
									onIonChange={e =>
										setStatus(e.detail.value as Project['status'])
									}
								>
									<IonSelectOption value="draft">Draft</IonSelectOption>
									<IonSelectOption value="active">Active</IonSelectOption>
									<IonSelectOption value="archived">Archived</IonSelectOption>
									<IonSelectOption value="deployed">Deployed</IonSelectOption>
								</IonSelect>
							</IonItem>
						</IonList>
					</section>
					<section className="app-card app-card-section">
						<IonButton
							expand="block"
							onClick={() => void handleSave()}
							disabled={isSaving}
						>
							{isSaving ? (
								<IonSpinner name="crescent" />
							) : (
								<>
									<IonIcon slot="start" icon={saveOutline} />
									Save Changes
								</>
							)}
						</IonButton>
					</section>
					<section className="app-card app-card-section">
						<IonList lines="none">
							<IonListHeader>
								<IonLabel color="danger">Danger Zone</IonLabel>
							</IonListHeader>
						</IonList>
						<IonButton
							expand="block"
							fill="outline"
							color="danger"
							onClick={() => setShowDeleteAlert(true)}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<IonSpinner name="crescent" />
							) : (
								<>
									<IonIcon slot="start" icon={trashOutline} />
									Delete Project
								</>
							)}
						</IonButton>
					</section>
				</div>
			</IonContent>
			<IonAlert
				isOpen={showDeleteAlert && !isDeleting}
				onDidDismiss={() => !isDeleting && setShowDeleteAlert(false)}
				header="Delete Project?"
				message={`Delete "${project.name}"? This action cannot be undone.`}
				buttons={[
					{text: 'Cancel', role: 'cancel'},
					{
						text: 'Delete',
						role: 'destructive',
						handler: () => void handleDelete(),
					},
				]}
			/>
			<IonToast
				isOpen={showToast}
				onDidDismiss={() => setShowToast(false)}
				message={toastMessage}
				duration={2500}
				position="bottom"
			/>
		</IonPage>
	)
}
