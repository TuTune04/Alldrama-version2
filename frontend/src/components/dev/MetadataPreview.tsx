'use client';

import { useState } from 'react';
import { Movie } from '@/types';
import { generateMovieMetadata, generateEpisodeMetadata, generateSearchMetadata } from '@/lib/metadata';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock movie data for testing
const mockMovie: Movie = {
  id: 1,
  title: "Phim Hay Nhất 2024",
  rating: 8.5,
  views: 150000,
  summary: "Một bộ phim tuyệt vời với cốt truyện hấp dẫn và diễn xuất xuất sắc. Đây là câu chuyện về tình yêu, gia đình và những giá trị nhân văn sâu sắc.",
  duration: 120,
  totalEpisodes: 16,
  releaseYear: 2024,
  posterUrl: "https://example.com/poster.jpg",
  trailerUrl: "https://example.com/trailer.mp4",
  playlistUrl: "https://example.com/playlist.m3u8",
  backdropUrl: "https://example.com/backdrop.jpg",
  genres: [
    { id: 1, name: "Tình cảm" },
    { id: 2, name: "Gia đình" }
  ]
};

interface MetadataPreviewProps {
  className?: string;
}

export default function MetadataPreview({ className }: MetadataPreviewProps) {
  const [activeTab, setActiveTab] = useState('movie');
  const [searchQuery, setSearchQuery] = useState('phim hay');
  const [searchGenre, setSearchGenre] = useState('Tình cảm');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeTitle, setEpisodeTitle] = useState('Tập đầu tiên');

  // Generate metadata based on active tab
  const getMetadata = () => {
    switch (activeTab) {
      case 'movie':
        return generateMovieMetadata(mockMovie);
      case 'episode':
        return generateEpisodeMetadata(mockMovie, episodeNumber, episodeTitle);
      case 'search':
        return generateSearchMetadata(searchQuery, searchGenre);
      default:
        return generateMovieMetadata(mockMovie);
    }
  };

  const metadata = getMetadata();

  // Extract Open Graph data
  const ogData = metadata.openGraph as any;
  const twitterData = metadata.twitter as any;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy vào clipboard!');
  };

  const testUrls = {
    facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(window.location.origin)}`,
    twitter: `https://cards-dev.twitter.com/validator`,
    linkedin: `https://www.linkedin.com/post-inspector/`,
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className={`p-6 bg-gray-900 text-white ${className}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Metadata Preview Tool</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movie">Movie Detail</TabsTrigger>
            <TabsTrigger value="episode">Episode</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>
          
          <TabsContent value="movie" className="space-y-4">
            <p className="text-gray-400">Preview metadata cho trang chi tiết phim</p>
          </TabsContent>
          
          <TabsContent value="episode" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Số tập</div>
                <Input
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Tiêu đề tập</div>
                <Input
                  value={episodeTitle}
                  onChange={(e) => setEpisodeTitle(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Từ khóa tìm kiếm</div>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Thể loại</div>
                <Input
                  value={searchGenre}
                  onChange={(e) => setSearchGenre(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Social Media Preview */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Social Media Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Facebook/Discord Style */}
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-700 h-32 flex items-center justify-center">
                  {ogData?.images?.[0]?.url ? (
                    <img 
                      src={ogData.images[0].url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-3 bg-gray-800">
                  <h3 className="font-semibold text-sm text-white truncate">
                    {ogData?.title || metadata.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {ogData?.description || metadata.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ogData?.url || 'alldrama.com'}
                  </p>
                </div>
              </div>

              {/* Twitter Style */}
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-700 h-24 flex items-center justify-center">
                  {twitterData?.images?.[0] ? (
                    <img 
                      src={twitterData.images[0]} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-3 bg-gray-800">
                  <h3 className="font-semibold text-sm text-white truncate">
                    {twitterData?.title || metadata.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {twitterData?.description || metadata.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    alldrama.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Details */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Metadata Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Title</div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  {metadata.title as string}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Description</div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  {metadata.description}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Keywords</div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  {Array.isArray(metadata.keywords) 
                    ? metadata.keywords.join(', ') 
                    : metadata.keywords}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Open Graph Type</div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  {ogData?.type}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testing Tools */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Testing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.open(testUrls.facebook, '_blank')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Facebook Debugger
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(testUrls.twitter, '_blank')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Twitter Validator
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(testUrls.linkedin, '_blank')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                LinkedIn Inspector
              </Button>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={() => copyToClipboard(JSON.stringify(metadata, null, 2))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Copy Metadata JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* HTML Meta Tags Preview */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">HTML Meta Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={`<title>${metadata.title}</title>
<meta name="description" content="${metadata.description}" />
<meta property="og:title" content="${ogData?.title}" />
<meta property="og:description" content="${ogData?.description}" />
<meta property="og:type" content="${ogData?.type}" />
<meta property="og:image" content="${ogData?.images?.[0]?.url}" />
<meta name="twitter:card" content="${twitterData?.card}" />
<meta name="twitter:title" content="${twitterData?.title}" />
<meta name="twitter:description" content="${twitterData?.description}" />
<meta name="twitter:image" content="${twitterData?.images?.[0]}" />`}
              readOnly
              className="bg-gray-700 border-gray-600 text-gray-300 font-mono text-sm h-48"
            />
            <Button 
              onClick={() => copyToClipboard(`<title>${metadata.title}</title>\n<meta name="description" content="${metadata.description}" />`)}
              className="mt-2 bg-green-600 hover:bg-green-700"
            >
              Copy HTML Tags
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 