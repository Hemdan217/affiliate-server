const generator = ({ length, isNumeric = false }) => {
  let code = isNumeric ? '123456789' : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let finalStr = '';
  for (let i = 0; i < length; i++) {
    finalStr += code[Math.floor(Math.random() * code.length)];
  }
  return finalStr;
}

module.exports = {
  generator
}