/**
 * Unit tests for AuthContext OAuth deep-link handling.
 *
 * Covers:
 *  - sessionId exchange → tokens saved → navigate to /tabs/home
 *  - error parameter in URL → error state set, no navigation
 *  - direct access/refresh tokens in URL → tokens saved → navigate
 *  - all polling attempts exhausted → error state set, no navigation
 *  - cold-start deep link via App.getLaunchUrl
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {act, render, waitFor} from '@testing-library/react'
import {AuthProvider} from './AuthContext'
import React from 'react'

// ─── Hoisted mock fns (must precede vi.mock() calls) ─────────────────────────
// vi.mock() factories are hoisted to the top of the file by Vitest, so any
// variables they reference must also be hoisted via vi.hoisted().

type UrlHandler = (data: {url: string}) => void

const mockNavigate = vi.hoisted(() => vi.fn())
const mockBrowserClose = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockBrowserOpen = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockCheckOAuthSession = vi.hoisted(() => vi.fn())
const mockGetCurrentUser = vi.hoisted(() => vi.fn())
const mockSetToken = vi.hoisted(() => vi.fn())
const mockStorageGet = vi.hoisted(() => vi.fn().mockResolvedValue(null))
const mockStorageSet = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockStorageRemove = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockGetLaunchUrl = vi.hoisted(() => vi.fn().mockResolvedValue(null))
// Mutable container so the captured listener can be read in tests
const listenerState = vi.hoisted(() => ({current: null as UrlHandler | null}))

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('./NavigationContext', () => ({
	useNavigation: () => ({navigate: mockNavigate}),
}))

vi.mock('@capacitor/app', () => ({
	App: {
		addListener: vi.fn((event: string, handler: UrlHandler) => {
			if (event === 'appUrlOpen') listenerState.current = handler
			return Promise.resolve({remove: vi.fn()})
		}),
		getLaunchUrl: mockGetLaunchUrl,
	},
}))

vi.mock('@capacitor/browser', () => ({
	Browser: {open: mockBrowserOpen, close: mockBrowserClose},
}))

vi.mock('../lib/api', () => ({
	api: {
		setToken: mockSetToken,
		getCurrentUser: mockGetCurrentUser,
		checkOAuthSession: mockCheckOAuthSession,
		logout: vi.fn().mockResolvedValue(undefined),
		refresh: vi.fn().mockRejectedValue(new Error('no refresh token')),
		login: vi.fn(),
		register: vi.fn(),
	},
}))

vi.mock('../lib/storage', () => ({
	storage: {
		getItem: mockStorageGet,
		setItem: mockStorageSet,
		removeItem: mockStorageRemove,
	},
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TEST_USER = {id: 'u1', email: 'test@example.com', name: 'Tester'}

function renderAuth() {
	return render(
		<AuthProvider>
			<span data-testid="child" />
		</AuthProvider>,
	)
}

/**
 * Fire the captured appUrlOpen callback, then advance fake time far enough to
 * cover every setTimeout inside handleDeepLink and saveTokens:
 *   - saveTokens success path:  500 ms
 *   - OAuth polling retries:    up to 5 × 1 500 ms = 7 500 ms
 *
 * WHY no act() around the listener call:
 * React 18's concurrent scheduler dead-locks inside act() when the entire
 * async chain completes via microtasks with no fake-timer checkpoint.  The
 * rejection path (getCurrentUser rejects before saveTokens' 500 ms delay) is
 * exactly that case — act() waits for a MessageChannel render that never fires
 * under fake timers, causing a 5 s timeout.
 *
 * FIX: fire the listener outside act(), then drain the microtask queue one
 * tick at a time (20 rounds of `await Promise.resolve()` is well beyond the
 * deepest real chain of ~7–8 ticks).  Timer-based suspensions (polling retries,
 * the 500 ms saveTokens delay) are then fired by advanceTimersByTimeAsync, and
 * a final empty act() flushes any accumulated React renders.
 */
async function triggerDeepLink(url: string) {
	expect(
		listenerState.current,
		'App.addListener must have been called',
	).not.toBeNull()

	// Fire directly — no act() wrapper to avoid the MessageChannel deadlock.
	listenerState.current!({url})

	// Drain the microtask queue one tick at a time.  Each `await Promise.resolve()`
	// yields once so pending Promise continuations in handleDeepLink can run.
	// 20 ticks covers checkOAuthSession → saveTokens → storage×2 → getCurrentUser
	// → catch → fallthrough error section.
	for (let i = 0; i < 20; i++) {
		await Promise.resolve()
	}

	// Advance fake time to fire any setTimeout-based suspensions that remain:
	//   saveTokens success delay   500 ms
	//   OAuth polling retries   5 × 1 500 ms = 7 500 ms
	await vi.advanceTimersByTimeAsync(9_000)

	// Flush any pending React state updates accumulated above.
	await act(async () => {})
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('AuthContext – handleDeepLink (appUrlOpen)', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		listenerState.current = null

		// Default: no stored session, no cold-start URL
		mockStorageGet.mockResolvedValue(null)
		mockGetLaunchUrl.mockResolvedValue(null)
		mockGetCurrentUser.mockResolvedValue(TEST_USER)

		vi.spyOn(console, 'log').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.clearAllMocks()
		vi.useRealTimers()
	})

	// ─ sessionId success path ──────────────────────────────────────────────

	it('exchanges sessionId for tokens and navigates to /tabs/home', async () => {
		mockCheckOAuthSession.mockResolvedValueOnce({
			success: true,
			data: {accessToken: 'acc-token', refreshToken: 'ref-token'},
		})

		renderAuth()

		await triggerDeepLink('magicappdev://auth/callback?sessionId=sess-abc')

		expect(mockCheckOAuthSession).toHaveBeenCalledWith('sess-abc')
		expect(mockStorageSet).toHaveBeenCalledWith('access_token', 'acc-token')
		expect(mockStorageSet).toHaveBeenCalledWith('refresh_token', 'ref-token')
		expect(mockSetToken).toHaveBeenCalledWith('acc-token')
		expect(mockNavigate).toHaveBeenCalledWith('/tabs/home')
		expect(mockBrowserClose).toHaveBeenCalled()
	})

	it('retries on the second attempt when first checkOAuthSession returns not-found', async () => {
		mockCheckOAuthSession
			.mockResolvedValueOnce({success: false, error: {message: 'not found'}})
			.mockResolvedValueOnce({
				success: true,
				data: {accessToken: 'retry-acc', refreshToken: 'retry-ref'},
			})

		renderAuth()

		await triggerDeepLink('magicappdev://auth/callback?sessionId=sess-retry')

		expect(mockCheckOAuthSession).toHaveBeenCalledTimes(2)
		expect(mockStorageSet).toHaveBeenCalledWith('access_token', 'retry-acc')
		expect(mockNavigate).toHaveBeenCalledWith('/tabs/home')
	})

	// ─ error in URL ────────────────────────────────────────────────────────

	it('does not call checkOAuthSession when error param is in the URL', async () => {
		renderAuth()

		await triggerDeepLink('magicappdev://auth/callback?error=access_denied')

		expect(mockCheckOAuthSession).not.toHaveBeenCalled()
		expect(mockStorageSet).not.toHaveBeenCalled()
		expect(mockNavigate).not.toHaveBeenCalledWith('/tabs/home')
		expect(mockBrowserClose).not.toHaveBeenCalled()
	})

	// ─ direct token fallback path ─────────────────────────────────────────

	it('saves direct tokens from URL when no sessionId is present', async () => {
		renderAuth()

		await triggerDeepLink(
			'magicappdev://auth/callback?accessToken=direct-acc&refreshToken=direct-ref',
		)

		expect(mockCheckOAuthSession).not.toHaveBeenCalled()
		expect(mockStorageSet).toHaveBeenCalledWith('access_token', 'direct-acc')
		expect(mockStorageSet).toHaveBeenCalledWith('refresh_token', 'direct-ref')
		expect(mockNavigate).toHaveBeenCalledWith('/tabs/home')
	})

	it('also accepts snake_case direct token params', async () => {
		renderAuth()

		await triggerDeepLink(
			'magicappdev://auth/callback?access_token=snake-acc&refresh_token=snake-ref',
		)

		expect(mockStorageSet).toHaveBeenCalledWith('access_token', 'snake-acc')
		expect(mockStorageSet).toHaveBeenCalledWith('refresh_token', 'snake-ref')
		expect(mockNavigate).toHaveBeenCalledWith('/tabs/home')
	})

	// ─ polling exhaustion ─────────────────────────────────────────────────

	it('exhausts all 5 polling attempts and does not navigate when session never arrives', async () => {
		mockCheckOAuthSession.mockResolvedValue({
			success: false,
			error: {message: 'session not found'},
		})

		renderAuth()

		await triggerDeepLink('magicappdev://auth/callback?sessionId=bad-sess')

		expect(mockCheckOAuthSession).toHaveBeenCalledTimes(5)
		expect(mockStorageSet).not.toHaveBeenCalled()
		expect(mockNavigate).not.toHaveBeenCalledWith('/tabs/home')
		expect(mockBrowserClose).not.toHaveBeenCalled()
	})

	it('exhausts all 5 attempts and does not navigate when checkOAuthSession throws each time', async () => {
		mockCheckOAuthSession.mockRejectedValue(new Error('network error'))

		renderAuth()

		await triggerDeepLink('magicappdev://auth/callback?sessionId=err-sess')

		expect(mockCheckOAuthSession).toHaveBeenCalledTimes(5)
		expect(mockNavigate).not.toHaveBeenCalledWith('/tabs/home')
	})

	// ─ URL is not an auth callback ────────────────────────────────────────

	it('ignores deep links that are not auth callbacks', async () => {
		renderAuth()

		await triggerDeepLink('magicappdev://some/other/path?foo=bar')

		expect(mockCheckOAuthSession).not.toHaveBeenCalled()
		expect(mockStorageSet).not.toHaveBeenCalled()
		expect(mockNavigate).not.toHaveBeenCalledWith('/tabs/home')
	})

	// ─ cold-start (App.getLaunchUrl) ──────────────────────────────────────

	it('handles cold-start deep link with sessionId via App.getLaunchUrl', async () => {
		mockGetLaunchUrl.mockResolvedValueOnce({
			url: 'magicappdev://auth/callback?sessionId=cold-sess',
		})
		mockCheckOAuthSession.mockResolvedValueOnce({
			success: true,
			data: {accessToken: 'cold-acc', refreshToken: 'cold-ref'},
		})

		renderAuth()

		// Advance all timers so initialize() → getLaunchUrl → handleDeepLink runs
		await act(async () => {
			await vi.runAllTimersAsync()
		})

		expect(mockCheckOAuthSession).toHaveBeenCalledWith('cold-sess')
		expect(mockStorageSet).toHaveBeenCalledWith('access_token', 'cold-acc')
		expect(mockStorageSet).toHaveBeenCalledWith('refresh_token', 'cold-ref')
		expect(mockNavigate).toHaveBeenCalledWith('/tabs/home')
	})

	// ─ saveTokens failure ─────────────────────────────────────────────────

	it('does not navigate when getCurrentUser rejects after token save', async () => {
		// The rejection path (getCurrentUser rejects before saveTokens' 500 ms
		// delay) has NO fake-timer checkpoints.  React 18's act() dead-locks when
		// the whole chain completes via microtasks with fake timers active because
		// MessageChannel (React's scheduler) is never faked.
		//
		// Fix: switch to real timers for this test and fire the listener directly.
		// Real timers let React's scheduler settle normally.  The console.error spy
		// from beforeEach silences the "update not wrapped in act()" warning.
		vi.useRealTimers()

		mockCheckOAuthSession.mockResolvedValueOnce({
			success: true,
			data: {accessToken: 'bad-acc', refreshToken: 'bad-ref'},
		})
		mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'))

		renderAuth()

		expect(listenerState.current).not.toBeNull()
		listenerState.current!({
			url: 'magicappdev://auth/callback?sessionId=user-fail-sess',
		})

		// Drain the microtask queue — the rejection chain is ~7 ticks deep.
		for (let i = 0; i < 20; i++) await Promise.resolve()

		expect(mockCheckOAuthSession).toHaveBeenCalledWith('user-fail-sess')
		// Tokens were stored but user fetch failed → no navigation
		await waitFor(() => {
			expect(mockNavigate).not.toHaveBeenCalledWith('/tabs/home')
		})
	})
})
