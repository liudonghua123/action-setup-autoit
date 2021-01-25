import * as cache from '@actions/cache'
import * as core from '@actions/core'
import {exec} from '@actions/exec'

async function run(): Promise<void> {
  try {
    const installation_location: string = core.getInput('installation_location')
    core.debug(`Got installation_location: ${installation_location} .`)
    // check whether the platform is windows
    if (process.platform !== 'win32') {
      return core.setFailed(
        `${process.platform} is not support, only windows is support!`
      )
    }
    const installedLocation = String.raw`"${installation_location}\AutoIt3"`
    const cacheKey = `autoit3-${process.platform}-${installedLocation}`
    const restoreCode = await cache.restoreCache([installedLocation], cacheKey)
    if (restoreCode) {
      core.info('cache.restoreCache hits!')
    } else {
      // extract the prepared autoit achieve (resources\AutoIt3.zip)
      core.debug('Starting autoIt install!')
      const exitCode = await exec(String.raw`"C:\Program Files\7-Zip\7z.exe"`, [
        `x`,
        String.raw`resources\AutoIt3.zip`,
        String.raw`-o${installation_location}`
      ])
      core.debug(`extract exitCode: ${exitCode}!`)
      if (exitCode !== 0) {
        return core.setFailed(`extract AutoIt3.zip failed!`)
      }
      try {
        core.debug(`Saving cache: ${cacheKey}`)
        await cache.saveCache([installedLocation], cacheKey)
      } catch (error) {
        core.info(`Cache hit occurred on key ${cacheKey}, not saving cache.`)
      }
    }
    core.debug(`addPath: ${installedLocation}`)
    core.addPath(installedLocation)
    core.setOutput('installed_location', installedLocation)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
