import { Input, Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import type { InputMediaAudio, InputMediaPhoto, InputMediaVideo } from "telegraf/types"

import { Logger } from "tslog"

import { getFiles } from "./utils"

///

const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

///

const logger = new Logger()

const bot = new Telegraf(Bun.env.TELEGRAF_TOKEN)
bot.start((ctx) => ctx.reply("I can download multiple links from your messages, but some of them might be unsupported, send to test it!"))
bot.help((ctx) => ctx.reply("I can download multiple links from your messages, but some of them might be unsupported, send to test it!"))

///

bot.on(message("text"), async (ctx) => {
  const urls = ctx.message.text.matchAll(URL_REGEX)
  if (urls == null) return

  const [files, source] = await getFiles(urls)

  const images = files.filter(url =>
    url.match(/(jpg|png|webp|svg)/gi))
  const videos = files.filter((url, index) =>
    url.match(/(mp4|webm|mkv)/gi) || (url.includes("olly.imput.net/api/stream") && !source[index].includes("soundcloud")))
  const audios = files.filter((url, index) =>
    url.match(/(mp3|ogg|wav)/gi) || source[index].includes("soundcloud"))

  if (images.length >= 1) {
    const mediaGroup = []
    for (const image of images) { mediaGroup.push({ type: "photo", media: image }) }

    ctx.replyWithMediaGroup(mediaGroup as unknown as InputMediaPhoto[])
      .catch((err: Error) => logger.error(err))
  }

  if (videos.length >= 1) {
    const mediaGroup = []
    for (const video of videos) { mediaGroup.push({ type: "video", media: Input.fromURLStream(video) }) }

    ctx.replyWithMediaGroup(mediaGroup as unknown as InputMediaVideo[])
      .catch((err: Error) => logger.error(err))
  }

  if (audios.length >= 1) {
    const mediaGroup = []
    for (const audio of audios) { mediaGroup.push({ type: "audio", media: Input.fromURLStream(audio) }) }

    ctx.replyWithMediaGroup(mediaGroup as unknown as InputMediaAudio[])
      .catch((err: Error) => logger.error(err))
  }
})

///

bot.launch()

///

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))

process.on("uncaughtException", (exception) => logger.error(exception.stack))
process.on("unhandledRejection", () => { /* nothing! */ })