import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { MovieComment } from './MovieComment';
import { UserFavorite } from './UserFavorite';
import { UserWatchHistory } from './UserWatchHistory';

// Định nghĩa enum cho role
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUBSCRIBER = 'subscriber'
}

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
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
  full_name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: UserRole.USER,
    validate: {
      isIn: {
        args: [[UserRole.USER, UserRole.ADMIN, UserRole.SUBSCRIBER]],
        msg: "Role must be 'user', 'admin', or 'subscriber'"
      }
    }
  })
  role!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  tokenVersion!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  subscriptionExpiredAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Relationships
  @HasMany(() => MovieComment)
  comments!: MovieComment[];

  @HasMany(() => UserFavorite)
  favorites!: UserFavorite[];

  @HasMany(() => UserWatchHistory)
  watchHistories!: UserWatchHistory[];
} 