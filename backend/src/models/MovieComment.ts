import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from './User';
import { Movie } from './Movie';

@Table({
  tableName: 'movie_comments',
  timestamps: true
})
export class MovieComment extends Model {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  userName!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  comment!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Relationships
  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Movie)
  movie!: Movie;
} 