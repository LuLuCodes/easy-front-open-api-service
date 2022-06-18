export enum ResponseCode {
  OK = 0,
  PARM_ERROR = 1000,
  SIGN_ERROR = 1001,
  SYS_ERROR = 9999,
  UNKOWN_ERROR = 10000,
}

export enum CacheKey {
  APP_KEY_SET = 'app_key_set', // 访问者App Key集合
  APP_KEY_INFO_HASH = 'app_key_info_hash', // App Key 详细信息
  APP_KEY_EXPIRE_TIME = 'app_key_expire_time', // App Key 过期时间
  APP_KEY_SECRET = 'app_key_secret', // App Key Secret
  APP_GOODS_UPDATE_CB = 'app_goods_update_cb', // 商品同步接收地址
  APP_ORDER_UPDATE_CB = 'app_order_update_cb', //订单同步接收地址
  APP_STATUS = 'app_status', // 0 可用, 1 禁用
  APP_KEY_IP_WHITE_SET = 'app_key_ip_white_set', // App Key Secret
}

export enum APIVersion {
  V1 = '1.0',
  V2 = '2.0',
}

export enum LockKey {
  ORDER_LOCK = 'ORDER_LOCK',
}
