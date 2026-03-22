import {spawnSync} from 'node:child_process'
import {readFile} from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(process.cwd())
const rawArgs = process.argv.slice(2)
const shouldShowHelp = rawArgs.includes('--help')
const isDryRun = rawArgs.includes('--dry-run')

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: repoRoot,
		encoding: 'utf8',
		stdio: options.stdio ?? 'inherit',
		windowsHide: true,
	})

	if (result.error) {
		throw new Error(String(result.error.message || result.error))
	}

	if (result.status !== 0) {
		process.exit(result.status ?? 1)
	}
}

function incrementPatchVersion(version) {
	const match = /^(\d+)\.(\d+)\.(\d+)(.*)?$/.exec(version)

	if (!match) {
		throw new Error(
			`Unable to calculate a patch release version from "${version}".`,
		)
	}

	const [, major, minor, patch, suffix = ''] = match
	return `${major}.${minor}.${Number(patch) + 1}${suffix}`
}

async function getPlannedPatchVersion() {
	const packageJson = JSON.parse(
		await readFile(path.join(repoRoot, 'package.json'), 'utf8'),
	)

	if (
		typeof packageJson.version !== 'string' ||
		packageJson.version.length === 0
	) {
		throw new Error('package.json is missing a valid version.')
	}

	return incrementPatchVersion(packageJson.version)
}

async function main() {
	if (shouldShowHelp) {
		run('bun', ['./scripts/release.mjs', '--help'])
		return
	}

	if (isDryRun) {
		const plannedVersion = await getPlannedPatchVersion()
		console.log(`[release] dry-run: bun pm version patch -> v${plannedVersion}`)
		run('bun', [
			'./scripts/release.mjs',
			...rawArgs,
			'--version',
			plannedVersion,
			'--expect-version-tag',
		])
		return
	}

	run('bun', ['pm', 'version', 'patch'])
	run('bun', ['./scripts/release.mjs', ...rawArgs, '--expect-version-tag'])
}

main().catch(error => {
	console.error(
		'[release] Failed:',
		error instanceof Error ? error.message : error,
	)
	process.exit(1)
})
