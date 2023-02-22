import { useQuery } from 'react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../common/firebase';

export default function usePosts() {
  return useQuery(
    'posts',
    async () => {
      const q = collection(db, 'post');
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return posts;
    },
    {
      cacheTime: 5 * 60 * 1000,
      staleTime: 2 * 60 * 1000,
    },
  );
}