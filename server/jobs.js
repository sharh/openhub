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
const mp = require('./mp.js')
const schedule = require('node-schedule');
const dates = [ 'daily', 'weekly', 'monthly' ]
let langs;
if (typeof langs === 'string') {
  try {
    langs = fs.readFileSync('langs')
    langs = JSON.parse(langs)
  } catch (e) {}
}
console.log(langs)
// 12点更新
// var j = schedule.scheduleJob('* * * * * *', async function () {
//   for ( let since of dates) {
//     await initTrending(undefined, since)
//   }
//   for (let since of dates) {
//     for (let lang of langs) {
//       await initTrending(lang, since)
//     }
//   }
// });
async function syncJob () {
  for (let since of dates) {
    await initTrending('', since, 'repositories')
    await initTrending('', since, 'developers')
  }
  // for (let since of dates) {
  //   for (let lang of langs) {
  //     await initTrending(lang, since)
  //   }
  // }
}
syncJob ()
// initTrending('', 'daily', 'developers')