const crypto = require('crypto');
const dayjs = require('dayjs');
const { Kit } = require('@easy-front-core-sdk/kits');

function md5(data) {
  return hash(data, 'md5');
}

function hash(data, algorithm) {
  return crypto.createHash(algorithm).update(data, 'utf8').digest('hex');
}

const app_key = 'EGHWOICE';
const app_secret = '310c4453d7cb492b95f89703b22ef95f';

const base_body = {
  app_key,
  timestamp: '2022-01-07 17:58:35',
  v: '1.0',
};

const data_body = {
  text: '文本示例',
};

const reqeust_body = { ...base_body, ...data_body };
const sort_str = Kit.makeSortStr(reqeust_body, ['sign']);
console.log(sort_str);
console.log(`${app_secret}${sort_str}${app_secret}`);
reqeust_body.sign = md5(`${app_secret}${sort_str}${app_secret}`).toUpperCase();
console.log(JSON.stringify(reqeust_body));
