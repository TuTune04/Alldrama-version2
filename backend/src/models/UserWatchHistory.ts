import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from './User';
import { Movie } from './Movie';
import { Episode } from './Episode';

@Table({
  tableName: 'user_watch_histories',
  timestamps: true
})
export class UserWatchHistory extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @ForeignKey(() => Movie)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  movieId!: number;

  @ForeignKey(() => Episode)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  episodeId!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  watchedAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Relationships
  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Movie)
  movie!: Movie;

  @BelongsTo(() => Episode)
  episode!: Episode;
} 