
const cheerio = require('cheerio')
const moment = require('moment');
const fs = require('fs')
const request = require('request-promise')
const mp = require('./mp.js')

const dates = [ 'daily', 'weekly', 'monthly' ]
let langs;
if (typeof langs) {
  try {
    langs = fs.readFileSync('langs')
    langs = JSON.parse(langs)
  } catch (e) {}
}

async function loadGitHubTrendingHtml (language='', since='daily') {
  // console.log(url)
  body = await request({
    url: `https://github.com/trending/${language}?since=${since}`,
    gzip: true,
    headers: {
      'Host': 'github.com',
      'Accept-Language': 'zh-CN,zh;q=0.9,ko;q=0.8,zh-TW;q=0.7',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    }
  })
  const $ = cheerio.load(body)
  let articles = [];
  $('article').each((index, el) => {
    
    let $title = $('.h3.lh-condensed', $(el))
    let $desc = $('.col-9.text-gray.my-1.pr-4', $(el))
    let $footer = $('.f6.text-gray.mt-2', $(el))
    let $lang = $footer.find('[itemprop="programmingLanguage"]')
    let $star = $footer.find('[aria-label="star"]').parent()
    let $fork = $footer.find('[aria-label="fork"]').parent()
    let $users = $footer.find('[data-hovercard-type="user"]')
    let $typeStar = $footer.find('.d-inline-block.float-sm-right')
    let users = []
    $users.each((_index, item) => {
      // console.log(item.attribs, item.data)
      users.push({
        avatar: item.firstChild.attribs[ 'src' ],
        id: item.attribs['data-hovercard-url'].replace('/hovercards?user_id=', '')
      })
    })
    // console.log(users)
    articles.push({
      title: $title.text().replace(/^(\s*)|(\s*)$/gim, ''),
      desc: $desc.text().replace(/^(\s*)|(\s*)$/gim, ''),
      language: $lang.text().replace(/^(\s*)|(\s*)$/gim, ''),
      totalStar: $star.text().replace(/^(\s*)|(\s*)$/gim, ''),
      fork: $fork.text().replace(/^(\s*)|(\s*)$/gim, ''),
      users: users,
      typeStar: $typeStar.text().replace(/^(\s*)|(\s*)$/gim, '')
    })
    // console.log(el.attribs, el.data)
    // .find('.h3.lh-condensed')
    // let item = $(el)
  })
  if (!langs || !langs.length) {
    langs = []
    $('.select-menu-item').each((_index, el) => {
      langs.push($(el).text().replace(/^(\s*)|(\s*)$/gim, ''))
    })
    langs.length = 100;
    let res = await mp.databaseoperate('databaseadd', `
      db.collection("conditions").add({
        data: {
          type: ${JSON.stringify("language")},
          data: ${JSON.stringify(langs)}
        }
      })
    `)
    console.log(res)

    fs.writeFileSync('langs', JSON.stringify(langs))
  }
  return articles;
}

async function initTrending(lang, since) {
  try {
    let body = await loadGitHubTrendingHtml(lang, since)
    let record = await mp.databaseoperate('databasequery', `
    db.collection("trending").where({
      lang: ${JSON.stringify(lang || "")},
      since: ${JSON.stringify(since || 'daily')},
      date: ${JSON.stringify(moment().format('YYYY-MM-DD'))}
    }).limit(1).get()
    `)
    let { pager, data } = record || {};
    if (data && data.length) {
      let item = data[ 0 ]
      if (item && typeof item === 'string') {
        item = JSON.parse(item)
        let res = await mp.databaseoperate('databaseupdate', `
          db.collection("trending").doc(${JSON.stringify(item._id)}).set({
            data: {
              lang: ${JSON.stringify(lang || "")},
              since: ${JSON.stringify(since || "daily")},
              date: ${JSON.stringify(moment().format('YYYY-MM-DD'))},
              data: ${JSON.stringify(body)}
            }
          })
        `)
        console.log(res);
        return
      }
    }
    let res = await mp.databaseoperate('databaseadd', `
      db.collection("trending").add({
        data: {
          lang: ${JSON.stringify(lang || "")},
          since: ${JSON.stringify(since || "daily")},
          date: ${JSON.stringify(moment().format('YYYY-MM-DD'))},
          data: ${JSON.stringify(body)}
        }
      })
    `)
    console.log(res);
  } catch (error) {
    console.log(error);
  }
  
}
module.exports = {
  initTrending
}
