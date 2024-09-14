type APIStatus = "error" | "redirect" | "stream" | "success" | "rate-limit" | "picker"
type APIPickerType = "video" | "photo" | "gif"

type APIPicker = {
  /**
   * used only if pickerType is various
   *
   * variables: video / photo / gif
   */
  type: APIPickerType
  /**
   * variables: direct link to a file or a link to cobalt's live render
   */
  url: string
  /**
   * used for video and gif types
   *
   * variables: item thumbnail that's displayed in the picker
   */
  thumb: string
}

export type APIResponse = {
  /**
   * error / redirect / stream / success / rate-limit / picker
   */
  status: APIStatus
  /**
   * various text, mostly used for errors
   */
  text: string
  /**
   * direct link to a file or a link to cobalt's live render
   */
  url: string
  /**
   * direct link to a file or a link to cobalt's live render
   */
  audio: string
  /**
   * various / images
   */
  pickerType: "various" | "images"
  /**
   * array of picker items
   */
  picker: APIPicker[]
}

export type FunctionResult = {
  /**
   * mainly provided from cobalt.tools
   */
  error?: {
    /**
     * humanly readable code string
     */
    code: string
  }
  /**
   * url to file array
   */
  files: string[]
  /**
   * url to url array
   */
  source: string[]
}