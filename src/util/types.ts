export type Feed = {
  title: string;
  posts: {
    title: string;
    link: string;
    pubDate: string;
  }[];
};