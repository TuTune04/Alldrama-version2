import { Table, Column, Model, DataType, HasMany, BelongsToMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Episode } from './Episode';
import { MovieComment } from './MovieComment';
import { UserFavorite } from './UserFavorite';
import { UserWatchHistory } from './UserWatchHistory';
import { MoviesGenre } from './MoviesGenre';
import { Genre } from './Genre';

@Table({
  tableName: 'movies',
  timestamps: true
})
export class Movie extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.DECIMAL(3, 1),
    defaultValue: 0
  })
  rating!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  views!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  summary!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  duration!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  totalEpisodes!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  releaseYear!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  posterUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  trailerUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  playlistUrl!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Relationships
  @HasMany(() => Episode)
  episodes!: Episode[];

  @HasMany(() => MovieComment)
  comments!: MovieComment[];

  @HasMany(() => UserFavorite)
  favorites!: UserFavorite[];

  @HasMany(() => UserWatchHistory)
  watchHistories!: UserWatchHistory[];

  @BelongsToMany(() => Genre, () => MoviesGenre)
  genres!: Genre[];
} 