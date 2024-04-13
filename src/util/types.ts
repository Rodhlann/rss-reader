export type Post = {
  title: string;
  link: string;
  pubDate: string;
};

export type Category = 'code' | 'tech' | 'ocean'

export type Feed = {
  title: string;
  posts: Post[];
  category: Category
};