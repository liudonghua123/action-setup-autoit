import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import {exec} from '@actions/exec'
import {promises as fs} from 'fs'

async function install(url: string, fileName: string): Promise<number> {
  core.info(`Begin install program from ${url}`)
  const program = await tc.downloadTool(url)
  core.info(`Got download achieve: ${program}`)
  fs.rename(program, fileName)
  core.info('Starting install!')
  const exitCode = await exec(`.\\"${fileName}"`, [`/S`, `/f`])
  core.info(`install exitCode: ${exitCode}!`)
  return exitCode
}

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
    const installedLocation = String.raw`${installation_location}\AutoIt3`
    const cacheKey = `autoit-v3.3-${process.platform}-${installedLocation}`
    core.info(`cache.restoreCache([${installedLocation}], ${cacheKey})`)
    const restoreCode = await cache.restoreCache([installedLocation], cacheKey)
    if (restoreCode) {
      core.info(`cache.restoreCache hits! result: ${restoreCode}`)
    } else {
      core.info(`cache.restoreCache miss!`)
      // // extract the prepared autoit achieve (resources\AutoIt3.zip)
      // // download the achieve
      // const autoIt3Achieve = await tc.downloadTool(
      //   'https://github.com/liudonghua123/action-setup-autoit/raw/main/resources/AutoIt3.zip'
      // )
      // core.info(`Got download achieve: ${autoIt3Achieve}!`)
      // core.info('Starting autoIt install!')
      // await tc.extractZip(autoIt3Achieve, installation_location)

      // const exitCode = await exec(String.raw`"C:\Program Files\7-Zip\7z.exe"`, [
      //   `x`,
      //   String.raw`resources\AutoIt3.zip`,
      //   String.raw`-o${installation_location}`
      // ])
      // core.info(`extract exitCode: ${exitCode}!`)
      // if (exitCode !== 0) {
      //   return core.setFailed(`extract AutoIt3.zip failed!`)
      // }
      core.info(`Install autoit-v3-setup.exe sliently`)
      let exitCode = await install(
        `https://www.autoitscript.com/files/autoit3/autoit-v3-setup.exe`,
        `autoit-v3-setup.exe`
      )
      core.info(`Install autoit-v3-setup.exe exitCode: ${exitCode}!`)
      if (exitCode !== 0) {
        return core.setFailed(
          `Install autoit-v3-setup.exe failed with ${exitCode}`
        )
      }
      core.info(`Install SciTE4AutoIt3.exe sliently`)
      exitCode = await install(
        `https://www.autoitscript.com/autoit3/scite/download/SciTE4AutoIt3.exe`,
        `SciTE4AutoIt3.exe`
      )
      core.info(`Install SciTE4AutoIt3.exe exitCode: ${exitCode}!`)
      if (exitCode !== 0) {
        return core.setFailed(
          `Install SciTE4AutoIt3.exe failed with ${exitCode}`
        )
      }
      // try to fix Au3Stripper.dat missing... Please get it from the website to make sure the Au3Stripper will work correctly.
      const au3StripperAchieve = await tc.downloadTool(
        'https://www.autoitscript.com/autoit3/scite/download/Au3Stripper.zip'
      )
      core.info(`Got download achieve: ${au3StripperAchieve}!`)
      core.info('Starting autoIt install!')
      await fs.rmdir(
        String.raw`C:\Program Files (x86)\AutoIt3\SciTE\au3Stripper`,
        {recursive: true}
      )
      await tc.extractZip(
        au3StripperAchieve,
        String.raw`C:\Program Files (x86)\AutoIt3\SciTE\au3Stripper`
      )

      try {
        core.info(`Saving cache: ${cacheKey}`)
        core.info(`cache.saveCache([${installedLocation}], ${cacheKey})`)
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
