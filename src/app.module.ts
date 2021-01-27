import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FormulaModule } from './moudle/formula/formula.module'
import {FormulaController } from './moudle/formula/formula.controller'
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./config/${process.env.NODE_ENV}.env`,
      ignoreEnvFile:false, //忽略配置文件，为true则仅读取操作系统环境变量，常用于生产环境
      isGlobal:true //配置为全局可见，否则需要在每个模块中单独导入ConfigModule
    }),
    FormulaModule
  ],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
  }
}
