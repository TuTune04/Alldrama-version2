import express, { Request, Response } from 'express';
import * as commentController from '../controllers/commentController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID của bình luận
 *         movieId:
 *           type: integer
 *           description: ID của phim
 *         userId:
 *           type: integer
 *           description: ID của người dùng
 *         userName:
 *           type: string
 *           description: Tên người dùng
 *         comment:
 *           type: string
 *           description: Nội dung bình luận
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/comments/movies/{movieId}:
 *   get:
 *     summary: Lấy danh sách bình luận cho một phim
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của phim
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng bình luận trên mỗi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Trường sắp xếp
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get('/movies/:movieId', optionalAuth, async (req: Request, res: Response) => {
  await commentController.getMovieComments(req, res);
});

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Lấy chi tiết bình luận
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Không tìm thấy bình luận
 */
router.get('/:id', async (req: Request, res: Response) => {
  await commentController.getCommentById(req, res);
});

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Tạo bình luận mới
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - comment
 *             properties:
 *               movieId:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo bình luận thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy phim hoặc người dùng
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  await commentController.createComment(req, res);
});

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Cập nhật bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật bình luận thành công
 *       400:
 *         description: Nội dung bình luận không được để trống
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền sửa bình luận này
 *       404:
 *         description: Không tìm thấy bình luận
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  await commentController.updateComment(req, res);
});

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Xóa bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Xóa bình luận thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xóa bình luận này
 *       404:
 *         description: Không tìm thấy bình luận
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  await commentController.deleteComment(req, res);
});

export default router; 