import {spawnSync} from 'node:child_process'
import {readFile} from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(process.cwd())
const rawArgs = process.argv.slice(2)
const args = new Set()
let versionOverride = null

for (let index = 0; index < rawArgs.length; index += 1) {
	const argument = rawArgs[index]

	if (argument === '--version') {
		const nextValue = rawArgs[index + 1]
		if (!nextValue) {
			throw new Error('Missing value for --version.')
		}
		versionOverride = nextValue
		index += 1
		continue
	}

	args.add(argument)
}

const isDevRelease = args.has('--dev')
const isDryRun = args.has('--dry-run')
const shouldSkipBuild = args.has('--skip-build')
const expectsVersionTag = args.has('--expect-version-tag')

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

function hasStagedChanges() {
	const result = spawnSync('git', ['diff', '--cached', '--quiet'], {
		cwd: repoRoot,
		windowsHide: true,
	})

	return result.status === 1
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
	const version = versionOverride ?? packageJson.version

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

	const tagName = `v${version}${isDevRelease ? '_dev' : ''}`
	const localTagExists =
		runAllowFailure('git', ['tag', '-l', tagName]) === tagName
	let shouldCreateTag = isDevRelease

	if (isDevRelease) {
		if (localTagExists) {
			throw new Error(`Tag ${tagName} already exists locally.`)
		}
	} else if (expectsVersionTag) {
		if (localTagExists) {
			console.log(
				`[release] Reusing version tag ${tagName} created by bun pm version patch.`,
			)
		} else if (isDryRun) {
			console.log(
				`[release] dry-run: assuming bun pm version patch will create ${tagName}.`,
			)
		} else {
			throw new Error(
				`Expected version tag ${tagName} to exist after bun pm version patch.`,
			)
		}
		shouldCreateTag = false
	} else {
		shouldCreateTag = !localTagExists
		if (localTagExists) {
			console.log(`[release] Reusing existing local tag ${tagName}.`)
		}
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

	let committedChanges = false
	if (isDryRun) {
		const status = run('git', ['status', '--porcelain'])
		if (status) {
			logPlannedAction('git add -A')
			logPlannedAction(`git commit -m "chore(release): ${tagName}"`)
			committedChanges = true
		}
	} else {
		run('git', ['add', '-A'], {stdio: 'inherit'})
		if (hasStagedChanges()) {
			committedChanges = true
			run('git', ['commit', '-m', `chore(release): ${tagName}`], {
				stdio: 'inherit',
			})
		}
	}

	if (isDryRun) {
		if (shouldCreateTag) {
			logPlannedAction(`git tag -a ${tagName} -m "Release ${tagName}"`)
		} else {
			logPlannedAction(`reuse existing local tag ${tagName}`)
		}
		logPlannedAction(`git push ${remote} ${branch}`)
		logPlannedAction(`git push ${remote} ${tagName}`)
	} else {
		if (shouldCreateTag) {
			run('git', ['tag', '-a', tagName, '-m', `Release ${tagName}`], {
				stdio: 'inherit',
			})
		}
		run('git', ['push', remote, branch], {stdio: 'inherit'})
		run('git', ['push', remote, tagName], {stdio: 'inherit'})
	}

	console.log(
		[
			`${isDryRun ? 'Planned release' : 'Released'} ${tagName}`,
			`Version: ${version}`,
			`Branch: ${branch}`,
			`Remote: ${remote}`,
			shouldCreateTag
				? `${isDryRun ? 'Would create' : 'Created'} a new release tag.`
				: `${isDryRun ? 'Would reuse' : 'Reused'} the existing local tag.`,
			shouldSkipBuild
				? 'Build step skipped.'
				: 'Build step completed before tagging.',
			committedChanges
				? 'Committed local changes before tagging.'
				: shouldCreateTag
					? 'No local changes to commit; tagged the current HEAD.'
					: 'No local changes to commit; pushed the existing tag target.',
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
