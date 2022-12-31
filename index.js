#!/usr/bin/env node

const { existsSync, lstatSync, readFileSync } = require('fs')
const { resolve, join, relative } = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const Koa = require('koa')
const mime = require('mime-types')
const chalk = require('chalk')
const glob = require('glob')
const { first, sortBy } = require('lodash')
const { generateDocument } = require('@nbfe/js2html')

const { argv } = yargs(hideBin(process.argv))

const app = new Koa()

const formatTime = time => {
  const dt = new Date(time)
  return [dt.toLocaleDateString(), dt.toLocaleTimeString()].join(' ')
}

const VirtualPath = [Date.now(), Math.random()].join('@')

const JsUrl = ['', VirtualPath, 'index.js'].join('/')

const getHtml = data => {
  return generateDocument({
    title: 'Static Visualizer',
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      }
    ],
    link: [
      {
        rel: 'shortcut icon',
        href: 'https://nodejs.org/static/images/favicons/favicon.ico'
      }
    ],
    headScript: [],
    style: [
      {
        text: 'body {margin: 0;}'
      }
    ],
    bodyHtml: ['<div id="app"></div>'],
    script: [
      {
        text: `window.data = ${JSON.stringify(data)}`
      },
      {
        src: JsUrl
      }
    ]
  })
}

const cwd = process.cwd()

const root = resolve(cwd, first(argv._) || '')

app.use(async ctx => {
  const time = Date.now()
  const { request } = ctx
  const { method } = request
  const url = decodeURIComponent(request.url)

  if (url === '/favicon.ico') {
    return
  }

  if (url === JsUrl) {
    ctx.type = 'application/javascript'
    ctx.body = readFileSync(resolve(__dirname, 'dist/index.js'))
    return
  }

  console.log(chalk.dim(formatTime(time)), method.padEnd(5, ' '), chalk.cyan(url))

  const absolutePath = join(root, url)

  const absolutePathHtml = [absolutePath, '.html'].join('')

  if (existsSync(absolutePathHtml)) {
    ctx.type = 'text/html'
    ctx.body = readFileSync(absolutePathHtml)
    return
  }

  if (!existsSync(absolutePath)) {
    const html = getHtml({
      code: 404,
      name: '',
      isFile: false,
      size: 0,
      mtime: 0
    })
    ctx.body = html
    return
  }

  const stats = lstatSync(absolutePath)

  if (stats.isFile()) {
    const type = mime.lookup(absolutePath)
    if (type) {
      ctx.type = type
      ctx.body = readFileSync(absolutePath)
    } else {
      ctx.body = readFileSync(absolutePath).toString()
    }
    return
  }

  if (stats.isDirectory()) {
    const indexHtml = join(absolutePath, 'index.html')
    if (existsSync(indexHtml)) {
      ctx.type = 'text/html'
      ctx.body = readFileSync(indexHtml)
      return
    }
    const files = glob.sync(`${absolutePath}/*`).map(v => {
      const stats = lstatSync(v)
      const { size, mtime } = stats
      return {
        code: 200,
        name: relative(absolutePath, v),
        isFile: stats.isFile(),
        size,
        mtime
      }
    })
    const data = {
      root,
      url,
      files: sortBy(files, v => v.isFile)
    }
    const html = getHtml(data)
    ctx.body = html
    return
  }
})

app.listen(3000)
