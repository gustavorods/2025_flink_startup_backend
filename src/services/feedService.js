const userModel = require("../models/userModel");
const timeLineModel = require("../models/timeLineModel");

async function gerarFeed(userId, limit = 10) {

  const seguidos = await userModel.getSeguidos(userId);
  // console.log(`User ${userId} is following:`, seguidos);

  if (seguidos.length === 0) return [];

  const posts = await timeLineModel.getPostsByUserIds(seguidos, limit);
  // console.log(`Posts for user ${userId}:`, posts);

  return posts;
}

module.exports = { gerarFeed };