import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Movie } from './Movie';
import { UserWatchHistory } from './UserWatchHistory';

@Table({
  tableName: 'episodes',
  timestamps: true
})
export class Episode extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @ForeignKey(() => Movie)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  movieId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  episodeNumber!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  playlistUrl!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  views!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Relationships
  @BelongsTo(() => Movie)
  movie!: Movie;

  @HasMany(() => UserWatchHistory)
  watchHistories!: UserWatchHistory[];
} 