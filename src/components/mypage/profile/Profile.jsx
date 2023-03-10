import { onAuthStateChanged, updateProfile } from 'firebase/auth';

import React, { useEffect, useRef, useState } from 'react';
import { authService, db } from '../../../common/firebase';
import {
  MyProfileBody,
  ProfileSection,
  ProfileHeaderIcon,
  ProfileImageBody,
  ProfileImage,
  ProfileEditBody,
  EditNickNameInput,
  ProfileNickNameBody,
  ProfileNickName,
  ProfileNickNameBtn,
  NickNameCompleteBtn,
  ProfileMiddleSection,
  MiddleBody,
  ProfileStackBody,
  StackbodyTitle,
  StackbodyText,
  ProfileTechBody,
  TechBodyTitle,
  TechBodyImage,
  ProfileFooterBody,
  ProfileStackBtn,
  ProfileMocoText,
  NicknameImageBox,
  NicknameTextBox,
  NicaknameHello,
  ProfileSectionGap,
} from './ProfileStyle';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@firebase/firestore';
import { useNavigate } from 'react-router';
import wheel from '../../../../src/assets/login/wheel.png';
import default_profile from '../../../assets/icon/user.png';
import { toast } from 'react-toastify';
import { useQueryClient } from 'react-query';

const Profile = () => {
  // 네이게이트
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 닉네임 수정 input 여부
  const [editNickNameBtn, setEditNickName] = useState(false);

  // 닉네임
  const [nickName, setNickName] = useState('');
  const [nickNamevalue, setNickNameValue] = useState('');

  // 현재 유저
  const [currentUser, setCurrentUser] = useState('');

  // 이미지 선택
  const inputImageRef = useRef();

  // 유저 정보 가져오기
  const [profileUserInfo, setProfileUserInfo] = useState([]);

  // 스택 정보 기져오기
  const [stackIsRemote, setStaclIsRemote] = useState('');
  const [stackPlace, setStackPlace] = useState('');
  const [stackTime, setStackTime] = useState('');
  const [techStack, setTechStack] = useState([]);

  // 유저 정보 불러오기
  const getUserStackInfo = () => {
    const q = query(
      collection(db, 'user'),
      where('uid', '==', authService.currentUser.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInfo = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProfileUserInfo(newInfo);

      setStaclIsRemote(newInfo[0]?.moreInfo.u_isRemote);
      setStackPlace(newInfo[0]?.moreInfo.u_location);
      setStackTime(newInfo[0]?.moreInfo.u_time);
      setTechStack(newInfo[0]?.moreInfo.u_stack);
    });

    return unsubscribe;
  };

  // 유저 확인
  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        setCurrentUser(authService.currentUser.uid);
        setNickName(authService.currentUser.displayName);
        getUserStackInfo();
      }
    });
  }, [currentUser, nickName]);

  // 수정, 완료 토글
  const [clickEditBtn, setClickBtn] = useState(true);

  // 닉네임 수정 버튼 클릭시
  const edditNickName = () => {
    setClickBtn(false);
    setNickNameValue(nickName);
    setEditNickName(true);
  };

  // 닉네임 완료 버튼 클릭시
  const completeNickName = async () => {
    await updateProfile(authService.currentUser, {
      displayName: nickNamevalue,
    });
    await updateDoc(doc(db, 'user', authService.currentUser.uid), {
      nickname: nickNamevalue,
    });
    queryClient.invalidateQueries();
    toast.success('닉네임 수정 완료');
    setClickBtn(true);
    setEditNickName(false);
  };

  // 이미지 선탣
  const profileHandler = () => {
    inputImageRef.current.click();
  };

  // 이미지 수정
  const onFileChange = async (e) => {
    const theFile = e.target.files[0];
    if (theFile.size > 11300) {
      toast.warn('이미지 용량을 11KB 이하로 해주세요.');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(theFile);
    reader.onloadend = (e) => {
      const imgUrl = e.currentTarget.result;
      localStorage.setItem('imgUrl', imgUrl);
      updateDoc(doc(db, 'user', authService.currentUser.uid), {
        profileImg: imgUrl,
      });
    };
    queryClient.invalidateQueries();
    toast.success('프로필 이미지 수정 완료');
  };

  // 맞춤 정보 수장
  const EditStackBtn = () => {
    navigate('/onboardingedit');
  };

  return (
    <MyProfileBody>
      <ProfileSection>
        <ProfileSectionGap />
        <ProfileMocoText>마이 모코</ProfileMocoText>
        <NicknameImageBox>
          <NicknameTextBox>
            <NicaknameHello>안녕하세요</NicaknameHello>
            <ProfileEditBody>
              <ProfileNickNameBody>
                {editNickNameBtn ? (
                  <EditNickNameInput
                    value={nickNamevalue ? nickNamevalue : ''}
                    onChange={(e) => setNickNameValue(e.target.value)}
                  />
                ) : (
                  <ProfileNickName>
                    {profileUserInfo[0]?.nickname}님
                  </ProfileNickName>
                )}
                {clickEditBtn ? (
                  <ProfileNickNameBtn onClick={edditNickName}>
                    수정
                  </ProfileNickNameBtn>
                ) : (
                  <NickNameCompleteBtn onClick={completeNickName}>
                    완료
                  </NickNameCompleteBtn>
                )}
              </ProfileNickNameBody>
            </ProfileEditBody>
          </NicknameTextBox>

          <ProfileImageBody>
            <ProfileImage
              src={
                profileUserInfo[0]?.profileImg
                  ? profileUserInfo[0].profileImg
                  : default_profile
              }
              width="90"
              height="90"
              alt=""
            />
          </ProfileImageBody>
          <ProfileHeaderIcon>
            <img
              src={wheel}
              alt=""
              style={{ fontSize: '25px' }}
              onClick={profileHandler}
            />
          </ProfileHeaderIcon>
        </NicknameImageBox>

        <input
          type="file"
          onChange={onFileChange}
          ref={inputImageRef}
          style={{ display: 'none' }}
          accept="image/*"
        />

        <hr style={{ width: '305px' }} />

        <ProfileMiddleSection>
          <MiddleBody>
            <ProfileStackBody>
              <StackbodyTitle>온/오프라인</StackbodyTitle>
              <StackbodyText>
                {stackIsRemote ? '온라인' : '오프라인'}
              </StackbodyText>
            </ProfileStackBody>
            <ProfileStackBody>
              <StackbodyTitle>모임 장소</StackbodyTitle>
              <StackbodyText>서울시 {stackPlace}</StackbodyText>
            </ProfileStackBody>
            <ProfileStackBody>
              <StackbodyTitle>모임 시간</StackbodyTitle>
              <StackbodyText>{stackTime}</StackbodyText>
            </ProfileStackBody>
            <ProfileTechBody>
              <TechBodyTitle>기술 스택</TechBodyTitle>
              <TechBodyImage>
                {techStack?.map((item, idx) => (
                  <img
                    key={idx}
                    src={require(`../../../assets/stack/${item}.png`)}
                    alt={item}
                    style={{ width: 30, height: 30, marginRight: 10 }}
                  />
                ))}
              </TechBodyImage>
            </ProfileTechBody>
          </MiddleBody>
        </ProfileMiddleSection>

        <ProfileFooterBody>
          <ProfileStackBtn onClick={EditStackBtn}>
            맞춤정보 수정
          </ProfileStackBtn>
        </ProfileFooterBody>
      </ProfileSection>
    </MyProfileBody>
  );
};

export default Profile;
