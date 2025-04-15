import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CommentsSection() {
  // Define the common glass background style
  const GLASS_BG = "bg-gradient-to-br from-gray-800/70 to-gray-900/80 border-gray-700/60 backdrop-blur-sm shadow-lg";
  
  return (
    <Card className={GLASS_BG}>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Bình luận</h2>
        <div className="space-y-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <textarea 
              className="w-full bg-transparent border-none text-white placeholder-gray-400 resize-none focus:ring-0 focus:outline-none" 
              placeholder="Viết bình luận..."
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center text-sm text-gray-300">
                <input type="checkbox" className="mr-2 rounded bg-gray-600 border-gray-500" />
                Ẩn nội dung spoil
              </label>
              <Button 
                variant="default" size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-gray-900"
              >
                Gửi
              </Button>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm py-4">
            Chưa có bình luận nào
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
