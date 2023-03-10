import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, authService } from '../../../common/firebase';
import { GrMoreVertical } from 'react-icons/gr';
import default_profile from '../../../assets/icon/user.png';
import { confirmAlert } from 'react-confirm-alert';
import ReplyCustomUi from './ReplyCustomUi';
import {
  CommentContainer,
  CommentDeleteBtn,
  CommentIconBody,
  CommentUserName,
  CommentUserInput,
  CommentText,
  CommentTextIcon,
  CommentUpdateBtn,
  ListContainer,
  ListTextSection,
  NoneDiv,
  UpdateDeleteBody,
  CommentProfileImage,
  CommentDate,
  UserHr,
} from './ReplyCommentStyle';

const ReplyComment = ({ comment, index, comments }) => {
  const [editBox, setEditBox] = useState(false);
  const [editValue, setEditValue] = useState(comment?.comment);
  const [toggleBtn, setToggleBtn] = useState(false);
  const [areYouUser, setAreYouUser] = useState(false);

  const handleChange = (e) => {
    setEditValue(e.target.value);
  };

  // 토글 버튼을 누를 시 userid와 currentuid비교
  // 수정 삭제 버튼 오픈
  const ToggleDropDown = (userId) => {
    const currentUid = authService?.currentUser?.uid;

    if (toggleBtn === false) {
      if (userId === currentUid) {
        setAreYouUser(true);
      }
      setToggleBtn(true);
    } else if (toggleBtn === true) {
      if (userId === currentUid) {
        setAreYouUser(false);
      }
      setToggleBtn(false);
    }
  };

  // 댓글 수정
  const editHandler = (comment) => {
    setEditValue(comment);
    setEditBox(true);
  };

  // 댓글 수정완료
  const completeHandler = async () => {
    setEditBox(false);
    const replyEditComment = doc(db, 'comment', comments.id);
    await updateDoc(replyEditComment, {
      replyComment: updatedComment(),
    });
    setToggleBtn(false);
  };

  const updatedComment = () => {
    let beforeArray = [...comments.replyComment];
    beforeArray[index].comment = editValue;
    return beforeArray;
  };

  // 댓글 삭제
  const deleteHandler = () => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <ReplyCustomUi
            onClose={onClose}
            comment={comments}
            id={comment.commentId}
          />
        );
      },
    });
  };

  return (
    <CommentContainer>
      <UserHr />
      {/* 댓글 내용 */}
      <ListContainer>
        <ListTextSection>
          <CommentProfileImage
            src={!comment?.userImg ? default_profile : comment?.userImg}
          ></CommentProfileImage>
          <CommentUserName>{comment?.userName}</CommentUserName>
          <CommentIconBody>
            <GrMoreVertical
              style={{
                color: '#858585',
                width: '600px',
              }}
              onClick={() => ToggleDropDown(comment?.userId)}
            />
            <CommentTextIcon>
              {toggleBtn ? (
                <>
                  {areYouUser ? (
                    <UpdateDeleteBody>
                      {!editBox ? (
                        <CommentUpdateBtn
                          onClick={() => {
                            editHandler(comment?.comment);
                          }}
                        >
                          수정
                        </CommentUpdateBtn>
                      ) : (
                        <CommentUpdateBtn onClick={() => completeHandler()}>
                          수정완료
                        </CommentUpdateBtn>
                      )}

                      <CommentDeleteBtn
                        onClick={() => {
                          deleteHandler();
                        }}
                      >
                        삭제
                      </CommentDeleteBtn>
                    </UpdateDeleteBody>
                  ) : (
                    <UpdateDeleteBody></UpdateDeleteBody>
                  )}
                </>
              ) : (
                <NoneDiv></NoneDiv>
              )}
            </CommentTextIcon>
          </CommentIconBody>
          {!editBox ? (
            <CommentText>{comment?.comment}</CommentText>
          ) : (
            <CommentUserInput
              type="text"
              value={editValue}
              onChange={(e) => handleChange(e)}
            />
          )}
          <CommentDate>{comment?.date}</CommentDate>

          {/* <ReplyComment user={user} /> */}
        </ListTextSection>
      </ListContainer>
    </CommentContainer>
  );
};

export default ReplyComment;
