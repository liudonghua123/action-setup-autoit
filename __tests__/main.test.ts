import {existsSync} from 'fs'

test('test 7z exists', async () => {
  await expect(existsSync(String.raw`C:\Program Files\7-Zip\7z.exe`)).toBe(true)
})
