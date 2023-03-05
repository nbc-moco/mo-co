import React, { useEffect, useState } from 'react';
import { Replybutton } from '../comment/CommentStyle';
import { ReplyWrap } from './ReplyCommentStyle';
import CommentTest from './commentTest';
import ReplyAddComment from '../replyAddComment/replyAddComment';
import ReplyComment from './ReplyComment';

const ReplyCommentList = ({ comment }) => {
  const [display, setDisplay] = useState(false);

  console.log(comment.replyComment);
  return (
    <ReplyWrap>
      <Replybutton
        onClick={() => {
          setDisplay(!display);
        }}
      >
        답글 쓰기
      </Replybutton>
      {display && <ReplyAddComment comment={comment} />}
      {comment?.replyComment.map((item, index) => {
        return (
          <ReplyComment
            comment={item}
            index={index}
            replycomment={comment.replyComment}
          />
        );
      })}
      ;
    </ReplyWrap>
  );
};

export default ReplyCommentList;
