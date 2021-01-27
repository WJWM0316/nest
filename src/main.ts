import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

import * as path from 'path';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3000;
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // 自定义跨域中间件
  var allowCors = function(req, res, next) {
    if (process.env.NODE_ENV !== 'dev') {
      res.header("Access-Control-Allow-Origin", req.headers.origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", 'Express');
    next()
  };
  app.use(allowCors)

  // 访问频率限制
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 500, // 限制15分钟内最多只能访问500次
    }),
  );

  //配置静态资源目录
  app.useStaticAssets(path.join(__dirname, '..', 'public'));

  // Web漏洞的
  app.use(helmet());


  await app.listen(PORT);
}
bootstrap().catch(e => Logger.error('错误', e));
