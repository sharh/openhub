# 小程序版github

基于小程序云开发

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## 功能点：

- 1、排行榜，支持天/周/月筛选，由于语言有太多了，所以没有支持语言选择
- 2、搜索，目前只支持搜索仓库
- 3、个人中心，支持登录github，使用的是outh-api，能够fork和star仓库
- 4、支持查看项目，可以查看项目的文件

## 云开发的几点

1、api函数，是用来请求github的api，这个需要设置云函数的超时，加到最大20s，因为github的接口返回比较慢

2、获取github排行榜，用的是定时器+cheerio来获取的，定时器用于每隔一个小时获取一下github的`https://github.com/trending`，因为此块没有看到github提供api，只能抓取到html，通过cheerio解析，然后转换成json数据，存入云数据库

> 当然你也可以通过小程序提供的服务器接口，来定时同步数据，这样就不受小程序云函数20s的限制了

其他就是一些简单的UI布局了，整体来说还是写前端代码比较繁琐耗时
