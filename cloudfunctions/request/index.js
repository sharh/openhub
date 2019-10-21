// 云函数入口文件
const cheerio = require('cheerio')
const request = require('request-promise')
const getCollection = require('./db.js').getCollection ;
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
      console.log(item.attribs, item.data)
      users.push({
        avatar: item.firstChild.attribs[ 'src' ],
        id: item.attribs['data-hovercard-url'].replace('/hovercards?user_id=', '')
      })
    })
    console.log(users)
    articles.push({
      title: $title.text().replace(/^(\s*)|(\s*)$/gim, ''),
      desc: $desc.text().replace(/^(\s*)|(\s*)$/gim, ''),
      language: $lang.text().replace(/^(\s*)|(\s*)$/gim, ''),
      totalStar: $star.text().replace(/^(\s*)|(\s*)$/gim, ''),
      fork: $fork.text().replace(/^(\s*)|(\s*)$/gim, ''),
      users: users,
      typeStar: $typeStar.text().replace(/^(\s*)|(\s*)$/gim, '')
    })
    console.log(el.attribs, el.data)
    // .find('.h3.lh-condensed')
    // let item = $(el)
  })
  return articles;
}
// loadHtml('https://github.com/trending/javascript?since=weekly')
// 云函数入口函数
exports.main = async (event, context) => {
  let { lang, since, type, date } = event;
  const trending = getCollection('trending');
  let result = await trending.where({
    lang,
    since,
    type,
    date
  }).limit(1).get()
  if (!result || !result.data|| !result.data.length) {
    result = await loadGitHubTrendingHtml(lang, since)
    if (result) {
      await trending.add({
        // data 字段表示需新增的 JSON 数据
        data: result
      })
    }
  }
  return result
}