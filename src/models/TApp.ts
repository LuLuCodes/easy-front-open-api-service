import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Sequelize,
  ForeignKey,
} from 'sequelize-typescript';

@Table({
  tableName: 't_app',
  timestamps: false,
  comment: '\u4E09\u65B9app\u6E20\u9053\u8868',
})
export class TApp extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.BIGINT,
    comment: '\u7CFB\u7EDF\u7F16\u7801',
  })
  @Index({ name: 'PRIMARY', using: 'BTREE', order: 'ASC', unique: true })
  id?: number;

  @Column({
    type: DataType.STRING(500),
    comment: '\u4E09\u65B9\u6E20\u9053\u540D\u79F0',
  })
  app_name!: string;

  @Column({
    type: DataType.STRING(50),
    comment: '\u4E09\u65B9\u6E20\u9053APPKEY',
  })
  @Index({ name: 'app_key', using: 'BTREE', order: 'ASC', unique: true })
  app_key!: string;

  @Column({
    type: DataType.STRING(64),
    comment: '\u4E09\u65B9\u6E20\u9053APPSECRET',
  })
  app_secret!: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    comment: '\u6388\u6743\u8FC7\u671F\u65F6\u95F4',
  })
  expire_time?: Date;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment:
      '\u5D4C\u5165\u65B9\u5F0F\uFF081\u793C\u9047\u5C0F\u7A0B\u5E8F 2open_api\uFF09',
  })
  app_mode?: number;

  @Column({
    allowNull: true,
    type: DataType.STRING(500),
    comment: '\u5546\u54C1\u540C\u6B65\u63A5\u6536\u5730\u5740',
  })
  goods_update_callback_url?: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(500),
    comment: '\u8BA2\u5355\u540C\u6B65\u63A5\u6536\u5730\u5740',
  })
  order_update_callback_url?: string;

  @Column({
    type: DataType.DECIMAL(18, 2),
    comment: '\u4E09\u65B9\u6E20\u9053\u5269\u4F59\u8D44\u91D1',
    defaultValue: '0.00',
  })
  amount?: string;

  @Column({
    type: DataType.TINYINT,
    comment: '0 \u53EF\u7528, 1 \u7981\u7528',
    defaultValue: '0',
  })
  status?: number;

  @Column({
    type: DataType.TINYINT,
    comment: '\u662F\u5426\u903B\u8F91\u5220\u9664 1:\u5DF2\u5220\u9664',
    defaultValue: '0',
  })
  deleted?: number;

  @Column({ type: DataType.DATE, comment: '\u521B\u5EFA\u65F6\u95F4' })
  create_time!: Date;

  @Column({ type: DataType.DATE, comment: '\u66F4\u65B0\u65F6\u95F4' })
  update_time!: Date;

  @Column({ type: DataType.BIGINT, comment: '\u521B\u5EFA\u4EBA' })
  creator_id!: number;

  @Column({ type: DataType.BIGINT, comment: '\u4FEE\u6539\u4EBA' })
  modifier_id!: number;
}
