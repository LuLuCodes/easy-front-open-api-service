import { ResponseCode } from '@config/global';
interface SignJsonData {
  [key: string]: any;
}

export function transArrayToObject(ary, key) {
  const obj = {};
  for (const item of ary) {
    obj[item[key]] = {
      ...item,
    };
  }
  return obj;
}

export function sortAsc(o: SignJsonData): string {
  const n: string[] = [];
  for (const k in o) n.push(k);
  n.sort();
  let str = '';
  for (let i = 0; i < n.length; i++) {
    let v = o[n[i]];
    if (v !== '') {
      if ({}.toString.call(v) === '[object Object]') {
        v = `{${sortAsc(v)}}`;
      } else if ({}.toString.call(v) === '[object Array]') {
        let ary = '';
        for (const t of v) {
          if ({}.toString.call(t) === '[object Object]') {
            ary += `,{${sortAsc(t)}}`;
          } else {
            ary += `,${sortAsc(t)}`;
          }
        }
        v = '[' + ary.slice(1) + ']';
      }
      str += '&' + n[i] + '=' + v;
    }
  }
  return str.slice(1);
}

export function dateFormat(date: Date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds().toString().substr(0, 3), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length),
    );
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substr(('' + o[k]).length),
      );
    }
  }
  return fmt;
}

export function OkResponse(data?: any, msg = 'OK') {
  return {
    code: ResponseCode.OK,
    data,
    msg,
  };
}

export function ErrorResponse(code: ResponseCode, msg: string | Error) {
  if (typeof msg === 'string') {
    return {
      code: code,
      data: null,
      msg,
    };
  }

  return {
    code: code,
    data: null,
    msg: msg.message || JSON.stringify(msg),
  };
}

export function randomNo(len = 6) {
  let random_no = '';
  for (
    let i = 0;
    i < len;
    i++ //j位随机数，用以加在时间戳后面。
  ) {
    random_no += Math.floor(Math.random() * 10);
  }
  random_no = Date.now() + random_no;
  return random_no;
}

export function invitationCode(id) {
  const sourceString = '431EYZDOWGVJ5AQMSFCU2TBIRPN796XH0KL';

  let num = parseInt(id);

  let code = '';

  while (num > 0) {
    const mod = num % 35;

    num = (num - mod) / 35;

    code = sourceString.substr(mod, 1) + code;
  }

  code = '888888' + code; //长度不足8，前面补全

  code = code.slice(code.length - 4, code.length); //截取最后8位字符串

  return code;
}

export function await2<T, U = Error>(
  promise: Promise<T>,
  errorExt?: Record<string, unknown>,
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data]) // 执行成功，返回数组第一项为 null。第二个是结果。
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        Object.assign(err, errorExt);
      }

      return [err, undefined]; // 执行失败，返回数组第一项为错误信息，第二项为 undefined
    });
}
