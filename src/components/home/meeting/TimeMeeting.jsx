import {
  TimeMeetingArea,
  MeetingTitleBox,
  MeetingCardBox,
  TimeMeetingTitle,
  MeetingMoreBox,
  TimeMeetingInnerSection1,
  TimeMeetingCardBox,
  TimeMeetingInnerSection2,
  TimeMeetingInnerBox,
} from '../../homestyle/homemeeting';
import CardSection from '../../../shared/CardSection';
import { db } from '../../../common/firebase';
import { MdExpandMore } from 'react-icons/md';
import { useQueries, useQuery } from 'react-query';
import { getPost, getUser } from '../../../common/utils/getApi';
import { useEffect, useState } from 'react';

const TimeMeeting = ({ recommendTimeList }) => {
  // const [recommendTimeList, setRecommendTimeList] = useState([]);
  // const result = useQueries([
  //   {
  //     queryKey: ['user'],
  //     queryFn: getUser,
  //   },
  //   {
  //     queryKey: ['post'],
  //     queryFn: getPost,
  //   },
  // ]);

  // useEffect(() => {
  //   console.log(result); // [{rune 정보, data: [], isSucces: true ...}, {spell 정보, data: [], isSucces: true ...}]
  //   const loadingFinishAll = result.some((result) => result.isLoading);
  //   console.log(loadingFinishAll); // loadingFinishAll이 false이면 최종 완료

  //   if (loadingFinishAll === false) {
  //     const newrecommendTimeList = result[1]?.data?.filter((item) =>
  //       item.partyTime.includes(result[0]?.data[0]?.moreInfo.u_time),
  //     );

  //     if (
  //       result[1]?.data?.length > 0 &&
  //       newrecommendTimeList?.length > 0 &&
  //       recommendTimeList?.length === 0
  //     ) {
  //       setRecommendTimeList(newrecommendTimeList);
  //     }
  //   }
  // }, [result, recommendTimeList]);

  // console.log('recommendTimeList', recommendTimeList);
  // useEffect(() => {
  //   console.log(result); // [{rune 정보, data: [], isSucces: true ...}, {spell 정보, data: [], isSucces: true ...}]
  //   const loadingFinishAll = result.some((result) => result.isLoading);
  //   console.log(loadingFinishAll); // loadingFinishAll이 false이면 최종 완료
  //   // if (loadingFinishAll) return;

  //   // const newrecommendTimeList = result[1].data?.filter((item) =>
  //   // item.partyTime.includes(result[0].data[0].moreInfo.u_time)
  //   // );
  //   // setRecommendTimeList(newrecommendTimeList);
  //   //무한루프 도는 이유 모르겠음
  // }, [result]);

  return (
    <TimeMeetingArea>
      <TimeMeetingInnerSection1>
      <MeetingTitleBox>
        <TimeMeetingTitle>시간대가 맞는 모임</TimeMeetingTitle>
      </MeetingTitleBox>
      </TimeMeetingInnerSection1>
      <TimeMeetingInnerSection2>
        <TimeMeetingInnerBox />
      <TimeMeetingCardBox>
        {recommendTimeList?.length > 0 &&
          recommendTimeList
            .slice(0, 3)
            .map((item, idx) => (
              <CardSection
                key={`시간대가 맞는 모임 ${idx}`}
                item={item}
                db={db}
              />
            ))}
      </TimeMeetingCardBox>
      </TimeMeetingInnerSection2>
    </TimeMeetingArea>
  );
};

export default TimeMeeting;
