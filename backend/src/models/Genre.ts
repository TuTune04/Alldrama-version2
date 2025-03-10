import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { Movie } from './Movie';
import { MoviesGenre } from './MoviesGenre';

@Table({
  tableName: 'genres',
  timestamps: false
})
export class Genre extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  name!: string;

  // Relationships
  @BelongsToMany(() => Movie, () => MoviesGenre)
  movies!: Movie[];
} 