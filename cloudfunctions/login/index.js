// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”
const cheerio = require('cheerio')
const axios = require('axios')
const request = require('request')
async function loadHtml (url) {
  console.log(url)
  try {
    
    request({
      url,
      gzip: true,
      headers: {
        'Host': 'github.com',
        'Accept-Language': 'zh-CN,zh;q=0.9,ko;q=0.8,zh-TW;q=0.7',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
      },
      callback: function (err, res, body) {
        // console.log(err, body, res)
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
        console.log(articles)
      }
    })
  } catch (e) {
    console.log(e)
  }
  // $('h2').addClass('welcome')

  // $.html()
}
loadHtml('https://github.com/trending/javascript?since=weekly')
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  console.log(event)
  console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
