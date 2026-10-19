import { Conversation } from '../types';

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    productId: 'prod-001',
    productTitle: 'Apple iPhone 15 Pro Max - 256GB Natural Titanium',
    productPrice: 14800,
    productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    sellerName: 'Nana Kwame Gadgets GH',
    sellerPhone: '+233 24 889 0011',
    sellerRating: 4.9,
    sellerVerified: true,
    buyerName: 'Godfred Owusu',
    buyerEmail: 'godfredowusu370@gmail.com',
    sellerEmail: 'nanakwame@gadgetsgh.com',
    lastMessage: 'Yes, battery health is 100% and it comes with original 20W Apple adapter. You can test it at our East Legon shop!',
    lastMessageTime: '10:42 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-1',
        sender: 'buyer',
        text: 'Hello Nana, I am interested in this iPhone 15 Pro Max. Is it still in stock?',
        timestamp: '10:30 AM'
      },
      {
        id: 'msg-2',
        sender: 'seller',
        text: 'Akwaaba! Yes, we have 4 units left in Natural Titanium and Blue Titanium, factory unlocked brand new.',
        timestamp: '10:32 AM'
      },
      {
        id: 'msg-3',
        sender: 'buyer',
        text: 'Would you accept GH₵ 14,000 cash on delivery at Airport Residential?',
        timestamp: '10:35 AM',
        isOffer: true,
        offeredPrice: 14000
      },
      {
        id: 'msg-4',
        sender: 'seller',
        text: 'We can do GH₵ 14,500 with a free genuine silicone case and tempered glass screen protector.',
        timestamp: '10:38 AM'
      },
      {
        id: 'msg-5',
        sender: 'buyer',
        text: 'Can you confirm battery health and original accessories included?',
        timestamp: '10:40 AM'
      },
      {
        id: 'msg-6',
        sender: 'seller',
        text: 'Yes, battery health is 100% and it comes with original 20W Apple adapter. You can test it at our East Legon shop!',
        timestamp: '10:42 AM'
      }
    ]
  },
  {
    id: 'conv-002',
    productId: 'prod-002',
    productTitle: '2022 Toyota RAV4 XLE AWD Full Option',
    productPrice: 285000,
    productImage: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=600&auto=format&fit=crop&q=80',
    sellerName: 'Osu Auto Classics',
    sellerPhone: '+233 20 445 6789',
    sellerRating: 4.7,
    sellerVerified: true,
    buyerName: 'Godfred Owusu',
    buyerEmail: 'godfredowusu370@gmail.com',
    sellerEmail: 'sales@osuautoclassics.com',
    lastMessage: 'Good day! All GRA customs duties and clearing documentation are verified with DVLA inspection reports ready.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-201',
        sender: 'buyer',
        text: 'Good day! Is the RAV4 available for viewing and mechanical inspection at Spintex?',
        timestamp: 'Yesterday, 3:15 PM'
      },
      {
        id: 'msg-202',
        sender: 'seller',
        text: 'Good day! All GRA customs duties and clearing documentation are verified with DVLA inspection reports ready.',
        timestamp: 'Yesterday, 3:20 PM'
      }
    ]
  },
  {
    id: 'conv-003',
    productId: 'prod-005',
    productTitle: 'Samsung 65-inch Crystal UHD 4K Smart TV',
    productPrice: 8900,
    productImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    sellerName: 'Spintex Electronics Hub',
    sellerPhone: '+233 24 555 7890',
    sellerRating: 4.8,
    sellerVerified: true,
    buyerName: 'Godfred Owusu',
    buyerEmail: 'godfredowusu370@gmail.com',
    sellerEmail: 'info@spintexelectronics.com',
    lastMessage: 'We offer free delivery and wall-mounting bracket installation anywhere in Accra or Tema.',
    lastMessageTime: 'Sep 23',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-301',
        sender: 'buyer',
        text: 'Hi, does the TV come with YouTube and Netflix installed, and warranty?',
        timestamp: 'Sep 23, 11:00 AM'
      },
      {
        id: 'msg-302',
        sender: 'seller',
        text: 'We offer free delivery and wall-mounting bracket installation anywhere in Accra or Tema.',
        timestamp: 'Sep 23, 11:05 AM'
      }
    ]
  }
];
