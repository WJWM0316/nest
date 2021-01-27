import { Controller, Get, Req, Res, Next } from '@nestjs/common';
import { FormulaService } from './formula.service';

@Controller('nodeApi/formula')
export class FormulaController {
  constructor(private readonly appService: FormulaService) {}
  @Get()
  getHello(@Req() req, @Res() res): string {
    return this.appService.getHello(req, res);
  }
}
