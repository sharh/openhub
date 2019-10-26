const db = wx.cloud.database()
const _ = db.command
function getDB() {
  return db;
}

function getCollection(collection) {
  return getDB().collection(collection)
}

module.exports = {
  getDB,
  getCollection
}