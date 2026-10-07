import type { User, Post, StoryGroup, NotificationItem, ChatRoomItem } from '../types';

export const TEST_CREDENTIALS = {
  email: 'test@gmail.com',
  username: 'test',
  password: '12345',
};

export const currentUser: User = {
  id: 7,
  username: TEST_CREDENTIALS.username,
  full_name: '테스트 계정',
  email: TEST_CREDENTIALS.email,
  bio: '모든 페이지 확인용 테스트 계정입니다.\n아이디: test@gmail.com',
  website: 'https://instagram.com',
  profile_img_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  is_verified: false,
  is_private: false,
  post_count: 1,
  follower_count: 18,
  following_count: 12,
  is_following: false,
  is_self: true,
};

export const sampleUsers: Record<string, User> = {
  admin: {
    id: 1,
    username: 'admin',
    full_name: 'Instagram 관리자',
    email: 'admin@instagram.com',
    bio: 'React 18 + FastAPI 풀스택 Instagram 클론 🚀\n아름다운 인터랙티브 경험을 만듭니다 ✨',
    website: 'https://github.com/developer',
    profile_img_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    is_verified: true,
    post_count: 9,
    follower_count: 2480,
    following_count: 320,
    is_following: false,
  },
  traveler_june: {
    id: 2,
    username: 'traveler_june',
    full_name: '여행가 준',
    bio: '지구 곳곳을 유랑하는 포토그래퍼 ✈️📸\n다음 목적지는 아이슬란드 🇮🇸 | 문의: 메시지',
    website: 'https://traveler-june.blog',
    profile_img_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    is_verified: false,
    post_count: 48,
    follower_count: 8940,
    following_count: 412,
    is_following: true,
  },
  design_sarah: {
    id: 3,
    username: 'design_sarah',
    full_name: '디자이너 사라',
    bio: '서울에서 일하는 프로덕트 디자이너 ✨\n디자인 시스템, 타이포그래피, 건축을 사랑합니다 🖤',
    website: 'https://sarahdesign.io',
    profile_img_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    is_verified: true,
    post_count: 64,
    follower_count: 14200,
    following_count: 680,
    is_following: true,
  },
  foodie_min: {
    id: 4,
    username: 'foodie_min',
    full_name: '미식가 민',
    bio: '서울 숨은 골목 맛집 탐방 🍜🍷\n솔직한 내돈내산 미식 일기',
    website: 'https://instagram.com',
    profile_img_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    is_verified: false,
    post_count: 128,
    follower_count: 5300,
    following_count: 512,
    is_following: false,
  },
  art_minji: {
    id: 5,
    username: 'art_minji',
    full_name: '아티스트 민지',
    bio: '현대 유화와 혼합 매체 작업을 합니다 🎨\n다음 전시: 2026년 11월',
    website: 'https://minji-gallery.art',
    profile_img_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    is_verified: true,
    post_count: 32,
    follower_count: 21500,
    following_count: 195,
    is_following: false,
  },
  coder_kim: {
    id: 6,
    username: 'coder_kim',
    full_name: '김개발',
    bio: '프론트엔드 엔지니어 💻 커피와 깨끗한 코드를 좋아합니다 ☕',
    profile_img_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    is_verified: false,
    post_count: 19,
    follower_count: 1040,
    following_count: 280,
    is_following: false,
  }
};

export const initialPosts: Post[] = [
  {
    id: 100,
    caption: '테스트 계정으로 올린 첫 게시물입니다 👋\n홈, 탐색, 메시지, 프로필을 모두 확인해 보세요.\n#테스트 #인스타그램클론',
    location: '서울',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-10-03T10:00:00Z',
    author: {
      id: 7,
      username: 'test',
      full_name: '테스트 계정',
      profile_img_url: currentUser.profile_img_url,
      is_verified: false,
    },
    media: [
      {
        id: 1000,
        media_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      },
    ],
    like_count: 24,
    comment_count: 1,
    is_liked: false,
    is_bookmarked: true,
    recent_comments: [
      {
        id: 200,
        post_id: 100,
        user_id: 3,
        content: '테스트 계정 환영합니다! 🎉',
        created_at: '2026-10-03T10:20:00Z',
        user: {
          id: 3,
          username: 'design_sarah',
          profile_img_url: sampleUsers.design_sarah.profile_img_url,
          is_verified: true,
        },
        likes_count: 2,
        is_liked: false,
      },
    ],
  },
  {
    id: 101,
    caption: '노을이 지는 황금빛 바다에서 포착한 찰나의 순간 🌅\n파도 소리와 함께 하루를 마무리하는 중입니다. 다들 오늘 하루도 고생 많으셨어요!\n#여행 #제주도 #노을 #바다 #석양 #사진',
    location: '제주 애월',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-10-02T18:30:00Z',
    author: {
      id: 2,
      username: 'traveler_june',
      full_name: '여행가 준',
      profile_img_url: sampleUsers.traveler_june.profile_img_url,
      is_verified: false,
    },
    media: [
      {
        id: 1001,
        media_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      },
      {
        id: 1002,
        media_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1080&auto=format&fit=crop&q=80',
        order_index: 1,
        aspect_ratio: '1:1',
      },
      {
        id: 1003,
        media_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1080&auto=format&fit=crop&q=80',
        order_index: 2,
        aspect_ratio: '1:1',
      }
    ],
    like_count: 1482,
    comment_count: 24,
    is_liked: false,
    is_bookmarked: false,
    recent_comments: [
      {
        id: 201,
        post_id: 101,
        user_id: 3,
        content: '색감이 정말 예술이네요! 어떤 렌즈 쓰셨는지 알 수 있을까요? 🧡',
        created_at: '2026-10-02T19:10:00Z',
        user: {
          id: 3,
          username: 'design_sarah',
          profile_img_url: sampleUsers.design_sarah.profile_img_url,
          is_verified: true,
        },
        likes_count: 8,
        is_liked: false,
      },
      {
        id: 202,
        post_id: 101,
        user_id: 1,
        content: '힐링 제대로 하고 갑니다. 멋진 샷이네요 👍',
        created_at: '2026-10-02T19:40:00Z',
        user: {
          id: 1,
          username: 'admin',
          profile_img_url: sampleUsers.admin.profile_img_url,
          is_verified: true,
        },
        likes_count: 3,
        is_liked: true,
      }
    ]
  },
  {
    id: 102,
    caption: '새로운 모바일 디자인 시스템 완성 🎨\n다크 테마에서 최상의 명도 대비와 정갈한 타이포그래피 계층을 맞추는 데 주력했습니다. 의견 환영합니다!\n#유아이유엑스 #디자인시스템 #타이포그래피 #미니멀리즘 #다크모드',
    location: '서울 성수 크리에이티브 스페이스',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-10-02T16:15:00Z',
    author: {
      id: 3,
      username: 'design_sarah',
      full_name: '디자이너 사라',
      profile_img_url: sampleUsers.design_sarah.profile_img_url,
      is_verified: true,
    },
    media: [
      {
        id: 1004,
        media_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      },
      {
        id: 1005,
        media_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1080&auto=format&fit=crop&q=80',
        order_index: 1,
        aspect_ratio: '1:1',
      }
    ],
    like_count: 3120,
    comment_count: 48,
    is_liked: true,
    is_bookmarked: true,
    recent_comments: [
      {
        id: 203,
        post_id: 102,
        user_id: 6,
        content: '컴포넌트 구조가 정말 깔끔하네요. 개발자 친화적인 토큰 구조 최고!',
        created_at: '2026-10-02T16:50:00Z',
        user: {
          id: 6,
          username: 'coder_kim',
          profile_img_url: sampleUsers.coder_kim.profile_img_url,
          is_verified: false,
        },
        likes_count: 12,
        is_liked: true,
      }
    ]
  },
  {
    id: 103,
    caption: '비 내리는 성수동 골목의 조용한 에스프레소 바 ☕💧\n진한 헤이즐넛 크레마와 감각적인 인테리어가 비 오는 날과 너무 잘 어울려요.\n#성수동카페 #에스프레소 #카페투어 #커피스타그램 #서울카페',
    location: '서울 성수동',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-10-02T14:00:00Z',
    author: {
      id: 4,
      username: 'foodie_min',
      full_name: '미식가 민',
      profile_img_url: sampleUsers.foodie_min.profile_img_url,
      is_verified: false,
    },
    media: [
      {
        id: 1006,
        media_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      }
    ],
    like_count: 890,
    comment_count: 15,
    is_liked: false,
    is_bookmarked: false,
    recent_comments: [
      {
        id: 204,
        post_id: 103,
        user_id: 2,
        content: '여기 진짜 분위기 좋죠! 저도 저번주에 다녀왔어요 ㅎㅎ',
        created_at: '2026-10-02T14:30:00Z',
        user: {
          id: 2,
          username: 'traveler_june',
          profile_img_url: sampleUsers.traveler_june.profile_img_url,
          is_verified: false,
        },
        likes_count: 2,
        is_liked: false,
      }
    ]
  },
  {
    id: 104,
    caption: '새로운 캔버스 작업 중 🎨 질감과 색채의 레이어를 쌓아가는 명상의 시간.\n#예술 #현대미술 #유화 #작가의일상 #갤러리',
    location: '서울 한남 아틀리에',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-10-02T11:20:00Z',
    author: {
      id: 5,
      username: 'art_minji',
      full_name: '아티스트 민지',
      profile_img_url: sampleUsers.art_minji.profile_img_url,
      is_verified: true,
    },
    media: [
      {
        id: 1007,
        media_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      },
      {
        id: 1008,
        media_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&auto=format&fit=crop&q=80',
        order_index: 1,
        aspect_ratio: '1:1',
      }
    ],
    like_count: 4210,
    comment_count: 67,
    is_liked: true,
    is_bookmarked: false,
    recent_comments: []
  }
];

export const initialStories: StoryGroup[] = [
  {
    user: {
      id: 2,
      username: 'traveler_june',
      full_name: '여행가 준',
      profile_img_url: sampleUsers.traveler_june.profile_img_url,
      is_verified: false,
    },
    has_unseen: true,
    stories: [
      {
        id: 501,
        media_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80',
        caption: '비행기 창밖으로 보이는 알프스 설산 🏔️',
        created_at: '2026-10-02T17:00:00Z',
        expires_at: '2026-10-03T17:00:00Z',
      },
      {
        id: 502,
        media_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&auto=format&fit=crop&q=80',
        caption: '로드 트립 시작합니다! 🚗💨',
        created_at: '2026-10-02T18:00:00Z',
        expires_at: '2026-10-03T18:00:00Z',
      }
    ]
  },
  {
    user: {
      id: 3,
      username: 'design_sarah',
      full_name: '디자이너 사라',
      profile_img_url: sampleUsers.design_sarah.profile_img_url,
      is_verified: true,
    },
    has_unseen: true,
    stories: [
      {
        id: 503,
        media_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=80',
        caption: '금요일 야간 작업 & 아이디어 스케치 ☕✨',
        created_at: '2026-10-02T19:20:00Z',
        expires_at: '2026-10-03T19:20:00Z',
      }
    ]
  },
  {
    user: {
      id: 4,
      username: 'foodie_min',
      full_name: '미식가 민',
      profile_img_url: sampleUsers.foodie_min.profile_img_url,
      is_verified: false,
    },
    has_unseen: false,
    stories: [
      {
        id: 504,
        media_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80',
        caption: '오늘 저녁은 정갈한 오마카세 🍣',
        created_at: '2026-10-02T12:00:00Z',
        expires_at: '2026-10-03T12:00:00Z',
      }
    ]
  },
  {
    user: {
      id: 5,
      username: 'art_minji',
      full_name: '아티스트 민지',
      profile_img_url: sampleUsers.art_minji.profile_img_url,
      is_verified: true,
    },
    has_unseen: true,
    stories: [
      {
        id: 505,
        media_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1080&auto=format&fit=crop&q=80',
        caption: '새로운 물감 팔레트 준비 완료 🎨',
        created_at: '2026-10-02T15:00:00Z',
        expires_at: '2026-10-03T15:00:00Z',
      }
    ]
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 901,
    actor: {
      id: 2,
      username: 'traveler_june',
      profile_img_url: sampleUsers.traveler_june.profile_img_url,
    },
    type: 'LIKE_POST',
    post_id: 100,
    post_thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
    is_read: false,
    created_at: '5분 전',
  },
  {
    id: 902,
    actor: {
      id: 3,
      username: 'design_sarah',
      profile_img_url: sampleUsers.design_sarah.profile_img_url,
    },
    type: 'COMMENT',
    post_id: 100,
    post_thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
    is_read: false,
    created_at: '20분 전',
  },
  {
    id: 903,
    actor: {
      id: 5,
      username: 'art_minji',
      profile_img_url: sampleUsers.art_minji.profile_img_url,
    },
    type: 'FOLLOW',
    is_read: true,
    created_at: '2시간 전',
  },
  {
    id: 904,
    actor: {
      id: 6,
      username: 'coder_kim',
      profile_img_url: sampleUsers.coder_kim.profile_img_url,
    },
    type: 'LIKE_POST',
    post_id: 100,
    post_thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
    is_read: true,
    created_at: '1일 전',
  }
];

export const initialChatRooms: ChatRoomItem[] = [
  {
    id: 1,
    is_group: false,
    participant: {
      id: 3,
      username: 'design_sarah',
      full_name: '디자이너 사라',
      profile_img_url: sampleUsers.design_sarah.profile_img_url,
      is_verified: true,
    },
    last_message: {
      id: 801,
      room_id: 1,
      sender_id: 3,
      sender_username: 'design_sarah',
      content: '방금 보내주신 피그마 링크 잘 봤습니다! 컴포넌트 구조가 아주 훌륭해요 👍',
      created_at: '오후 8:12',
      is_read: false,
    },
    updated_at: '2026-10-02T20:12:00Z',
  },
  {
    id: 2,
    is_group: false,
    participant: {
      id: 2,
      username: 'traveler_june',
      full_name: '여행가 준',
      profile_img_url: sampleUsers.traveler_june.profile_img_url,
      is_verified: false,
    },
    last_message: {
      id: 802,
      room_id: 2,
      sender_id: 7,
      sender_username: 'test',
      content: '아이슬란드 일정 정해지면 공유 부탁드려요!',
      created_at: '오후 6:45',
      is_read: true,
    },
    updated_at: '2026-10-02T18:45:00Z',
  },
  {
    id: 3,
    is_group: false,
    participant: {
      id: 4,
      username: 'foodie_min',
      full_name: '미식가 민',
      profile_img_url: sampleUsers.foodie_min.profile_img_url,
      is_verified: false,
    },
    last_message: {
      id: 803,
      room_id: 3,
      sender_id: 4,
      sender_username: 'foodie_min',
      content: '다음 주에 성수동 신상 파스타집 가실래요?',
      created_at: '어제',
      is_read: true,
    },
    updated_at: '2026-10-01T15:20:00Z',
  }
];

export const explorePosts: Post[] = [
  ...initialPosts,
  {
    id: 105,
    caption: '도심 속의 미니멀리즘 건축물 🏢 직선과 유리의 조화\n#건축 #미니멀 #서울 #디자인',
    location: '서울',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-10-01T10:00:00Z',
    author: {
      id: 3,
      username: 'design_sarah',
      profile_img_url: sampleUsers.design_sarah.profile_img_url,
      is_verified: true,
    },
    media: [
      {
        id: 1009,
        media_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      }
    ],
    like_count: 5120,
    comment_count: 82,
    is_liked: false,
    is_bookmarked: false,
    recent_comments: []
  },
  {
    id: 106,
    caption: '숲속 캠핑의 아침 🌲 따뜻한 커피 한 잔과 새소리\n#캠핑 #자연 #숲 #아웃도어 #아침',
    location: '강원도',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-09-30T09:00:00Z',
    author: {
      id: 2,
      username: 'traveler_june',
      profile_img_url: sampleUsers.traveler_june.profile_img_url,
      is_verified: false,
    },
    media: [
      {
        id: 1010,
        media_url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      }
    ],
    like_count: 2840,
    comment_count: 39,
    is_liked: false,
    is_bookmarked: false,
    recent_comments: []
  },
  {
    id: 107,
    caption: '오늘 구운 바삭하고 고소한 크루아상 🥐 결이 살아있어요\n#베이킹 #크루아상 #베이커리 #페이스트리 #디저트',
    location: '서울 연남동',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-09-29T11:00:00Z',
    author: {
      id: 4,
      username: 'foodie_min',
      profile_img_url: sampleUsers.foodie_min.profile_img_url,
      is_verified: false,
    },
    media: [
      {
        id: 1011,
        media_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      }
    ],
    like_count: 1950,
    comment_count: 42,
    is_liked: false,
    is_bookmarked: false,
    recent_comments: []
  },
  {
    id: 108,
    caption: '도시의 밤을 달리는 네온 사인 🌌 사이버펑크 감성\n#도시야경 #네온 #도쿄 #야간사진',
    location: '도쿄 신주쿠',
    hide_likes: false,
    disable_comments: false,
    created_at: '2026-09-28T22:00:00Z',
    author: {
      id: 6,
      username: 'coder_kim',
      profile_img_url: sampleUsers.coder_kim.profile_img_url,
      is_verified: false,
    },
    media: [
      {
        id: 1012,
        media_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80',
        order_index: 0,
        aspect_ratio: '1:1',
      }
    ],
    like_count: 3670,
    comment_count: 55,
    is_liked: false,
    is_bookmarked: false,
    recent_comments: []
  }
];
