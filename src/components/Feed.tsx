import React, { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import RecentOrganizations from './RecentOrganizations';
import { PostCreationDialog } from './PostCreationDialog';
import { StoriesBar } from './stories/StoriesBar';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import FeedLevelBar from './FeedLevelBar';
import AdBanner from './AdBanner';

  interface Post {
    id: string;
    content: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    user_id: string;
    media_urls: string[] | null;
    profiles: {
      name: string;
      avatar_url: string | null;
      user_type: string;
    };
  }

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            name,
            avatar_url,
            user_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full py-2 space-y-2">
      {/* Level Progress */}
      <FeedLevelBar />
      <AdBanner placement="feed" />

      {/* Stories */}
      <StoriesBar />

      {/* Recently Added Organizations */}
      <RecentOrganizations />
      
      {/* Create Post */}
      <div className="bg-card rounded-lg shadow-sm p-3 border border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.avatar_url} alt="User avatar" />
            <AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <PostCreationDialog
            trigger={
              <Button variant="outline" className="w-full justify-start text-muted-foreground font-normal rounded-full h-10 hover:bg-muted">
                What's on your mind?
              </Button>
            }
            onPostCreated={fetchPosts}
            userAvatar={currentUser?.avatar_url}
            userName={currentUser?.name}
          />
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                author: {
                  name: post.profiles.name,
                  avatar: post.profiles.avatar_url || '/placeholder.svg',
                  id: post.user_id,
                  user_type: post.profiles.user_type,
                },
                content: post.content,
                timestamp: post.created_at,
                likes: post.likes_count,
                comments: post.comments_count,
                shares: 0,
                media_urls: post.media_urls,
                user_id: post.user_id,
              }}
              onUpdate={fetchPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
