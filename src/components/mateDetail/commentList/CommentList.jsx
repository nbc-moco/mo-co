import { useState, useEffect } from 'react';
import { db, doc } from '../../../common/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import Comment from '../comment/Comment';
import styled from '@emotion/styled';

const CommentList = ({ id }) => {
  // 데이터 실시간 변경 확인
  const [comments, setComments] = useState([]);
  useEffect(() => {
    const postCollectionRef = collection(db, 'comment');
    const q = query(postCollectionRef);
    const getPost = onSnapshot(q, (snapshot) => {
      const testComment = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(testComment);
    });
    return getPost;
  }, []);
  console.log(comments);

  return (
    <>
      {comments
        .filter((comment) => comment.userId === id)
        .map((user) => {
          return <Comment key={user.uid} user={user} />;
        })}
    </>
  );
};
export default CommentList;
