// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
const { initTrending } = require('./index.js');
const schedule = require('node-schedule');
const dates = [ 'daily', 'weekly', 'monthly' ]
let langs;
if (typeof langs) {
  try {
    langs = fs.readFileSync('langs')
    langs = JSON.parse(langs)
  } catch (e) {}
}
// 12点更新
var j = schedule.scheduleJob('* * */3 * * *', async function () {
  for ( let since of dates) {
    await initTrending(undefined, since)
  }
  for (let since of dates) {
    for (let lang of langs) {
      await initTrending(lang, since)
    }
  }
});