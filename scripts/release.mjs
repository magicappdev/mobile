import {spawnSync} from 'node:child_process'
import {readFile} from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(process.cwd())
const args = new Set(process.argv.slice(2))
const isDevRelease = args.has('--dev')
const isDryRun = args.has('--dry-run')
const shouldSkipBuild = args.has('--skip-build')

if (args.has('--help')) {
	console.log(`Usage: bun ./scripts/release.mjs [options]

Options:
  --dev        Create a dev tag in the form v<version>_dev
  --dry-run    Print the actions without changing git state
  --skip-build Skip the build step before staging/committing
  --help       Show this help message
`)
	process.exit(0)
}

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: repoRoot,
		encoding: 'utf8',
		stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
		windowsHide: true,
	})

	if (result.error) {
		throw new Error(String(result.error.message || result.error))
	}

	if (result.status !== 0) {
		const message =
			result.stderr?.trim() || result.stdout?.trim() || 'Command failed.'
		throw new Error(`${command} ${args.join(' ')}\n${message}`)
	}

	return (result.stdout || '').trim()
}

function runAllowFailure(command, args) {
	const result = spawnSync(command, args, {
		cwd: repoRoot,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
		windowsHide: true,
	})

	if (result.error || result.status !== 0) {
		return ''
	}

	return (result.stdout || '').trim()
}

function normalizePath(value) {
	return path.normalize(value)
}

function logPlannedAction(message) {
	console.log(`[release] dry-run: ${message}`)
}

function getRemote(branch) {
	const configuredRemote =
		runAllowFailure('git', [
			'config',
			'--get',
			`branch.${branch}.pushRemote`,
		]) ||
		runAllowFailure('git', ['config', '--get', 'remote.pushDefault']) ||
		runAllowFailure('git', ['config', '--get', `branch.${branch}.remote`])

	if (configuredRemote) {
		return configuredRemote
	}

	return run('git', ['remote'])
		.split(/\r?\n/)
		.map(entry => entry.trim())
		.find(Boolean)
}

async function main() {
	const packageJson = JSON.parse(
		await readFile(path.join(repoRoot, 'package.json'), 'utf8'),
	)
	const version = packageJson.version

	if (typeof version !== 'string' || version.length === 0) {
		throw new Error('package.json is missing a valid version.')
	}

	const gitRoot = normalizePath(run('git', ['rev-parse', '--show-toplevel']))
	if (gitRoot !== normalizePath(repoRoot)) {
		throw new Error(
			[
				'This release script only runs from the standalone apps/mobile repository root.',
				`Current directory: ${repoRoot}`,
				`Git root: ${gitRoot}`,
				'Run it from the standalone mobile repo checkout so commits and tags are pushed from that repo.',
			].join('\n'),
		)
	}

	const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
	if (!branch || branch === 'HEAD') {
		throw new Error('Release requires a checked out branch.')
	}

	const remote = getRemote(branch)
	if (!remote) {
		throw new Error('No git remote is configured for this repository.')
	}

	if (args.has('--dev')) {
		const tagName = `v${version}${isDevRelease ? '_dev' : ''}`
		if (runAllowFailure('git', ['tag', '-l', tagName]) === tagName) {
			throw new Error(`Tag ${tagName} already exists locally.`)
		}
	} else {
		console.log(
			'No tag creation needed since bun pm version already created a new version tag.',
		)
	}

	if (
		runAllowFailure('git', [
			'ls-remote',
			'--tags',
			remote,
			`refs/tags/${tagName}`,
		])
	) {
		throw new Error(`Tag ${tagName} already exists on remote ${remote}.`)
	}

	if (!shouldSkipBuild) {
		if (isDryRun) {
			logPlannedAction('bun run build')
		} else {
			run('bun', ['run', 'build'], {stdio: 'inherit'})
		}
	}

	const status = run('git', ['status', '--porcelain'])
	if (status) {
		if (isDryRun) {
			logPlannedAction('git add -A')
			logPlannedAction(`git commit -m "chore(release): ${tagName}"`)
		} else {
			run('git', ['add', '-A'], {stdio: 'inherit'})
			run('git', ['commit', '-m', `chore(release): ${tagName}`], {
				stdio: 'inherit',
			})
		}
	}

	if (isDryRun) {
		logPlannedAction(`git tag -a ${tagName} -m "Release ${tagName}"`)
		logPlannedAction(`git push ${remote} ${branch}`)
		logPlannedAction(`git push ${remote} ${tagName}`)
	} else {
		run('git', ['tag', '-a', tagName, '-m', `Release ${tagName}`], {
			stdio: 'inherit',
		})
		run('git', ['push', remote, branch], {stdio: 'inherit'})
		run('git', ['push', remote, tagName], {stdio: 'inherit'})
	}

	console.log(
		[
			`${isDryRun ? 'Planned release' : 'Released'} ${tagName}`,
			`Version: ${version}`,
			`Branch: ${branch}`,
			`Remote: ${remote}`,
			shouldSkipBuild
				? 'Build step skipped.'
				: 'Build step completed before tagging.',
			status
				? 'Committed local changes before tagging.'
				: 'No local changes to commit; tagged the current HEAD.',
		].join('\n'),
	)
}

main().catch(error => {
	console.error(
		'[release] Failed:',
		error instanceof Error ? error.message : error,
	)
	process.exit(1)
})
