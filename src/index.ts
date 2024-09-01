import { Input, Telegraf, TelegramError } from "telegraf"
import { message } from "telegraf/filters"
import type { InputFile, InputMediaAudio, InputMediaPhoto, InputMediaVideo } from "telegraf/types"

import { Logger } from "tslog"

import { getFiles } from "@/utils"

///

const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

///

const logger = new Logger()

const bot = new Telegraf(Bun.env.TELEGRAF_TOKEN)
bot.start((ctx) => {
  ctx.replyWithPhoto(Input.fromLocalFile("assets/ctb_banner.png"), {
    caption: "<b>cobalt.tools</b> is new and probaly fastest way for people to download videos, photos and etc. from internet.\n\nI'm not an official addition to their website, it was made by some enthuasist to stop opening website over and over, that also helps sharing memes, videos and other \"important\" stuff to our friends!\n\nIt's pretty much easy to start using this bot, just send your links in chat with this bot, and it will respond with video <b>WITHOUT</b> any problems like paywalls, sub-to-use and other crappy unnecessary things.\n\n<a href=\"https://t.me/shckpst\">Support</a> • <a href=\"https://github.com/xoderton/telegram-downloader\">Source Code</a>",
    parse_mode: "HTML"
  })
})

///

bot.on(message("text"), async (ctx) => {
  const urls = ctx.message.text.matchAll(URL_REGEX)
  if (urls == null) return

  const [files, source] = await getFiles(urls)

  const images = files.filter(url =>
    url.match(/(jpg|png|webp|svg)/gi))
  const videos = files.filter((url, index) =>
    url.match(/(mp4|webm|mkv)/gi) || (url.includes("imput.net/api/stream") && (source[index] && !source[index].includes("soundcloud"))))
  const audios = files.filter((url, index) =>
    url.match(/(mp3|ogg|wav)/gi) || (source[index] && source[index].includes("soundcloud")))

  const mediaGroup: [{ type: "photo" | "video" | "audio", media: InputFile | string }?] = []

  for (const image of images) { mediaGroup.push({ type: "photo", media: image }) }
  for (const video of videos) { mediaGroup.push({ type: "video", media: Input.fromURLStream(video) }) }
  for (const audio of audios) { mediaGroup.push({ type: "audio", media: Input.fromURLStream(audio) }) }

  if (mediaGroup.length < 1) return

  ctx.replyWithMediaGroup(mediaGroup as unknown as (InputMediaAudio[] | InputMediaPhoto[] | InputMediaVideo[]), {
    reply_parameters: {
      message_id: ctx.message.message_id
    }
  }).catch((err: TelegramError) => {
      if (err.code == 413)
        ctx.reply(`cobalt.tools successfully extracted video from all of your links, but we couldn't send it, since Telegram limits bots up to 50MiB filesize when uploading directly to their servers, sorry!`, {
          reply_parameters: {
            message_id: ctx.message.message_id
          }
        })
    })
})

///

bot.catch((err) => { logger.error(err) })
bot.launch()

///

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))