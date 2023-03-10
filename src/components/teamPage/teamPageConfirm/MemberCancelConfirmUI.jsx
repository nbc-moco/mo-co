import styled from '@emotion/styled';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { authService, db } from '../../../common/firebase';

const MemberCancelConfirmUI = (props) => {
  // 본인 아이디
  const myId = props.data.uid;
  // 팀 ID
  const teamID = props.id;
  //  팀 멤버
  const member = props.item;
  const otherMember = member.filter((d) => d.uid !== myId);

  // 해당 유저 컬렉션에 팀 ID에 접근하기
  const [userTeamID, setUserTeamID] = useState([]);
  const getUserTeamID = () => {
    const q = query(collection(db, 'user'), where('uid', '==', myId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInfo = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserTeamID(newInfo[0]?.teamID.filter((a) => a !== teamID));
    });

    return unsubscribe;
  };

  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        getUserTeamID();
      }
    });
  }, []);

  // 거절할 경우
  async function rejectSuggestion(uid) {
    await updateDoc(doc(db, 'user', uid), {
      teamID: [...userTeamID],
    });
    await updateDoc(doc(db, 'teamPage', props.id), {
      teamMember: [...otherMember],
    });
    props.onClose();
  }

  return (
    <ConfirmBody onClick={props.onClose}>
      <ConfirmBox>
        <ImageTitleBox>
          <ImageBox>
            <MyImage src={props.data.profileImg} />
          </ImageBox>
        </ImageTitleBox>
        <TextBox>
          <ConfirmText>
            {props.data.nickName} 님을 <br /> 모임에서 강퇴하시겠습니까?
          </ConfirmText>
        </TextBox>
        <BtnBox>
          <ConfirmCancelBtn onClick={props.onClose}>취소</ConfirmCancelBtn>
          <ConfirmDeleteBtn onClick={() => rejectSuggestion(props.data.uid)}>
            강퇴
          </ConfirmDeleteBtn>
        </BtnBox>
      </ConfirmBox>
    </ConfirmBody>
  );
};

export default MemberCancelConfirmUI;

const ConfirmBody = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 990;
`;

const ConfirmBox = styled.div`
  width: 25rem;
  height: 17.8125rem;

  background: #232323;
  border-radius: 20px;
`;

const ImageTitleBox = styled.div``;

const ImageBox = styled.div`
  display: flex;
  justify-content: center;

  margin-top: 2.1875rem;
`;

const MyImage = styled.img`
  width: 5rem;
  height: 5rem;
  object-fit: cover;

  border-radius: 40px;
`;

const TextBox = styled.div`
  text-align: center;
  margin-top: 0.9375rem;
`;

const ConfirmText = styled.p`
  font-family: 'Pretendard';
  font-style: normal;
  font-weight: 500;
  font-size: 1.05rem;
  line-height: 1.3125rem;

  text-align: center;
  letter-spacing: -0.02em;

  color: #ffffff;
`;

const BtnBox = styled.div`
  margin-top: 1.875rem;
  display: flex;
  justify-content: center;
  gap: 0.625rem;
`;

const ConfirmCancelBtn = styled.button`
  width: 10rem;
  height: 2.8125rem;
  border-radius: 5px;

  font-family: 'Pretendard';
  font-style: normal;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.1875rem;
  letter-spacing: -0.02em;

  background-color: #ffffff;
  border: none;

  cursor: pointer;
`;

const ConfirmDeleteBtn = styled(ConfirmCancelBtn)`
  background-color: #545454;
  border: 1px solid #6c6c6c;
  border-radius: 5px;
  color: #ffffff;
`;
