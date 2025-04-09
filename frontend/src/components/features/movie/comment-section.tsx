'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, ThumbsUp, Reply } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mockComments, getMovieComments } from '@/mocks'
import type { Comment } from '@/types'

interface CommentSectionProps {
  movieId: string
}

const CommentSection = ({ movieId }: CommentSectionProps) => {
  // Get comments specific to this movie
  const movieComments = getMovieComments(movieId).comments || mockComments.slice(0, 3)
  const [comment, setComment] = useState('')
  const [displayedComments, setDisplayedComments] = useState<Comment[]>(movieComments.slice(0, 3))
  const [showAllComments, setShowAllComments] = useState(false)

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would send this to an API
    if (comment.trim()) {
      console.log('Submitting comment:', comment)
      setComment('')
    }
  }

  const loadMoreComments = () => {
    setDisplayedComments(movieComments)
    setShowAllComments(true)
  }

  // Format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="bg-card/50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-primary" />
        Bình luận ({movieComments.length})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleCommentSubmit} className="mb-6">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src="/images/placeholder-user.jpg" alt="Your profile" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-grow relative">
            <textarea
              className="w-full rounded-xl p-3 pr-12 bg-background border border-border resize-none min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Viết bình luận của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute bottom-3 right-3 h-8 w-8 rounded-full"
              disabled={!comment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {displayedComments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src="/images/placeholder-user.jpg" alt={comment.user?.name || 'User'} />
              <AvatarFallback>{(comment.user?.name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-background p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{comment.user?.name || 'Anonymous'}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm mb-2">{comment.content}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>0</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Reply className="h-3.5 w-3.5" />
                    <span>Trả lời</span>
                  </button>
                </div>
              </div>

              {/* Nested replies if any */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ml-4 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="/images/placeholder-user.jpg" alt={reply.user?.name || 'User'} />
                        <AvatarFallback>{(reply.user?.name || 'U').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-background p-3 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-sm">{reply.user?.name || 'Anonymous'}</h5>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs mb-1">{reply.content}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <ThumbsUp className="h-3 w-3" />
                            <span>0</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {!showAllComments && movieComments.length > 3 && (
        <Button 
          variant="outline" 
          className="w-full mt-6" 
          onClick={loadMoreComments}
        >
          Xem thêm bình luận ({movieComments.length - 3})
        </Button>
      )}
    </div>
  )
}

export default CommentSection 