import * as cache from '@actions/cache'
import * as core from '@actions/core'
import {exec} from '@actions/exec'

async function run(): Promise<void> {
  try {
    const installation_location: string = core.getInput('installation_location')
    core.info(`Got installation_location: ${installation_location} .`)
    // check whether the platform is windows
    if (process.platform !== 'win32') {
      return core.setFailed(
        `${process.platform} is not support, only windows is support!`
      )
    }
    const installedLocation = String.raw`"${installation_location}\AutoIt3"`
    const cacheKey = `${process.platform}-autoit3-${installedLocation}`
    core.info(`cache.restoreCache([{${installedLocation}}], ${cacheKey})`)
    const restoreCode = await cache.restoreCache([installedLocation], cacheKey)
    if (restoreCode) {
      core.info(`cache.restoreCache hits! result: ${restoreCode}`)
    } else {
      core.info(`cache.restoreCache miss!`)
      // extract the prepared autoit achieve (resources\AutoIt3.zip)
      core.info('Starting autoIt install!')
      const exitCode = await exec(String.raw`"C:\Program Files\7-Zip\7z.exe"`, [
        `x`,
        String.raw`resources\AutoIt3.zip`,
        String.raw`-o${installation_location}`
      ])
      core.info(`extract exitCode: ${exitCode}!`)
      if (exitCode !== 0) {
        return core.setFailed(`extract AutoIt3.zip failed!`)
      }
      try {
        core.info(`Saving cache: ${cacheKey}`)
        core.info(`cache.saveCache([{${installedLocation}}], ${cacheKey})`)
        const saveCacheResult = await cache.saveCache(
          [installedLocation],
          cacheKey
        )
        core.info(`Saving cache result: ${saveCacheResult}`)
      } catch (error) {
        core.info(`Cache hit occurred on key ${cacheKey}, not saving cache.`)
      }
    }
    core.info(`addPath: ${installedLocation}`)
    core.addPath(installedLocation)
    core.setOutput('installed_location', installedLocation)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
