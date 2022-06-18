/*
 * @Author: qian.qing@aliyun.com
 * @Date: 2020-08-12 15:33:20
 * @LastEditors: qian.qing@aliyun.com
 * @LastEditTime: 2020-08-12 15:33:20
 * @Description: Log4js 工具函数 & 实例化
 */

import * as Path from 'path';
import * as Log4js from 'log4js';
import * as Util from 'util';
import * as dayjs from 'dayjs';
import * as StackTrace from 'stacktrace-js';
import * as Chalk from 'chalk';
import config from '@config/log4js';

export enum LoggerLevel {
  ALL = 'ALL',
  MARK = 'MARK',
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
  OFF = 'OFF',
}

export class ContextTrace {
  constructor(
    public readonly context: string,
    public readonly path?: string,
    public readonly lineNumber?: number,
    public readonly columnNumber?: number,
  ) {}
}

Log4js.addLayout('Awesome-nest', (logConfig: any) => {
  return (logEvent: Log4js.LoggingEvent): string => {
    let moduleName = '';
    let position = '';

    const messageList: string[] = [];
    logEvent.data.forEach((value: any) => {
      if (value instanceof ContextTrace) {
        moduleName = value.context;
        if (value.lineNumber && value.columnNumber) {
          position = `${value.lineNumber}, ${value.columnNumber}`;
        }
        return;
      }

      if (typeof value !== 'string') {
        value = Util.inspect(value, false, 3, true);
      }

      messageList.push(value);
    });

    const messageOutput: string = messageList.join(' ');
    const positionOutput: string = position ? ` [${position}]` : '';
    const typeOutput = `[${logConfig.type}] ${logEvent.pid.toString()}   - `;
    const dateOutput = `${dayjs(logEvent.startTime).format(
      'YYYY-MM-DD HH:mm:ss',
    )}`;
    const moduleOutput: string = moduleName
      ? `[${moduleName}] `
      : '[LoggerService] ';
    let levelOutput = `[${logEvent.level}] ${messageOutput}`;

    switch (logEvent.level.toString()) {
      case LoggerLevel.DEBUG:
        levelOutput = Chalk.green(levelOutput);
        break;
      case LoggerLevel.INFO:
        levelOutput = Chalk.cyan(levelOutput);
        break;
      case LoggerLevel.WARN:
        levelOutput = Chalk.yellow(levelOutput);
        break;
      case LoggerLevel.ERROR:
        levelOutput = Chalk.red(levelOutput);
        break;
      case LoggerLevel.FATAL:
        levelOutput = Chalk.hex('#DD4C35')(levelOutput);
        break;
      default:
        levelOutput = Chalk.grey(levelOutput);
        break;
    }

    return `${Chalk.green(typeOutput)}${dateOutput}  ${Chalk.yellow(
      moduleOutput,
    )}${levelOutput}${positionOutput}`;
  };
});

Log4js.configure(config);

export class LoggerFactory {
  private static loggerMap = new Map();

  public static getInstance(category = 'default', level = LoggerLevel.TRACE) {
    const key = { category, level };
    const has = LoggerFactory.loggerMap.has(key);
    if (has) {
      return LoggerFactory.loggerMap.get(key);
    }
    const logger = new Logger(category, level);
    LoggerFactory.loggerMap.set(key, logger);
    return logger;
  }
}
export class Logger {
  private logger;
  constructor(category = 'default', level = LoggerLevel.TRACE) {
    this.logger = Log4js.getLogger(category);
    this.logger.level = level;
  }
  trace(...args): void {
    this.logger.trace(Logger.getStackTrace(), ...args);
  }

  debug(...args): void {
    this.logger.debug(Logger.getStackTrace(), ...args);
  }

  log(...args): void {
    this.logger.info(Logger.getStackTrace(), ...args);
  }

  info(...args): void {
    this.logger.info(Logger.getStackTrace(), ...args);
  }

  warn(...args): void {
    this.logger.warn(Logger.getStackTrace(), ...args);
  }

  error(...args): void {
    this.logger.error(Logger.getStackTrace(), ...args);
  }

  fatal(...args): void {
    this.logger.fatal(Logger.getStackTrace(), ...args);
  }

  static getStackTrace(deep = 2): string {
    const stackList: StackTrace.StackFrame[] = StackTrace.getSync();
    const stackInfo: StackTrace.StackFrame = stackList[deep];

    const lineNumber: number = stackInfo.lineNumber;
    const columnNumber: number = stackInfo.columnNumber;
    const fileName: string = stackInfo.fileName;
    const basename: string = Path.basename(fileName);
    return `${basename}(line: ${lineNumber}, column: ${columnNumber}): \n`;
  }
}
