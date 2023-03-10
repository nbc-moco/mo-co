import styled from '@emotion/styled';
import { useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { db } from '../../common/firebase';
import Pagenation from '../../components/pagenation/Pagenation';
import usePosts from '../../hooks/usePost';
import authState from '../../recoil/authState';
import headerToggle from '../../recoil/headerToggleState';
import CardSection from '../../shared/CardSection';
import FilterLocation from '../../shared/FilterLocation';
import FilterNumOfMember from '../../shared/FilterNumOfMember';
import FilterTech from '../../shared/FilterTech';
import FilterTime from '../../shared/FilterTime';

const MateList = () => {
  const user = useRecoilValue(authState);
  const { data, isLoading, isError, error } = usePosts();
  const [selectedTech, setSelectedTech] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedNumOfMember, setSelectedNumOfMember] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [userBookmark, setUserBookmark] = useState([]);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(12);

  // selectedTech 배열을 텍스트로 변환
  const selectedTechText = [...selectedTech]
    .map((item) => item.value)
    .join(',');

  // 페이지네이션 핸들러
  const handleChange = (page) => {
    setMinValue(page * 12 - 12);
    setMaxValue(page * 12);
  };

  // 필터 옵션 선택 핸들러
  const handleSelectTech = (tech) => {
    setSelectedTech(tech);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
  };

  const handleSelectNumOfMember = (numOfMember) => {
    setSelectedNumOfMember(numOfMember);
  };

  let DATA = data?.filter((item) => item.isDeleted === false);

  // 기술을 여러 개 선택했을 때는 필터가 작동을 안 함
  if (selectedTech.length > 0) {
    DATA = DATA.filter((item) => item.partyStack.includes(selectedTechText));
  }

  if (selectedLocation) {
    DATA = DATA.filter((item) => item.partyLocation === selectedLocation.value);
  }

  if (selectedTime) {
    DATA = DATA.filter((item) => item.partyTime === selectedTime.value);
  }

  if (selectedNumOfMember) {
    DATA = DATA.filter((item) => item.partyNum === selectedNumOfMember.value);
  }

  if (selectedSort === 'byRecommend') {
    DATA = DATA.sort((a, b) => b.bookmark - a.bookmark);
  }

  if (selectedSort === 'byNewest') {
    DATA = DATA.sort((a, b) => b.createdAt - a.createdAt);
  }

  const [dropDownClick, setDropDownClick] = useRecoilState(headerToggle);

  return (
    <FullScreen onClick={() => setDropDownClick(false)}>
      {/* 필터 & 정렬 */}
      <MateListTitle>모임 전체보기</MateListTitle>
      <ViewOptions>
        <FilterBox>
          <FilterTech onSelectedTech={handleSelectTech} />
          <FilterLocation onSelectedLoaction={handleSelectLocation} />
          <FilterTime onSelectedTime={handleSelectTime} />
          <FilterNumOfMember onSelectedPeople={handleSelectNumOfMember} />
        </FilterBox>
        <SortBox>
          <SortByRecommend
            style={{
              color: selectedSort === 'byRecommend' ? '#FEFF80' : 'white',
              textDecoration: selectedSort === 'byRecommend' ? 'underline' : '',
            }}
            onClick={() => {
              setSelectedSort('byRecommend');
            }}
          >
            스크랩순
          </SortByRecommend>
          <SortByNew
            style={{
              color: selectedSort === 'byNewest' ? '#FEFF80' : 'white',

              textDecoration: selectedSort === 'byNewest' ? 'underline' : '',
            }}
            onClick={() => {
              setSelectedSort('byNewest');
            }}
          >
            최신순
          </SortByNew>
        </SortBox>
      </ViewOptions>

      {/* 카드 리스트 */}
      <CardListContainer>
        <>
          {DATA?.length > 0 ? (
            <CardList>
              {DATA &&
                DATA.length > 0 &&
                DATA.slice(minValue, maxValue).map((item) => (
                  <CardSection key={item.id} item={item} db={db} />
                ))}
            </CardList>
          ) : (
            <NoResult>
              <NoResultMessage>
                ⚠️<br></br>찾는 모임이 없습니다<br></br>원하는 모임을 만들어
                보세요 :)
              </NoResultMessage>
            </NoResult>
          )}
        </>
      </CardListContainer>

      {/* 페이지 */}
      <PaginationContainer>
        <Pagenation handleChange={handleChange} DATA={DATA} />
      </PaginationContainer>
    </FullScreen>
  );
};

export default MateList;

const FullScreen = styled.body`
  background-color: #111111;
  height: 100%;
  min-height: 100vh;
  width: 100%;
  padding: 0 72px;
`;

const MateListTitle = styled.div`
  max-width: 75rem;
  margin: 0 auto;
  color: white;
  font-size: 2em;
  font-weight: 500;
  padding-top: 1.3em;
  margin-bottom: 1em;
`;

// 필터 & 정렬
const ViewOptions = styled.div`
  max-width: 75rem;
  padding-top: 1em;
  padding-bottom: 1em;
  padding-left: 1em;
  padding-right: 2em;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const FilterBox = styled.div`
  display: flex;
  gap: 1em;
`;

const SortBox = styled.div`
  display: flex;
  gap: 1em;
`;

const SortByRecommend = styled.div`
  cursor: pointer;
  color: white;
`;
const SortByNew = styled.div`
  cursor: pointer;
  color: white;
`;

// 카드 리스트
const CardListContainer = styled.section`
  max-width: 75rem;
  width: 100%;
  height: 100%;
  margin: 0 auto;
`;

const CardList = styled.div`
  max-width: 75rem;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1em;
  row-gap: 5em;
`;

// 페이지네이션
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  /* margin: 48px; */
  /* margin-top: 6.875rem; */
  padding: 96px;
  background-color: #111111;
`;

const NoResult = styled.div`
  background-color: #232323;
  max-width: 75rem;
  width: 100%;
  height: 18.75rem;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1.25rem;
`;

const NoResultMessage = styled.div`
  color: #feff80;
  text-align: center;
  line-height: 32px;
  font-size: 19.2px;
`;
