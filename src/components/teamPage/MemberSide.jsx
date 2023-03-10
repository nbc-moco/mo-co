import React from 'react';
import {
  MemberSidebar,
  SideWrapper,
  MemberInfoProfile,
  MemberInfoProfileImg,
  MemberInfoProfileInfo,
  MemberInfoProfileTitle,
  MemberInfoProfileName,
  MembersInfoProfileTitle,
  LeaderPosition,
  WaitMember,
  WaitMemberTitle,
  WaitMemberListBox,
  WrapWrap,
  SectionLine,
  SideWrapperTwo,
  SideWrapperThr,
  MemberWrap,
} from './style';
import { useEffect, useState } from 'react';
import { authService, db } from '../../common/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { v4 } from 'uuid';
import SideMemberList from './SideMemberList';
import WaitMemberList from './WaitMemberList';
import { confirmAlert } from 'react-confirm-alert';
import MyProfileConfirm from './teamPageConfirm/MyProfileConfirm';
import { useRecoilState, useRecoilValue } from 'recoil';
import userState from '../../recoil/userState';

export default function MemberSide({ teamLocationID }) {
  const getMyinfo = useRecoilValue(userState);

  const [nickName, setNickName] = useState('');

  // 팀 리더 정보
  const [teamLeaderInfo, setTeamLeaderInfo] = useState([]);

  // 팀 멤버 정보
  const [teamMemberInfo, setTeamMemberInfo] = useState([]);

  // 이미지 정보 가져오기
  const [teamProfileUserInfo, setTeamProfileUserInfo] = useState([]);

  // 멤버 숫자
  const [memberNumber, setMemberNumber] = useState(1);

  // 팀 유저 정보 가져오기
  const teamGetTeamUserInfo = () => {
    const q = query(
      collection(db, 'teamPage'),
      where('teamID', '==', teamLocationID),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInfo = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeamLeaderInfo(newInfo[0]?.teamLeader);
      setTeamMemberInfo(newInfo);
      setMemberNumber(
        newInfo.filter((d) => d.teamID === teamLocationID)[0]?.teamMember
          .length + 1,
      );
    });
    return unsubscribe;
  };

  // 내 유저 정보 가져오기
  const teamGetMyUserInfo = () => {
    const q = query(collection(db, 'user'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInfo = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeamProfileUserInfo(newInfo);
    });
    return unsubscribe;
  };

  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        setNickName(authService.currentUser.displayName);
        teamGetTeamUserInfo();
        teamGetMyUserInfo();
      } else if (!user) {
        return;
      }
    });
  }, [nickName, getMyinfo]);

  // 내 프로필 보기
  const teamInfo = teamMemberInfo.filter((t) => t.teamID === teamLocationID);

  const myProfile = (data) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <MyProfileConfirm
            onClose={onClose}
            data={data}
            id={data.id}
            item={teamInfo}
            teamLocationID={teamLocationID}
          />
        );
      },
    });
  };

  // 리더 프로필 보기
  const LeaderProfile = (data) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <MyProfileConfirm
            onClose={onClose}
            data={data}
            id={data.id}
            teamLocationID={teamLocationID}
            item={teamInfo}
          />
        );
      },
    });
  };
  return (
    <>
      <MemberSidebar>
        <WrapWrap>
          <SideWrapper>
            <MemberInfoProfileTitle>프로필</MemberInfoProfileTitle>
            {teamProfileUserInfo
              .filter((item) => item.uid === authService.currentUser.uid)
              .map((item) => {
                return (
                  <MemberInfoProfile key={v4()}>
                    <MemberInfoProfileImg
                      src={
                        item?.profileImg
                          ? item.profileImg
                          : 'https://imhannah.me/common/img/default_profile.png'
                      }
                      onClick={() => myProfile(item)}
                    />
                    <MemberInfoProfileInfo>
                      <MemberInfoProfileName>
                        {nickName ?? '익명'}
                      </MemberInfoProfileName>
                    </MemberInfoProfileInfo>
                  </MemberInfoProfile>
                );
              })}
          </SideWrapper>
          <SectionLine />
          <SideWrapperTwo>
            <MembersInfoProfileTitle>모임 멤버</MembersInfoProfileTitle>
            {/* 팅장 */}
            <MemberWrap>
              {teamProfileUserInfo
                .filter((item) => item.uid === teamLeaderInfo?.uid)
                .map((item) => {
                  return (
                    <MemberInfoProfile key={v4()}>
                      <MemberInfoProfileImg
                        src={item.profileImg}
                        onClick={() => LeaderProfile(teamLeaderInfo)}
                      />
                      <MemberInfoProfileInfo>
                        <MemberInfoProfileName>
                          {item.nickname}
                        </MemberInfoProfileName>
                        <LeaderPosition>리더</LeaderPosition>
                      </MemberInfoProfileInfo>
                    </MemberInfoProfile>
                  );
                })}

              {/* 팅원 */}
              {teamMemberInfo
                .filter((item) => item.id === teamLocationID)
                .map((item) => {
                  return (
                    <SideMemberList
                      item={item}
                      key={v4()}
                      teamLocationID={teamLocationID}
                    />
                  );
                })}
            </MemberWrap>
          </SideWrapperTwo>
          <SideWrapperThr>
            <WaitMemberTitle>참여 신청</WaitMemberTitle>
            <WaitMemberListBox>
              {teamMemberInfo
                .filter((item) => item.id === teamLocationID)
                .map((item) => {
                  return <WaitMemberList item={item} key={v4()} />;
                })}
            </WaitMemberListBox>
          </SideWrapperThr>
        </WrapWrap>
      </MemberSidebar>
    </>
  );
}
