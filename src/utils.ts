import type { APIResponse, FunctionResult } from "@/types"

export async function getFiles(urls: IterableIterator<RegExpMatchArray>): Promise<FunctionResult> {
  const files: string[] = []
  const source: string[] = []

  for (const url of urls) {
    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url[0],
        filenamePattern: "pretty",
      })
    })

    const body: APIResponse = await response.json()
    source.push(url[0])

    if (body.status == "picker")
      body.picker.forEach(data => files.push(data.url))
    if (body.status.match(/(rate-limit|error)/))
      return { files: [], source: [], error: { code: "error.api.generic" } }

    if (body.status.match(/(redirect|stream|sucess)/gi))
      files.push(body.url)
  }

  return { files, source }
}