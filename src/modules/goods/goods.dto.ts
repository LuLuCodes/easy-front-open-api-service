import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsDateString,
  Min,
  Max,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsEnum,
  Length,
  ValidateNested,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  ArrayMinSize,
  IsEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueryDTO, BaseDTO } from '@dto/BaseDTO';

export class GetGoodsDTO extends QueryDTO {
  @ApiPropertyOptional({
    description: '商品编码',
    type: [Number],
  })
  @IsOptional()
  @ArrayMinSize(1, { message: 'id_list数组长度必须大于等于1' })
  @IsArray({ message: 'id_list必须为有效整数数组' })
  readonly id_list?: number[];
}
