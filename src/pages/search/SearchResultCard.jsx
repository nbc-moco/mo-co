import styled from '@emotion/styled';
import { Tag } from 'antd';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BsBookmarkHeart } from 'react-icons/bs';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRecoilValue } from 'recoil';
import defaultImg from '../../assets/icon/user.png';
import { db } from '../../common/firebase';
import authState from '../../recoil/authState';

const SearchResultCard = (item) => {
  const user = useRecoilValue(authState);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const bookmark = item.bookmark;

  // HTML을 plain text로 변환
  const parsedHtml = item.partyDesc?.replace(/(<([^>]+)>)/gi, '');

  // 북마크 핸들링 함수
  const handleBookmark = async () => {
    // 현재 유저 문서 가져오기
    const userDoc = await getDoc(doc(db, 'user', user?.uid));
    const userData = userDoc.data();
    const bookmarks = await userData.bookmarks;

    // 현재 유저의 bookmarks에 해당 게시물이 없을 때
    if (!bookmarks.includes(item.id)) {
      try {
        // post 컬렉션의 해당 게시물의 bookmark 필드 +1
        await updateDoc(doc(db, 'post', item.id), {
          bookmark: bookmark + 1,
        });
        // user 컬렉션의 해당 유저의 bookmarks 필드에 해당 게시물 id 추가
        await updateDoc(doc(db, 'user', user?.uid), {
          bookmarks: [...bookmarks, item.id],
        });
        queryClient.invalidateQueries('posts');
      } catch {
        toast.warn('다시 시도해주세요');
      }
    }

    // 현재 유저의 bookmarks에 해당 게시물이 있을 때
    if (bookmarks.includes(item.id)) {
      try {
        // post 컬렉션의 해당 게시물의 bookmark 필드 -1
        await updateDoc(doc(db, 'post', item.id), {
          bookmark: bookmark - 1,
        });
        // user 컬렉션의 해당 유저의 bookmarks 필드에 해당 게시물 id 삭제
        await updateDoc(doc(db, 'user', user?.uid), {
          bookmarks: bookmarks.filter((bookmark) => bookmark !== item.id),
        });
        queryClient.invalidateQueries('posts');
      } catch {
        toast.warn('다시 시도해주세요');
      }
    }
  };

  return (
    <PostCard>
      <BookmarkIconBox>
        <LoactionAndTimeBox>
          <Location>{item.isRemote ? '비대면' : item.partyLocation}</Location>
          <Time>{item.partyTime}</Time>
        </LoactionAndTimeBox>
        {/* <span>{item.bookmark}</span> */}
        <Bookmark>
          <span>{item.bookmark}</span>
          <BsBookmarkHeart
            onClick={handleBookmark}
            cursor="pointer"
            size="20px"
            color="white"
          />
        </Bookmark>
      </BookmarkIconBox>

      <PostBox>
        <PostTitle
          onClick={() => {
            navigate(`/matedetail/${item.id}`, { state: { item } });
          }}
        >
          {item.partyPostTitile}
        </PostTitle>
        <PostDesc>{parsedHtml}</PostDesc>
        <TechStackIcon>
          {item.partyStack?.map((item, idx) => (
            <img
              key={idx}
              src={require(`../../assets/stack/${item}.png`)}
              alt={item}
              style={{ width: 30, height: 30, marginRight: 5 }}
            />
          ))}
        </TechStackIcon>
      </PostBox>

      <HorizontalLine />

      <PartyStatusBox>
        <RecruitingBox>
          <Recruiting>모집 현황</Recruiting>
        </RecruitingBox>
        <HeadCountBox>
          {item.partyIsOpen === true ? (
            <span style={{ color: 'white' }}>모집중</span>
          ) : (
            <span style={{ color: 'white' }}>모집완료</span>
          )}
          <HeadCount>{`: 1 / ${item.partyNum}`}</HeadCount>
        </HeadCountBox>
      </PartyStatusBox>

      <PostInfo>
        <ProfileBox>
          <ProfileImage
            src={!item.profileImg ? defaultImg : item.profileImg}
          ></ProfileImage>
          <NickName>{item.nickName}</NickName>
        </ProfileBox>
        <InfoBox>
          {/* <GrFormView size="24px" />
          <PostView>12</PostView>
          <FaRegCommentDots size="15px" />
          <PostComments>3</PostComments> */}
        </InfoBox>
      </PostInfo>
    </PostCard>
  );
};

export default SearchResultCard;

const PostCard = styled.div`
  /* border: 1px solid black; */
  border-radius: 20px;
  flex-basis: 245px;
  padding: 24px;
  flex-grow: 0;
  flex-shrink: 0;
  width: 280px;
  height: 234px;
  display: flex;
  flex-direction: column;
  background-color: #232323;
  border: 1px solid #3b3b3b;
`;

const BookmarkIconBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  align-items: center;
`;

const LoactionAndTimeBox = styled.div`
  display: flex;
  gap: 6px;
`;

const Location = styled.div`
  width: 85px;
  height: 26px;
  color: white;
  background-color: black;
  border-radius: 20px;
  text-align: center;
  line-height: 26px;
`;

const Time = styled.div`
  width: 80px;
  height: 26px;
  color: white;
  background-color: black;
  border-radius: 20px;
  text-align: center;
  line-height: 26px;
`;

const Bookmark = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
`;

const PostBox = styled.div`
  margin-bottom: 22px;
  display: inline-block;
  width: 24%;
  margin: 2%;
`;

const PostTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
  width: 245px;
  height: 24px;
  cursor: pointer;
  font-size: 1.3em;
  color: white;
  font-weight: 600;
  &:hover {
    color: #531cab;
  }
`;

const PostDesc = styled.div`
  display: inline-block;
  width: 240px;
  height: 20px;
  margin-bottom: 20px;
  color: #b6b6b6;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
  margin-top: 6px;
`;

const PartyStatusBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const HeadCountBox = styled.div`
  display: flex;
  align-items: center;
`;

const HeadCount = styled.div`
  font-size: 15px;
  color: white;
`;

const RecruitingBox = styled.div`
  display: flex;
  align-items: center;
`;

const Recruiting = styled.div`
  font-size: 15px;
  color: #6c6c6c;
`;

const TechStackIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 240px;
  margin-bottom: 16px;
`;

const HorizontalLine = styled.div`
  border: 0.1px solid #3b3b3b;
  width: 100%;
  margin: auto;
  color: #3b3b3b;
`;

const PostInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  position: relative;
  left: -25px;
`;

const ProfileBox = styled.div`
  display: flex;
  align-items: center;
`;

const ProfileImage = styled.img`
  background-color: grey;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  margin-right: 10px;
`;

const NickName = styled.div`
  width: 70px;
  height: 20px;
  font-size: 15px;
  color: white;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
`;

const PostView = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  font-size: 15px;
`;

const PostComments = styled.div`
  display: flex;
  align-items: center;
  margin-left: 5px;
  font-size: 15px;
`;

//<Tag key={idx} style={{ fontSize: 12 }} color="red">
//            {item}
//        </Tag>
