import {Turnstile} from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
	onSuccess: (token: string) => void
	onError?: () => void
	onExpire?: () => void
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export function TurnstileWidget({
	onSuccess,
	onError,
	onExpire,
}: TurnstileWidgetProps) {
	if (!SITE_KEY) return null

	return (
		<div style={{display: 'flex', justifyContent: 'center'}}>
			<Turnstile
				siteKey={SITE_KEY}
				onSuccess={onSuccess}
				onError={onError}
				onExpire={onExpire}
				options={{theme: 'auto'}}
			/>
		</div>
	)
}
