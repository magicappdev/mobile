/**
 * Project Detail Screen - View and manage a single project
 */

import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonPage,
	IonToolbar,
	IonTitle,
	IonRefresher,
	IonRefresherContent,
	RefresherEventDetail,
	IonAlert,
	IonSpinner,
} from '@ionic/react'
import {
	calendarOutline,
	timeOutline,
	codeOutline,
	trashOutline,
	settingsOutline,
	checkmarkCircleOutline,
	openOutline,
} from 'ionicons/icons'
import React, {useState, useEffect, useCallback} from 'react'
import {getProjectStatusMeta} from '../lib/project-status'
import {useParams, useHistory} from 'react-router-dom'
import type {Project} from '../types'
import {api} from '../lib/api'

export default function ProjectDetail() {
	const {id} = useParams<{id: string}>()
	const history = useHistory()
	const [project, setProject] = useState<Project | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showDeleteAlert, setShowDeleteAlert] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const loadProject = useCallback(async () => {
		if (!id) return
		try {
			setIsLoading(true)
			setError(null)
			const found = await api.getProject(id)
			setProject(found)
		} catch (error) {
			console.error('Failed to load project:', error)
			setError(
				error instanceof Error ? error.message : 'Failed to load project',
			)
		} finally {
			setIsLoading(false)
		}
	}, [id])

	useEffect(() => {
		loadProject()
	}, [loadProject])

	const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
		await loadProject()
		event.detail.complete()
	}

	const handleDelete = async () => {
		if (!project || isDeleting) return
		setShowDeleteAlert(false)
		setIsDeleting(true)
		try {
			await api.deleteProject(project.id)
			history.push('/tabs/projects')
		} catch (error) {
			console.error('Failed to delete project:', error)
			setIsDeleting(false)
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString()
	}

	if (isLoading) {
		return (
			<IonPage>
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="start">
							<IonBackButton defaultHref="/tabs/projects" />
						</IonButtons>
						<IonTitle>Loading...</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent className="app-page-content">
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<div className="app-empty-icon">
								<IonSpinner name="crescent" />
							</div>
							<h2 className="app-section-title">Loading project details...</h2>
							<p className="app-subtle-text">
								Pulling the latest state for this workspace.
							</p>
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
							<IonBackButton defaultHref="/tabs/projects" />
						</IonButtons>
						<IonTitle>Error</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent className="app-page-content">
					<div className="app-page-stack">
						<section className="app-card app-empty-state">
							<div
								className="app-empty-icon"
								style={{
									background: 'var(--app-error-soft)',
									color: 'var(--ion-color-danger)',
								}}
							>
								<IonIcon icon={codeOutline} />
							</div>
							<h2 className="app-section-title">
								{error || 'Project not found'}
							</h2>
							<p className="app-subtle-text">
								The project could not be loaded right now.
							</p>
							<div className="app-chip-row" style={{justifyContent: 'center'}}>
								<IonButton fill="outline" href="/tabs/projects">
									Back to Projects
								</IonButton>
							</div>
						</section>
					</div>
				</IonContent>
			</IonPage>
		)
	}

	const statusMeta = getProjectStatusMeta(project.status)

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref="/tabs/projects" />
					</IonButtons>
					<IonTitle>{project.name}</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="app-page-content">
				<IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
					<IonRefresherContent />
				</IonRefresher>

				<div className="app-page-stack">
					<section className="app-card app-hero-card">
						<div className="app-eyebrow">Project overview</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								gap: '12px',
								alignItems: 'flex-start',
								flexWrap: 'wrap',
							}}
						>
							<div>
								<h1 className="app-hero-title app-hero-title--compact">
									{project.name}
								</h1>
								<p className="app-hero-copy">
									{project.description || 'No description provided yet.'}
								</p>
							</div>
							<span
								className="app-status-pill"
								style={{
									background: statusMeta.background,
									color: statusMeta.color,
								}}
							>
								{statusMeta.label}
							</span>
						</div>
					</section>

					<section className="app-card app-card-section">
						<div className="app-metadata-list">
							<div className="app-metadata-row">
								<IonIcon icon={calendarOutline} color="medium" />
								<div>
									<h3>Created</h3>
									<p>{formatDate(project.createdAt)}</p>
								</div>
							</div>
							<div className="app-metadata-row">
								<IonIcon icon={timeOutline} color="medium" />
								<div>
									<h3>Last updated</h3>
									<p>{formatDate(project.updatedAt)}</p>
								</div>
							</div>
							<div className="app-metadata-row">
								<IonIcon icon={codeOutline} color="medium" />
								<div>
									<h3>Project ID</h3>
									<p style={{fontFamily: 'monospace', fontSize: '0.78rem'}}>
										{project.id}
									</p>
								</div>
							</div>
						</div>
					</section>

					<section className="app-card app-card-section">
						<div style={{marginBottom: '16px'}}>
							<h2 className="app-section-title">Actions</h2>
							<p className="app-subtle-text">
								Open the live app, inspect the repository, or adjust app-level
								settings from here.
							</p>
						</div>
						<div className="app-action-list">
							{project.deploymentUrl && (
								<a
									className="app-action-link"
									href={project.deploymentUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<div>
										<h3 className="app-section-title">Live deployment</h3>
										<p className="app-subtle-text">Open deployed application</p>
									</div>
									<IonIcon icon={checkmarkCircleOutline} color="success" />
								</a>
							)}
							{project.githubUrl && (
								<a
									className="app-action-link"
									href={project.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<div>
										<h3 className="app-section-title">GitHub repository</h3>
										<p className="app-subtle-text">View source code</p>
									</div>
									<IonIcon icon={openOutline} />
								</a>
							)}
							<button
								type="button"
								className="app-action-link"
								onClick={() => history.push('/tabs/settings')}
							>
								<div>
									<h3 className="app-section-title">App settings</h3>
									<p className="app-subtle-text">
										Manage preferences and linked accounts
									</p>
								</div>
								<IonIcon icon={settingsOutline} />
							</button>
						</div>
						{!project.deploymentUrl && !project.githubUrl && (
							<div className="app-inline-note">
								This project has not been deployed or connected to GitHub yet.
							</div>
						)}
					</section>

					<section className="app-card app-card-section">
						<IonButton
							expand="block"
							fill="outline"
							color="danger"
							onClick={() => setShowDeleteAlert(true)}
						>
							<IonIcon slot="start" icon={trashOutline} />
							Delete Project
						</IonButton>
					</section>
				</div>

				{/* Delete Confirmation Alert */}
				<IonAlert
					isOpen={showDeleteAlert && !isDeleting}
					onDidDismiss={() => !isDeleting && setShowDeleteAlert(false)}
					header="Delete Project?"
					message="Are you sure you want to delete this project? This action cannot be undone."
					buttons={[
						{
							text: 'Cancel',
							role: 'cancel',
						},
						{
							text: 'Delete',
							role: 'destructive',
							handler: handleDelete,
						},
					]}
				/>
			</IonContent>
		</IonPage>
	)
}
