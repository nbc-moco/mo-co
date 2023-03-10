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
import React, { useEffect, useState } from 'react';
import { authService, db } from '../../common/firebase';
import { useRecoilState } from 'recoil';
import teamPageState from '../../recoil/teamPageState';
import { toast } from 'react-toastify';

export default function ContentRule({ teamLocationID }) {
  const [teamPage, setTeamPage] = useRecoilState(teamPageState);

  const [content, setContent] = useState('');
  const [convert, setConvert] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  // post에서 uid 받아오기
  const [idUid, setidUid] = useState([]);
  const postGetTeamID = () => {
    const q = query(
      collection(db, 'post'),
      where('uid', '==', authService.currentUser.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInfo = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setidUid(newInfo[0]?.uid);
    });
    return unsubscribe;
  };

  // 팀 아이디 받아오기
  const [teamID, setTeamID] = useState([]);
  const [contentInfo, setContentInfo] = useState([]);
  const teamGetTeamID = () => {
    const q = query(collection(db, 'teamPage'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInfo = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeamID(teamLocationID);
      setContentInfo(newInfo);
    });
    return unsubscribe;
  };

  // 유저에서 팀 id 받아오기
  const [userTeamID, setUserTeamID] = useState([]);
  const userGetTeamID = () => {
    const q = query(
      collection(db, 'user'),
      where('uid', '==', authService.currentUser.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInfo = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserTeamID(newInfo);
    });
    return unsubscribe;
  };

  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        setCurrentUserId(authService.currentUser.uid);
        postGetTeamID();
        teamGetTeamID();
        userGetTeamID();
      }
    });
  }, []);

  const isOwner = idUid === currentUserId ? true : false;

  const convertChange = () => {
    setConvert(!convert);
  };
  const updateContentRule = async () => {
    if (convert) {
      const newContentField = {
        contentRule: content,
      };
      try {
        await updateDoc(doc(db, 'teamPage', teamID), newContentField);
      } catch (e) {
        toast.warn('다시 시도해주세요');
      }
    }
    convertChange();
  };
  return (
    <>
      <ContentCard>
        <ButtonPlaceTitleWrap>
          <ContentTitle>모임 공지</ContentTitle>
          {isOwner && (
            <>
              <SubmitBtn onClick={updateContentRule} type="submit">
                작성
              </SubmitBtn>
            </>
          )}
        </ButtonPlaceTitleWrap>
        <TextAreaWrapper>
          {convert ? (
            <textarea
              onChange={(e) => {
                setContent(e.target.value);
              }}
              className="text"
              placeholder="내용을 입력하세요"
              value={content}
            />
          ) : (
            <>
              {contentInfo
                .filter((item) => item.id === teamLocationID)
                .map((item) => {
                  return (
                    <textarea
                      disabled
                      key={item.id}
                      value={item.contentRule}
                      onChange={(e) => e.target.value}
                    >
                      {item.contentRule}
                    </textarea>
                  );
                })}
            </>
          )}
        </TextAreaWrapper>
      </ContentCard>
    </>
  );
}

const TextAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .text {
    width: 100%;
    height: 230px;
  }

  input,
  textarea {
    &::-webkit-scrollbar {
      display: none;
    }

    resize: none;
    border: none;
    font-size: 16px;
    font-weight: 500;
    border-radius: 5px;
    height: 350px;
    transition: border 1s;
    padding: 20px;
    box-sizing: border-box;
    white-space: pre-line;

    &:focus {
      outline: none;
      border: 2px solid skyblue;
      border-radius: 15px;
    }
    &:disabled {
      background-color: white;
    }
  }
`;

const SubmitBtn = styled.button`
  display: flex;
  margin-left: auto;
  justify-content: flex-end;
  width: 50px;
  height: 30px;
  text-align: center;
  align-items: center;
  font-size: 15px;
  border: none;
  background-color: transparent;
  color: grey;
`;

const ContentCard = styled.div`
  width: 100%;
  position: relative;
  border-radius: 20px;
  overflow-y: auto;
  transition: 0.4s;
  height: 400px;
  margin-top: 40px;
  background-color: white;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
  p {
    padding: 20px;
  }

  @media screen and (max-height: 800px) {
    height: 200px;
  }
`;

const ButtonPlaceTitleWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #232323;
  position: sticky;
  top: 0;
`;

const ContentTitle = styled.a`
  display: flex;
  font-size: 16px;
  font-weight: 600;
  align-items: center;
  color: white;
`;
