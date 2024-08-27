export async function getFiles(urls: IterableIterator<RegExpMatchArray>) {
  const files: string[] = []
  const source: string[] = []

  for (const url of urls) {
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url[0],
        filenamePattern: 'pretty',
      })
    })

    const body = await response.json()

    source.push(url[0])

    if (body.status == "picker")
      body.picker.forEach((data: { url: string }) => files.push(data.url))

    if (!body.status.match(/(stream|redirect|success|picker)/gi))
      continue

    if (body.url != undefined)
      files.push(body.url)
  }

  return [files, source]
}