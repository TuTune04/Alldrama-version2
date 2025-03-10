import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Movie } from './Movie';
import { Genre } from './Genre';

@Table({
  tableName: 'movies_genres',
  timestamps: false
})
export class MoviesGenre extends Model {
  @ForeignKey(() => Movie)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  movieId!: number;

  @ForeignKey(() => Genre)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  genreId!: number;

  // Relationships
  @BelongsTo(() => Movie)
  movie!: Movie;

  @BelongsTo(() => Genre)
  genre!: Genre;
} 