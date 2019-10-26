const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

function getCollection(name) {
  return db.collection('trending');
}

module.exports = {
  getCollection
}