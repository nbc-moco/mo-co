import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from '@firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { ImCancelCircle } from 'react-icons/im';
import { useLocation, useNavigate } from 'react-router';
import { useRecoilState } from 'recoil';
import defaultImg from '../../../src/assets/icon/user.png';
import Alarm from '../../assets/icon/Icon_Alarm.png';
import Search from '../../assets/icon/Icon_Search.png';
import { authService, db } from '../../common/firebase';
import headerToggle from '../../recoil/headerToggleState';
import {
  HeaderBody,
  HeaderInfoBody,
  HeaderLogo,
  NavigateMypage,
  LogoAndMateBox,
  MyCodingMate,
  TeamAndLoginBox,
  MakeTeam,
  LoginRoute,
  HeaderImage,
  HeaderDropDownListBox,
  HeaderDropDownList,
  HeaderImageBox,
  HeaderDropDownListSection,
  DropDownListBody,
  HeaderSearchBox,
  HeaderSearchInput,
  HeaderSearchDropDownListBox,
  HeaderSearchDropDownListSection,
  HeaderSearchXbuttonBox,
  HeaderSearchXbutton,
  HeaderNotiDropDownList,
  HeaderNotiDropDownListBox,
  SearchLayer,
  SearchModalLayer,
  SearchIconBox,
  HeaderUserIconBody,
} from './style';
import { toast } from 'react-toastify';

// import NotiBadge from './notification/NotiBadge';

const Header = () => {
  // 현제 경로
  const location = useLocation();
  const path = location.pathname;

  // 헤더 로그인 토글
  const [loginToggle, setLoginToggle] = useState(true);

  // 헤더  토글
  const [headerMyIcon, setHeaderMyIcon] = useState(false);

  // 검색창 토글
  const [searchIcon, setSearchIcon] = useState(false);

  // 검색창 currentTarget
  const searchRef = useRef(null);

  // 드랍다운
  const [dropDownClick, setDropDownClick] = useRecoilState(headerToggle);
  const [searchdropDownClick, setSearchdropDownClick] = useState(false);

  // 헤더 드랍다운 생성유뮤
  const [isUserDropDown, setIsUserDropDown] = useState(false);
  const [isSearchUserDropDown, setIsSearchUserDropDown] = useState(false);

  // 알람 드랍다운
  const [alarmDrop, setAlarmDrop] = useState(false);

  // 유저 정보 가져오기
  const [profileUserInfo, setProfileUserInfo] = useState([]);

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
    });
    return unsubscribe;
  };

  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        setIsUserDropDown(true);
        setLoginToggle(false);
        setHeaderMyIcon(true);
        setSearchIcon(true);
        getUserStackInfo();
        setIsSearchUserDropDown(true);
      } else if (!user) {
        setLoginToggle(true);
        setHeaderMyIcon(false);
        setSearchIcon(false);
        setIsUserDropDown(false);
        setIsSearchUserDropDown(false);
      }
    });
  }, []);

  const navigate = useNavigate();

  const navigateHome = () => {
    setDropDownClick(false);
    setSearchdropDownClick(false);
    navigate('/');
  };

  const navigateMyPage = () => {
    setSearchdropDownClick(false);
    navigate('/mypage');
  };

  // 헤더 로그인 페이지로 이동
  const navigateLoginPage = () => {
    if (loginToggle === true) {
      navigate('/login');
    }
  };

  // 내 코딩모임 페이지로 이동
  const navigateMyCodingMate = () => {
    setDropDownClick(false);
    setSearchdropDownClick(false);
    navigate(`/teamlist/${authService.currentUser.displayName}`);
  };

  // 검색 기능
  const [word, setWord] = useState('');
  const onChangeSearch = (e) => {
    // if (word === '') return;
    setWord(e.target.value);
  };
  const onSubmit = () => {
    navigate(`/search/${word}`);
  };
  const handleonKeyPress = (e) => {
    // Enter 키 입력 함수
    if (e.key === 'Enter' && word.length > 0) {
      onSubmit();
    }
    if (e.key === 'Enter' && word.length === 0) {
      toast.warn('검색어를 입력해주세요.');
    }
  };
  const searchdropDownHandler = () => {
    if (searchdropDownClick === false) {
      setSearchdropDownClick(true);
    }
    setDropDownClick(false);
  };
  const searchModalOutSideClick = (e) => {
    // 검색창 영역 밖 클릭하면 닫히게 하기
    if (searchRef.current === e.target) {
      setSearchdropDownClick(false);
    }
  };

  // 로그아웃
  const HeaderLogOut = async () => {
    // 구글, 깃헙 기존 정보 입력하기
    if (authService.currentUser.providerData[0].providerId === 'google.com') {
      await setDoc(doc(db, 'google', authService.currentUser.uid), {
        bookmarks: [...profileUserInfo[0]?.bookmarks],
        teamID: [...profileUserInfo[0]?.teamID],
        uid: authService.currentUser.uid,
        profileImg: profileUserInfo[0]?.profileImg,
        moreInfo: {
          u_isRemote: profileUserInfo[0]?.moreInfo.u_isRemote,
          u_location: profileUserInfo[0]?.moreInfo.u_location,
          u_stack: [...profileUserInfo[0]?.moreInfo.u_stack],
          u_time: profileUserInfo[0]?.moreInfo.u_time,
        },
      });
    } else if (
      authService.currentUser.providerData[0].providerId === 'github.com'
    ) {
      await setDoc(doc(db, 'github', authService.currentUser.uid), {
        bookmarks: [...profileUserInfo[0].bookmarks],
        teamID: [...profileUserInfo[0].teamID],
        uid: authService.currentUser.uid,
        profileImg: profileUserInfo[0].profileImg,
        moreInfo: {
          u_isRemote: profileUserInfo[0].moreInfo.u_isRemote,
          u_location: profileUserInfo[0].moreInfo.u_location,
          u_stack: [...profileUserInfo[0].moreInfo.u_stack],
          u_time: profileUserInfo[0].moreInfo.u_time,
        },
      });
    }
    authService.signOut();
    window.location.replace('/');
  };

  // 헤더 유무
  const locationNow = useLocation();
  if (locationNow.pathname === '/login' || locationNow.pathname === '/signup')
    return null;

  const dropDownHandler = () => {
    if (dropDownClick === false) {
      setDropDownClick(true);
    } else {
      setDropDownClick(false);
    }
    setSearchdropDownClick(false);
  };

  // 알람 드랍다운
  const alarmDropDown = () => {
    if (alarmDrop === false) {
      setAlarmDrop(true);
    } else {
      setAlarmDrop(false);
    }
  };

  return (
    <HeaderBody>
      <HeaderInfoBody>
        <LogoAndMateBox>
          <HeaderLogo onClick={navigateHome}></HeaderLogo>
          <MyCodingMate onClick={navigateMyCodingMate}>
            내 코딩모임 보기
          </MyCodingMate>
        </LogoAndMateBox>
        <TeamAndLoginBox>
          <MakeTeam
            onClick={() => {
              if (!authService.currentUser) {
                toast.warn('로그인이 필요합니다 :)');
              } else {
                setDropDownClick(false);
                setSearchdropDownClick(false);
                navigate('/write');
              }
            }}
          >
            팀 개설하기
          </MakeTeam>
          {/* <div>
            <img
              src={Alarm}
              alt="alarm"
              style={{ width: '20px', cursor: 'pointer' }}
              onClick={alarmDropDown}
            />
            {alarmDrop ? (
              <HeaderNotiDropDownListBox 
                style={{ position: 'absolute' }}
              >
                <HeaderDropDownListSection style={{padding: '10px'}}>
                  <HeaderNotiDropDownList>
                    <NotiBadge />
                  </HeaderNotiDropDownList>
                </HeaderDropDownListSection>
              </HeaderNotiDropDownListBox>
            ) : (
              ''
            )}
          </div> */}

          {searchIcon ? (
            <div onClick={searchdropDownHandler}>
              {searchdropDownClick ? (
                <>
                  <>
                    {isSearchUserDropDown ? (
                      <SearchIconBox>
                        <img
                          src={Search}
                          alt="search"
                          style={{ width: '20px' }}
                          onClick={() => setSearchdropDownClick(false)}
                        />
                      </SearchIconBox>
                    ) : (
                      ''
                    )}
                  </>

                  <>
                    <HeaderSearchDropDownListBox
                      style={{ position: 'absolute' }}
                    >
                      <HeaderSearchXbuttonBox>
                        <HeaderSearchXbutton
                          onClick={() => setSearchdropDownClick(false)}
                        >
                          <ImCancelCircle
                            color="white"
                            style={{ fontSize: '20px' }}
                          />
                        </HeaderSearchXbutton>
                      </HeaderSearchXbuttonBox>
                      <HeaderSearchDropDownListSection>
                        <HeaderSearchBox>
                          <img
                            src={Search}
                            alt="search"
                            style={{ width: '20px', marginLeft: '10px' }}
                          />
                          <HeaderSearchInput
                            onChange={onChangeSearch}
                            onKeyPress={handleonKeyPress}
                            placeholder="검색어를 입력해주세요."
                          />
                          {/* <HeaderSearchInputBtn type="button" onClick={onSubmit}>
                        검색
                      </HeaderSearchInputBtn> */}
                        </HeaderSearchBox>
                      </HeaderSearchDropDownListSection>
                      {/* <HeaderSearchDropDownHr /> */}
                    </HeaderSearchDropDownListBox>
                  </>
                </>
              ) : (
                <NavigateMypage>
                  <img src={Search} alt="search" style={{ width: '20px' }} />
                </NavigateMypage>
              )}
            </div>
          ) : (
            ''
          )}

          {/* 유저 아이콘 */}
          {headerMyIcon ? (
            <HeaderUserIconBody onClick={dropDownHandler}>
              {dropDownClick ? (
                <>
                  {isUserDropDown ? (
                    <NavigateMypage>
                      <img
                        src={defaultImg}
                        alt="user"
                        style={{
                          fontSize: '40px',
                          width: '40px',
                          height: '40px',
                        }}
                      />
                    </NavigateMypage>
                  ) : (
                    ''
                  )}
                  <HeaderDropDownListBox>
                    <HeaderImageBox>
                      <HeaderImage
                        src={profileUserInfo[0]?.profileImg ?? defaultImg}
                        alt="user"
                      />
                    </HeaderImageBox>
                    <HeaderDropDownListSection>
                      <DropDownListBody onClick={navigateMyPage}>
                        <HeaderDropDownList>마이페이지</HeaderDropDownList>
                      </DropDownListBody>
                      <DropDownListBody onClick={HeaderLogOut}>
                        <HeaderDropDownList>로그아웃</HeaderDropDownList>
                      </DropDownListBody>
                    </HeaderDropDownListSection>
                  </HeaderDropDownListBox>
                </>
              ) : (
                <NavigateMypage>
                  <img
                    src={defaultImg}
                    alt="user"
                    style={{ fontSize: '40px', width: '40px', height: '40px' }}
                  />
                </NavigateMypage>
              )}
            </HeaderUserIconBody>
          ) : (
            ''
          )}

          <LoginRoute onClick={navigateLoginPage}>
            {loginToggle ? '로그인' : ''}
          </LoginRoute>
        </TeamAndLoginBox>
      </HeaderInfoBody>
    </HeaderBody>
  );
};

export default Header;
