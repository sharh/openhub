// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const cheerio = require('cheerio')
const moment = require('moment');
// const fs = require('fs')
const request = require('request-promise')
const dates = [ 'daily', 'weekly', 'monthly' ]
// 云存储不能传转义字符，需要对转义字符再转义一遍
function filterString(str) {
  return str.replace(/^(\s*)|(\s*)$/gim, '').replace(/\\/gim, '\\\\');
}

async function loadGitHubRepTrendingHtml (language='', since='daily') {
  console.log('loadGitHubRepTrendingHtml',language, since)
  body = await request({
    url: `https://github.com/trending/${language}?since=${since}`,
    gzip: true,
    jar: true,
    headers: {
      'Origin': 'https://github.com',
      'Referer': 'https://github.com/',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
    }
  })
  // fs.writeFileSync('html.html', body)
  const $ = cheerio.load(body)
  let articles = [];
  $('article.Box-row').each((index, el) => {
    
    let $title = $('.h3.lh-condensed', $(el))
    let $desc = $('.col-9.text-gray.my-1.pr-4', $(el))
    let $footer = $('.f6.text-gray.mt-2', $(el))
    let $lang = $footer.find('[itemprop="programmingLanguage"]')
    let $langColor = $footer.find('.repo-language-color')
    let $star = $footer.find('[aria-label="star"]').parent('.mr-3')
    let $fork = $footer.find('[aria-label="repo-forked"]').parent()
    let $users = $footer.find('[data-hovercard-type="user"]')
    let $typeStar = $footer.find('.d-inline-block.float-sm-right')
    let users = []
    $users.each((_index, item) => {
      // console.log(item.attribs, item.data)
      users.push({
        avatar: item.firstChild.attribs[ 'src' ],
        repo: item.attribs[ 'src' ],
        apiRepo: `https://api.github.com/users${item.attribs[ 'href' ]}`,
        id: item.attribs['data-hovercard-url'].replace('/hovercards?user_id=', '')
      })
    })
    // console.log(users)
    articles.push({
      repo: $title.find('a').attr('href'),
      apiRepo: `https://api.github.com/repos${$title.find('a').attr('href')}`,
      title: filterString($title.text().replace(/^(\s*)|(\s*)$/gim, '')),
      desc: filterString($desc.text().replace(/^(\s*)|(\s*)$/gim, '')),
      language: filterString($lang.text().replace(/^(\s*)|(\s*)$/gim, '')),
      languageColor: filterString($langColor.attr('style') || ''),
      totalStar: filterString($star.text().replace(/^(\s*)|(\s*)$/gim, '')),
      fork: filterString($fork.text().replace(/^(\s*)|(\s*)$/gim, '')),
      users: users,
      typeStar: filterString($typeStar.text().replace(/^(\s*)|(\s*)$/gim,''))
    })
    // console.log(el.attribs, el.data)
    // .find('.h3.lh-condensed')
    // let item = $(el)
  })
  // console.log(articles)
  return articles;
}
async function loadGitHubDevTrendingHtml (language='', since='daily') {
  console.log('loadGitHubDevTrendingHtml',language, since)
  body = await request({
    url: `https://github.com/trending/developers/${language}?since=${since}`,
    gzip: true,
    headers: {
      'Host': 'github.com',
      'Accept-Language': 'zh-CN,zh;q=0.9,ko;q=0.8,zh-TW;q=0.7',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
    }
  })
  // fs.writeFileSync('html.html', body)
  const $ = cheerio.load(body)
  let articles = [];
  $('article.Box-row').each((index, el) => {
    
    let $name = $('.h3.lh-condensed', $(el))
    let $account = $('.f4.text-normal.mb-1', $(el))
    let $avatar = $('.mx-3 .d-inline-block', $(el))
    let $popularRepo = $('article', $(el))
    articles.push({
      name: filterString($name.text().replace(/^(\s*)|(\s*)$/gim, '')),
      account: filterString($account.text().replace(/^(\s*)|(\s*)$/gim, '')),
      repo: $name.find('a').attr('href'),
      apiRepo: `https://api.github.com/users${$name.find('a').attr('href')}`,
      avatar: $avatar[0].firstChild.attribs[ 'src' ],
      popularRepo: {
        title: filterString($popularRepo.find('.h4.lh-condensed').text().replace(/^(\s*)|(\s*)$/gim, '')),
        repo: $popularRepo.find('a').attr('href'),
        apiRepo: `https://api.github.com/repos${$popularRepo.find('a').attr('href')}`,
        desc: filterString($popularRepo.find('.f6.text-gray.mt-1').text().replace(/^(\s*)|(\s*)$/gim, ''))
      }
    })
  })
  return articles;
}

async function loadGitHubTrendingHtml(lang, since, type) {
  if (type === 'repositories') {
    return await loadGitHubRepTrendingHtml(lang, since)
  } else {
    return await loadGitHubDevTrendingHtml(lang, since)
  }
}

async function initTrending (lang, since, type = "repositories") {
  lang = lang || ''
  // console.log(lang, since, type)
  try {
    let body = await loadGitHubTrendingHtml(lang, since, type)
    if (!body || !body.length) {
      return
    }
    // console.log(body)
    let record = await db.collection("trending").where({
      lang: lang || "",
      since: since || 'daily',
      type: type || 'repositories',
      date: moment().format('YYYY-MM-DD')
    }).limit(1).get()
    let { pager, data } = record || {};
    if (data && data.length) {
      let item = data[ 0 ]
      if (item) {
        let res = await db.collection("trending").doc(item._id).set({
          data: {
            lang: lang || "",
            type: type || 'repositories',
            since: since || "daily",
            date: moment().format('YYYY-MM-DD'),
            data: body
          }
        })
        return res
      }
    }
    let res = await db.collection("trending").add({
      data: {
        lang: lang || "",
        type: type || 'repositories',
        since: since || "daily",
        date: moment().format('YYYY-MM-DD'),
        data: body
      }
    })
    console.log(res);
  } catch (error) {
    console.log(error);
  }
  
}
// loadGitHubRepTrendingHtml()
// loadGitHubRepTrendingHtml()
// 云函数入口函数
exports.main = async (event, context) => {
  for (let since of dates) {
    await initTrending('', since, 'repositories')
    await initTrending('', since, 'developers')
  }
  return
}