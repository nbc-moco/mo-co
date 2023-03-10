import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db, authService } from './../../../common/firebase';
import { useParams } from 'react-router-dom';
import {
  RecruitWrap,
  RecruitFont,
  RecruitArea,
  AreaDetail,
  RecruitDate,
  DateDetail,
  RecruitStack,
  StackDetail,
  RecruitCurrent,
  RecruitDetail,
  RecruitBtn,
  UserHr,
  RecruitName,
  NameDetail,
} from './DetailRecruitStyle';
import ApplyModal from '../applyModal/ApplyModal';
import { useQueryClient } from 'react-query';
import { useRecoilValue } from 'recoil';
import teamPageState from '../../../recoil/teamPageState';
import { toast } from 'react-toastify';

const DetailRecruit = () => {
  const teamPage = useRecoilValue(teamPageState);
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [post, setpost] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [teamMember, setTeamMember] = useState([]);
  const [myProfileImg, setMyProfileImg] = useState([]);
  const [teamIDUserInfo, setTeamIDUserInfo] = useState([]);
  const [myTeamList, setMyTeamList] = useState([]);
  const [disable, setDisable] = useState(false);
  // 참여신청 버튼 비활성화 여부
  let isBtnDisabled = false;

  // 정원 모집 여부 조건 표현
  const itsTeamDoc = teamPage?.filter((item) => item.teamID === post.teamID);
  const teamMembers = itsTeamDoc
    ? `${
        itsTeamDoc[0]?.teamMember.filter((member) => member.isWait === false)
          .length + 1
      }명`
    : '';

  /*
  참여 신청 버튼 비활성화 조건
  1. 내가 주최자일 경우
  2. 모집이 완료된 경우 ( 모집 완료 텍스트 포함 )
  3. 이미 신청한 경우 ( 신청 완료 텍스트 포함 )
  4. 정원이 다 찬 경우
  */
  if (teamMembers == post.partyNum) {
    isBtnDisabled = true;
  }

  if (post.uid === authService?.currentUser?.uid) {
    isBtnDisabled = true;
  }

  if (post.partyIsOpen === false) {
    isBtnDisabled = true;
  }

  if (myTeamList.includes(post.teamID)) {
    isBtnDisabled = true;
  }

  // 프로필 이미지, 팀 ID 받아오기
  const GetMyProfileImg = () => {
    const q = query(
      collection(db, 'user'),
      where('uid', '==', authService.currentUser.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInfo = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyProfileImg(newInfo[0]?.profileImg);
      setTeamIDUserInfo(newInfo[0]?.teamID);
    });
    return unsubscribe;
  };

  const handleModalOpen = () => {
    if (!authService.currentUser) {
      toast.warn('로그인 후 이용해주세요');
      return;
    }
    setIsModalOpen(true);
    getTeamID();
  };

  const getTeamID = () => {
    getDoc(doc(db, 'teamPage', post.teamID))
      .then((userDoc) => {
        const teamPage = userDoc.data();
        setTeamMember(teamPage.teamMember);
      })
      .catch((error) => {
        toast.warn('다시 시도해주세요');
      });
  };

  const getMyTeamIdList = () => {
    let myTeamIdList = [];
    if (teamPage?.length > 0) {
      teamPage.forEach((item) => {
        item.teamMember?.forEach((member) => {
          if (member.nickName === authService?.currentUser?.displayName) {
            myTeamIdList.push(item.teamID);
            setMyTeamList(myTeamIdList);
            return false;
          }
        });
      });
    }
  };

  const handleModalOk = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, 'teamPage', post.teamID), {
      teamMember: [
        ...teamMember,
        {
          isRead: false,
          uid: authService.currentUser.uid,
          joinMessage: joinMessage,
          isWait: true,
          nickName: authService.currentUser.displayName,
          profileImg: myProfileImg,
        },
      ],
    })
      .then(() => {
        updateDoc(doc(db, 'user', authService.currentUser.uid), {
          teamID: [...teamIDUserInfo, post.teamID],
        });
      })
      .catch(() => {
        toast.warn('다시 시도해주세요');
      });
    queryClient.invalidateQueries('teamPage');
    setDisable(true);
    toast.success('참여 신청 완료!');
    setIsModalOpen(false);
  };

  const handleModalCancel = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  const getPost = async () => {
    const q = doc(db, 'post', id);
    const postData = await getDoc(q);
    setpost(postData.data());
  };

  useEffect(() => {
    getPost();
    if (authService.currentUser) {
      GetMyProfileImg();
    }
    getMyTeamIdList();
  }, []);

  return (
    <RecruitWrap>
      <RecruitName>
        <RecruitFont>모임명</RecruitFont>
        <NameDetail>{post.partyName}</NameDetail>
      </RecruitName>
      <UserHr />
      <RecruitArea>
        <RecruitFont>모임지역</RecruitFont>
        <AreaDetail>{post.isRemote ? '비대면' : post.partyLocation}</AreaDetail>
      </RecruitArea>
      <UserHr />
      <RecruitDate>
        <RecruitFont>모임시간</RecruitFont>
        <DateDetail>{post.partyTime}</DateDetail>
      </RecruitDate>
      <UserHr />
      <RecruitStack>
        <RecruitFont>기술스택</RecruitFont>
        <StackDetail>
          {post?.partyStack?.map((item, idx) => (
            <img
              key={idx}
              src={require(`../../../assets/stack/${item}.png`)}
              alt={item}
              style={{ width: 30, height: 30, marginRight: 10 }}
            />
          ))}
        </StackDetail>
      </RecruitStack>
      <UserHr />
      <RecruitCurrent>
        <RecruitFont>모집현황</RecruitFont>
        {/* 22323232323232323232 */}
        <RecruitDetail>
          {post.partyIsOpen ? '모집중' : '모집 종료'}
        </RecruitDetail>
      </RecruitCurrent>
      <RecruitBtn disabled={isBtnDisabled || disable} onClick={handleModalOpen}>
        모임 참여 신청
      </RecruitBtn>
      <ApplyModal
        isModalOpen={isModalOpen}
        handleModalOk={handleModalOk}
        handleModalCancel={handleModalCancel}
        setJoinMessage={setJoinMessage}
        joinMessage={joinMessage}
      />
    </RecruitWrap>
  );
};

export default DetailRecruit;
