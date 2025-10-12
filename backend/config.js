module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/todos?retryWrites=true&w=majority',
  PORT: process.env.PORT || 3000
};
