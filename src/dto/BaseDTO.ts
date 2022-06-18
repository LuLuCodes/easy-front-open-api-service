import {
  IsString,
  IsInt,
  IsDateString,
  Min,
  Max,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
// import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseDTO {
  @ApiProperty({
    description: '分配给应用的AppKey',
    type: String,
  })
  @IsString({ message: 'app_key必须为字符串' })
  @IsNotEmpty({ message: 'app_key必须为非空字符串' })
  readonly app_key: string;

  @ApiPropertyOptional({
    description: '时间戳，格式为：yyyy-MM-dd HH:mm:ss',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'timestamp必须为字符串' })
  @IsNotEmpty({ message: 'timestamp必须为非空字符串' })
  @IsDateString({ strict: true }, { message: 'timestamp必须时间日期字符串' })
  readonly timestamp?: string;

  @ApiProperty({
    description: 'API协议版本，可选值：1.0',
    type: String,
  })
  @IsString({ message: 'v必须为字符串' })
  @IsNotEmpty({ message: 'v必须为非空字符串' })
  readonly v: string;

  @ApiPropertyOptional({
    description: '签名',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'sign必须为字符串' })
  @IsNotEmpty({ message: 'sign必须为非空字符串' })
  readonly sign?: string;
}

export class PagedQueryDTO extends BaseDTO {
  @ApiProperty({
    description: 'pageNum页面(1开始)',
    type: Number,
  })
  @IsInt({ message: 'pageNum必须为必须为有效整数' })
  @Min(1, { message: 'pageNum应大于等于1' })
  readonly pageNum = 1;

  @ApiProperty({
    description: 'pageSize页面(1开始)',
    type: Number,
  })
  @IsInt({ message: 'pageSize必须为必须为有效整数' })
  @Min(1, { message: 'pageSize应大于等于1' })
  @Max(100, { message: 'pageSize应小于等于100' })
  readonly pageSize = 10;
}
