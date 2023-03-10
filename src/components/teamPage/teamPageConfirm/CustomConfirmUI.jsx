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
import cancel from '../../../../src/assets/icon/Icon_cancel.png';
import { useRecoilState } from 'recoil';
import confirmState from '../../../recoil/confirmState';

const CustomConfirmUI = (props) => {
  // 본인 아이디
  const myId = props.data.uid;
  const myInfo = props.data;
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

  // 수락할 경우
  const updateIsWait = () => {
    updateDoc(doc(db, 'teamPage', props.id), {
      teamMember: [
        ...otherMember,
        {
          isRead: myInfo.isRead,
          isWait: false,
          joinMessage: myInfo.joinMessage,
          nickName: myInfo.nickName,
          profileImg: myInfo.profileImg,
          uid: myInfo.uid,
        },
      ],
    });

    props.onClose();
  };

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
    // <WholeWrap>
    <PlaceModal onClick={props.onClose}>
      <ConfirmBox>
        <TitleBox>
          <CancelImg onClick={props.onClose} src={cancel} />
        </TitleBox>
        <UserAcceptOrNot>
          <UserImgBox
            src={
              props.data.profileImg
                ? props.data.profileImg
                : '../../assets/icon/user.png'
            }
          />
          <ConfirmText>
            <p>{props.data.nickName} 님이</p>
            <p>모임에 참여 신청하였습니다</p>
          </ConfirmText>
          <IntroduceText>
            <MessageBox>{props.data.joinMessage}</MessageBox>
          </IntroduceText>
        </UserAcceptOrNot>
        <BtnBox>
          <ConfirmCancelBtnOne onClick={() => rejectSuggestion(props.data.uid)}>
            거절
          </ConfirmCancelBtnOne>
          <ConfirmCancelBtnTwo onClick={updateIsWait}>수락</ConfirmCancelBtnTwo>
        </BtnBox>
      </ConfirmBox>
    </PlaceModal>
    // </WholeWrap>
  );
};
export default CustomConfirmUI;

const IntroduceText = styled.div`
  width: 20.625rem;
  height: 10rem;
  background-color: #e7e7e7;
  border-radius: 10px; ;
`;

const WholeWrap = styled.div`
  width: 100%;
  height: 100vh;
  z-index: 1;
  position: relative;
`;

const PlaceModal = styled.div`
  width: 100vw;
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

const UserAcceptOrNot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const UserImgBox = styled.img`
  width: 5rem;
  height: 5rem;
  border-radius: 50px;
`;

const ConfirmBox = styled.div`
  width: 25rem;
  height: 30rem;

  border-radius: 10px;
  background-color: #232323;

  padding: 0.3125rem;
`;

const CancelImg = styled.img`
  width: 1.25rem;
  height: 1.25rem;

  margin-right: 0.9375rem;

  cursor: pointer;
`;

const TitleBox = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  margin-top: 0.9375rem;
`;

const MessageBox = styled.div`
  width: 100%;
  text-align: center;

  font-size: 0.875rem;
  padding: 1.25rem;
`;

const TextBox = styled.div`
  display: flex;
  justify-content: center;

  margin-top: 35px;
`;

const ConfirmText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  margin: 0.9375rem 0 1.5625rem;
`;

const BtnBox = styled.div`
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
  gap: 0.625rem;
`;

const ConfirmCancelBtnOne = styled.button`
  font-size: 1rem;
  font-weight: 800;

  background-color: #545454;
  border: 1px solid #6c6c6c;
  border-radius: 5px;

  width: 10rem;
  height: 2.8125rem;

  cursor: pointer;
`;

const ConfirmCancelBtnTwo = styled.button`
  font-size: 1rem;
  font-weight: 800;

  background-color: #feff80;
  border: none;
  border-radius: 5px;

  width: 10rem;
  height: 2.8125rem;

  cursor: pointer;
`;
