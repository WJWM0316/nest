import { Controller, Post, Get, Req, Res, Next } from '@nestjs/common';
import { FormulaService } from './formula.service';

@Controller('nodeApi/formula')
export class FormulaController {
  constructor(private readonly appService: FormulaService) {}
  @Post()
  formulaFun(@Req() req, @Res() res, @Next() next): string {
    return this.appService.formulaFun(req, res);
  }
}
