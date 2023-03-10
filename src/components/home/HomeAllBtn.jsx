import { useNavigate } from 'react-router';
import { AllBtnContainer, AllBtnTitle } from '../homestyle/homeallbutton';

const HomeAllBtn = () => {
  const navigate = useNavigate();
  const goTomate = () => {
    navigate('/mate');
  };

  return (
    <AllBtnContainer>
      <AllBtnTitle onClick={goTomate}>전체 보기</AllBtnTitle>
    </AllBtnContainer>
  );
};

export default HomeAllBtn;
