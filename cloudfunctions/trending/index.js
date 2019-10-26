// 云函数入口文件
const cheerio = require('cheerio')
const request = require('request-promise')
const getCollection = require('./db.js').getCollection ;
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
  fs.writeFileSync('html.html', body)
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
        apiRepo: `https://api.github.com/users${item.attribs[ 'src' ]}`,
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
    console.log(el.attribs, el.data)
    // .find('.h3.lh-condensed')
    // let item = $(el)
  })
  console.log(articles)
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
  fs.writeFileSync('html.html', body)
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
function formatDate(date) {
  date = new Date(date);
  if (date.toString() === 'Invalid Date') {
    date = new Date();
  }
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  return y + '-' + (m < 10 ? '0'+m : m) + '-'+ (d < 10 ? '0'+d : d);
}
// loadHtml('https://github.com/trending/javascript?since=weekly')
// 云函数入口函数
exports.main = async (event, context) => {
  let { lang, since, type, date } = event;
  date = formatDate(date)
  const trending = getCollection('trending');
  let result = await trending.where({
    lang,
    since,
    type,
    date
  }).limit(1).get()
  if (!result || !result.data|| !result.data.length) {
    result = type === 'repositories' ? await loadGitHubRepTrendingHtml(lang, since) : await loadGitHubDevTrendingHtml(lang, since)
  }
  return result
}