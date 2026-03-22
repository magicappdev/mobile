/**
 * Projects Screen - List and manage projects
 */

import {
	IonAlert,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonItemOption,
	IonItemOptions,
	IonItemSliding,
	IonPage,
	IonToast,
	IonToolbar,
	IonRefresher,
	IonRefresherContent,
	IonSpinner,
	RefresherEventDetail,
	IonTitle,
} from '@ionic/react'
import {add, build, chevronForward, trashOutline} from 'ionicons/icons'
import {getProjectStatusMeta} from '../lib/project-status'
import React, {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import type {Project} from '../types'
import {api} from '../lib/api'

export default function Projects() {
	const [projects, setProjects] = useState<Project[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [showCreateAlert, setShowCreateAlert] = useState(false)
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
	const [toast, setToast] = useState<{msg: string; color?: string} | null>(null)
	const history = useHistory()
	const createProjectRoute = `/tabs/chat?prompt=${encodeURIComponent('Help me create a new app and outline the first screen.')}`

	const loadProjects = async () => {
		try {
			setIsLoading(true)
			const data = await api.getProjects()
			setProjects(data)
		} catch (error) {
			console.error('Failed to load projects:', error)
			setToast({msg: 'Failed to load projects', color: 'danger'})
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		void loadProjects()
	}, [])

	const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
		await loadProjects()
		event.detail.complete()
	}

	const handleCreateProject = async (name: string, description: string) => {
		if (!name.trim()) return
		try {
			const project = await api.createProject({
				name: name.trim(),
				description: description.trim(),
			})
			setProjects(prev => [project, ...prev])
			setToast({msg: `"${project.name}" created`, color: 'success'})
			history.push(`/tabs/projects/${project.id}`)
		} catch (e) {
			setToast({
				msg: e instanceof Error ? e.message : 'Failed to create project',
				color: 'danger',
			})
		}
	}

	const handleDeleteProject = async (project: Project) => {
		try {
			await api.deleteProject(project.id)
			setProjects(prev => prev.filter(p => p.id !== project.id))
			setToast({msg: `"${project.name}" deleted`, color: 'medium'})
		} catch (e) {
			setToast({
				msg: e instanceof Error ? e.message : 'Failed to delete project',
				color: 'danger',
			})
		} finally {
			setProjectToDelete(null)
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString([], {
			month: 'short',
			day: 'numeric',
		})
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Projects</IonTitle>
					<IonButtons slot="end">
						<IonButton onClick={() => setShowCreateAlert(true)}>
							<IonIcon slot="icon-only" icon={add} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent className="app-page-content">
				<IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
					<IonRefresherContent />
				</IonRefresher>

				<div className="app-page-stack">
					<section className="app-card app-hero-card">
						<div className="app-eyebrow">Projects</div>
						<h1 className="app-hero-title app-hero-title--compact">
							Keep every build in one place
						</h1>
						<p className="app-hero-copy">
							Review active work, revisit shipped apps, or jump back into the AI
							builder to start something new.
						</p>
						<div className="app-chip-row">
							<IonButton routerLink={createProjectRoute}>
								<IonIcon slot="start" icon={add} />
								Create with AI
							</IonButton>
							<IonButton
								fill="outline"
								onClick={() => setShowCreateAlert(true)}
							>
								Quick Create
							</IonButton>
						</div>
					</section>

					{isLoading ? (
						<section className="app-card app-empty-state">
							<div className="app-empty-icon">
								<IonSpinner name="crescent" />
							</div>
							<h2 className="app-section-title">Loading projects...</h2>
							<p className="app-subtle-text">
								Pulling your latest workspaces into view.
							</p>
						</section>
					) : projects.length === 0 ? (
						<section className="app-card app-empty-state">
							<div className="app-empty-icon">
								<IonIcon icon={build} />
							</div>
							<h2 className="app-section-title">No projects yet</h2>
							<p className="app-subtle-text">
								Start a new build in chat and it will show up here as soon as it
								is created.
							</p>
							<div className="app-chip-row" style={{justifyContent: 'center'}}>
								<IonButton fill="outline" routerLink={createProjectRoute}>
									<IonIcon slot="start" icon={add} />
									Open AI Builder
								</IonButton>
							</div>
						</section>
					) : (
						<section className="app-project-list">
							{projects.map(project => {
								const statusMeta = getProjectStatusMeta(project.status)

								return (
									<IonItemSliding key={project.id}>
										<button
											type="button"
											className="app-project-card"
											onClick={() =>
												history.push(`/tabs/projects/${project.id}`)
											}
										>
											<div className="app-project-card-header">
												<div>
													<h2 className="app-project-card-title">
														{project.name}
													</h2>
													<p className="app-project-card-copy">
														{project.description || 'No description yet.'}
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
											<div className="app-project-card-meta">
												<span>Updated {formatDate(project.updatedAt)}</span>
												<span>
													Open details <IonIcon icon={chevronForward} />
												</span>
											</div>
										</button>
										<IonItemOptions side="end">
											<IonItemOption
												color="danger"
												onClick={() => setProjectToDelete(project)}
											>
												<IonIcon slot="icon-only" icon={trashOutline} />
											</IonItemOption>
										</IonItemOptions>
									</IonItemSliding>
								)
							})}
						</section>
					)}
				</div>
			</IonContent>

			<IonAlert
				isOpen={showCreateAlert}
				onDidDismiss={() => setShowCreateAlert(false)}
				header="New Project"
				inputs={[
					{name: 'name', type: 'text', placeholder: 'Project name'},
					{
						name: 'description',
						type: 'text',
						placeholder: 'Short description (optional)',
					},
				]}
				buttons={[
					{text: 'Cancel', role: 'cancel'},
					{
						text: 'Create',
						handler: (data: {name: string; description: string}) => {
							void handleCreateProject(data.name, data.description ?? '')
						},
					},
				]}
			/>

			<IonAlert
				isOpen={projectToDelete !== null}
				onDidDismiss={() => setProjectToDelete(null)}
				header="Delete Project?"
				message={`Delete "${projectToDelete?.name}"? This cannot be undone.`}
				buttons={[
					{text: 'Cancel', role: 'cancel'},
					{
						text: 'Delete',
						role: 'destructive',
						handler: () => {
							if (projectToDelete) void handleDeleteProject(projectToDelete)
						},
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
