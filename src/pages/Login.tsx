/**
 * Login Screen
 *
 * Email/password and OAuth login (GitHub, Discord)
 */

import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonContent,
	IonHeader,
	IonInput,
	IonItem,
	IonLabel,
	IonPage,
	IonTitle,
	IonToolbar,
	IonIcon,
	useIonViewWillEnter,
} from '@ionic/react'
import {TurnstileWidget} from '../components/ui/TurnstileWidget'
import {logoDiscord, logoGithub} from 'ionicons/icons'
import {Redirect, useHistory} from 'react-router-dom'
import React, {useEffect, useState} from 'react'
import {useAuth} from '../contexts/AuthContext'

const TURNSTILE_ENABLED = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [turnstileToken, setTurnstileToken] = useState<string | undefined>()
	const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0)
	const {login, loginWithGitHub, loginWithDiscord, user} = useAuth()
	const history = useHistory()

	console.log('Login: rendering, user authenticated:', !!user)

	// Ionic specific lifecycle hook for redirection
	useIonViewWillEnter(() => {
		if (user) {
			console.log('Login: useIonViewWillEnter - User detected, redirecting...')
			history.replace('/tabs/home')
		}
	})

	// If user is already authenticated, redirect to home
	useEffect(() => {
		if (user) {
			console.log(
				'Login: User detected in useEffect, navigating to /tabs/home...',
			)
			history.replace('/tabs/home')
		}
	}, [user, history])

	if (user) {
		console.log('Login: Rendering Redirect to /tabs/home')
		return <Redirect to="/tabs/home" />
	}

	const handleEmailLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)
		try {
			await login(email, password, turnstileToken)
			// Navigation is handled by AuthContext when user state updates
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: 'Login failed. Please check your credentials.'
			setError(message)
			setTurnstileToken(undefined)
			setTurnstileWidgetKey(currentKey => currentKey + 1)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Sign In</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen className="app-auth-content">
				<div className="app-auth-shell">
					<section className="app-auth-hero">
						<div className="app-eyebrow">MagicAppDev</div>
						<h1 className="app-hero-title">Welcome back</h1>
						<p className="app-hero-copy">
							Sign in to continue building, reviewing projects, and shipping
							updates from one workspace.
						</p>
					</section>

					<IonCard className="app-card app-auth-card">
						<IonCardHeader>
							<IonCardTitle>Sign In</IonCardTitle>
							<IonCardSubtitle>
								Enter your credentials to continue
							</IonCardSubtitle>
						</IonCardHeader>
						<IonCardContent>
							<form onSubmit={handleEmailLogin} className="app-form-stack">
								<IonItem lines="none" className="app-form-item">
									<IonLabel position="stacked">Email</IonLabel>
									<IonInput
										type="email"
										value={email}
										onIonInput={e => setEmail(e.detail.value || '')}
										required
									/>
								</IonItem>
								<IonItem lines="none" className="app-form-item">
									<IonLabel position="stacked">Password</IonLabel>
									<IonInput
										type="password"
										value={password}
										onIonInput={e => setPassword(e.detail.value || '')}
										required
									/>
								</IonItem>
								{TURNSTILE_ENABLED && (
									<TurnstileWidget
										key={turnstileWidgetKey}
										onSuccess={token => setTurnstileToken(token)}
										onError={() => {
											setTurnstileToken(undefined)
											setTurnstileWidgetKey(currentKey => currentKey + 1)
										}}
										onExpire={() => {
											setTurnstileToken(undefined)
											setTurnstileWidgetKey(currentKey => currentKey + 1)
										}}
									/>
								)}
								{error && <div className="app-error-banner">{error}</div>}
								<IonButton
									expand="block"
									type="submit"
									disabled={
										isLoading ||
										!email.trim() ||
										!password ||
										(TURNSTILE_ENABLED && !turnstileToken)
									}
								>
									{isLoading ? 'Signing In...' : 'Sign In'}
								</IonButton>
								<IonButton
									expand="block"
									fill="outline"
									type="button"
									onClick={() => void loginWithGitHub()}
									disabled={isLoading}
								>
									<IonIcon slot="start" icon={logoGithub} />
									Continue with GitHub
								</IonButton>
								<IonButton
									expand="block"
									fill="outline"
									type="button"
									onClick={() => void loginWithDiscord()}
									disabled={isLoading}
								>
									<IonIcon slot="start" icon={logoDiscord} />
									Continue with Discord
								</IonButton>
							</form>
						</IonCardContent>
					</IonCard>
					<div className="app-link-copy">
						Don&apos;t have an account? <a href="/register">Sign Up</a>
					</div>
				</div>
			</IonContent>
		</IonPage>
	)
}
