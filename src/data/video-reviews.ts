export type VideoReview = {
  id: number;
  src: string;
  title: string;
};

export const videoReviews: VideoReview[] = [
  {
    id: 1,
    src: "/images/video-review/review-1.mp4",
    title: "Client video review 1",
  },
  {
    id: 2,
    src: "/images/video-review/review-2.mp4",
    title: "Client video review 2",
  },
  {
    id: 3,
    src: "/images/video-review/review-3.mp4",
    title: "Client video review 3",
  },
  {
    id: 4,
    src: "/images/video-review/review-4.mp4",
    title: "Client video review 4",
  },
  {
    id: 5,
    src: "/images/video-review/review-5.mp4",
    title: "Client video review 5",
  },
];

/** Desktop theater: review-1 center, 2+3 left, 4+5 right */
export const desktopVideoLayout = {
  center: 0,
  left: [1, 2],
  right: [3, 4],
} as const;
